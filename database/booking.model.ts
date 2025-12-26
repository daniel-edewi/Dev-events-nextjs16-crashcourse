import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Event, EventDocument } from './event.model';

// Public shape of a Booking document
export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

// Full Mongoose document including timestamps
export interface BookingDocument extends BookingAttrs, Document<Types.ObjectId> {
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingModel extends Model<BookingDocument> {}

/**
 * Basic email validation using a conservative regular expression.
 * For production-grade validation, additional checks can be layered on top.
 */
function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  // RFC 5322-compliant patterns are large; this is a practical, conservative subset.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index for faster lookups by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Additional explicit index on eventId (already set via `index: true` above, but kept for clarity).
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook responsible for:
 * - Verifying that the referenced Event exists.
 * - Ensuring that the email field is present and properly formatted.
 */
BookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  try {
    const doc = this;

    if (!doc.eventId) {
      throw new Error('eventId is required');
    }

    // Validate email format using a dedicated helper.
    if (typeof doc.email !== 'string' || doc.email.trim().length === 0 || !isValidEmail(doc.email)) {
      throw new Error('A valid email address is required');
    }

    // Ensure the referenced Event document exists before saving the booking.
    const eventExists: EventDocument | null = await Event.findById(doc.eventId).select('_id').lean<EventDocument | null>();

    if (!eventExists) {
      throw new Error('Cannot create booking: referenced event does not exist');
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ??
  mongoose.model<BookingDocument, BookingModel>('Booking', BookingSchema);

export default Booking;
