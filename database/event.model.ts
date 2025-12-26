import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Public shape of an Event document
export interface EventAttrs {
  title: string;
  slug?: string; // will be generated from title
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (YYYY-MM-DD)
  time: string; // stored as HH:mm (24-hour clock)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

// Full Mongoose document including timestamps
export interface EventDocument extends EventAttrs, Document<Types.ObjectId> {
  createdAt: Date;
  updatedAt: Date;
}

export interface EventModel extends Model<EventDocument> {}

/**
 * Simple slug generator to convert titles like "My Event Title!" into
 * "my-event-title". This avoids adding an extra dependency.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace whitespace with dashes
    .replace(/-+/g, '-'); // collapse multiple dashes
}

/**
 * Normalize a date string to ISO date format (YYYY-MM-DD).
 * Accepts values parsable by `Date` and throws on invalid dates.
 */
function normalizeDateToISO(dateInput: string): string {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid event date');
  }

  // Extract YYYY-MM-DD portion from the full ISO string
  return date.toISOString().slice(0, 10);
}

/**
 * Normalize time to 24-hour HH:mm format.
 * Accepts values like "9:00", "09:00", "21:30" and throws on invalid times.
 */
function normalizeTimeToHHmm(timeInput: string): string {
  const trimmed = timeInput.trim();

  // Basic HH:mm or H:mm validation (24-hour clock)
  const match = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) {
    throw new Error('Invalid event time; expected HH:mm (24-hour) format');
  }

  const hours = match[1].padStart(2, '0');
  const minutes = match[2];

  return `${hours}:${minutes}`;
}

const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]): boolean {
          return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        },
        message: 'Agenda must be a non-empty array of non-empty strings',
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]): boolean {
          return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        },
        message: 'Tags must be a non-empty array of non-empty strings',
      },
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
    strict: true,
  }
);

// Ensure slug has a unique index at the database level as well.
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook responsible for:
 * - Validating that required string fields are non-empty after trimming.
 * - Generating a URL-friendly slug from the title (only when title changes).
 * - Normalizing date and time into consistent formats.
 */
EventSchema.pre<EventDocument>('save', function preSave(next) {
  try {
    const doc = this;

    // Validate that required string fields are non-empty after trimming.
    const requiredStringFields: Array<keyof EventAttrs> = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of requiredStringFields) {
      const value = doc[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Field "${String(field)}" is required and must be a non-empty string`);
      }
    }

    // Generate or update slug only if the title has been modified.
    if (doc.isModified('title') || !doc.slug) {
      doc.slug = generateSlug(doc.title);
    }

    // Normalize date and time formats.
    doc.date = normalizeDateToISO(doc.date);
    doc.time = normalizeTimeToHHmm(doc.time);

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ??
  mongoose.model<EventDocument, EventModel>('Event', EventSchema);

export default Event;
