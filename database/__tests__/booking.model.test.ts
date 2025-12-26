import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Event } from '../event.model';
import { Booking } from '../booking.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clean all collections between tests to keep them isolated.
  const { collections } = mongoose.connection;

  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

function buildValidEventAttrs() {
  return {
    title: 'My Amazing Event!',
    description: 'A detailed description for the event',
    overview: 'A short overview',
    image: 'https://example.com/image.png',
    venue: 'Main Hall',
    location: 'New York',
    date: '2025-01-02',
    time: '09:30',
    mode: 'in-person',
    audience: 'developers',
    agenda: ['welcome', 'keynote'],
    organizer: 'Bongo Express',
    tags: ['tech', 'conference'],
  } as const;
}

describe('Booking model', () => {
  test('booking creation with valid data should succeed and include timestamps', async () => {
    const event = await Event.create(buildValidEventAttrs());

    const booking = await Booking.create({
      eventId: event._id,
      email: 'user@example.com',
    });

    expect(booking._id).toBeDefined();
    expect(booking.createdAt).toBeInstanceOf(Date);
    expect(booking.updatedAt).toBeInstanceOf(Date);
  });

  test('booking creation with an invalid email format should throw a validation error', async () => {
    const event = await Event.create(buildValidEventAttrs());

    await expect(
      Booking.create({
        eventId: event._id,
        email: 'not-a-valid-email',
      })
    ).rejects.toThrow('A valid email address is required');
  });

  test('booking creation with a non-existent event ID should throw an error', async () => {
    const nonExistentEventId = new mongoose.Types.ObjectId();

    await expect(
      Booking.create({
        eventId: nonExistentEventId,
        email: 'user@example.com',
      })
    ).rejects.toThrow('Cannot create booking: referenced event does not exist');
  });
});
