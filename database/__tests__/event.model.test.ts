import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Event } from '../event.model';

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

function buildBaseEventAttrs() {
  return {
    title: 'My Test Event!',
    description: 'A detailed description for the event',
    overview: 'A short overview',
    image: 'https://example.com/event.png',
    venue: 'Main Hall',
    location: 'New York',
    date: '2025-01-02T10:20:00.000Z',
    time: '9:05',
    mode: 'in-person',
    audience: 'developers',
    agenda: ['welcome', 'keynote'],
    organizer: 'Bongo Express',
    tags: ['tech', 'conference'],
  } as const;
}

describe('Event model', () => {
  test('event creation with valid data should generate a slug and normalize date/time', async () => {
    const event = await Event.create(buildBaseEventAttrs());

    expect(event._id).toBeDefined();
    expect(event.slug).toBe('my-test-event');
    expect(event.date).toBe('2025-01-02');
    expect(event.time).toBe('09:05');
    expect(event.createdAt).toBeInstanceOf(Date);
    expect(event.updatedAt).toBeInstanceOf(Date);
  });

  test('event creation with empty required string fields should throw validation errors', async () => {
    const base = buildBaseEventAttrs();

    await expect(
      Event.create({
        ...base,
        title: '',
      })
    ).rejects.toThrow('Field "title" is required and must be a non-empty string');
  });

  test('event creation with an invalid date should throw a validation error', async () => {
    const base = buildBaseEventAttrs();

    await expect(
      Event.create({
        ...base,
        date: 'not-a-date',
      })
    ).rejects.toThrow('Invalid event date');
  });

  test('event creation with an invalid time should throw a validation error', async () => {
    const base = buildBaseEventAttrs();

    await expect(
      Event.create({
        ...base,
        time: '25:00',
      })
    ).rejects.toThrow('Invalid event time; expected HH:mm (24-hour) format');
  });

  test('event creation with empty agenda and tags arrays should throw validation errors', async () => {
    const base = buildBaseEventAttrs();

    await expect(
      Event.create({
        ...base,
        agenda: [],
      })
    ).rejects.toThrow('Agenda must be a non-empty array of non-empty strings');

    await expect(
      Event.create({
        ...base,
        tags: [],
      })
    ).rejects.toThrow('Tags must be a non-empty array of non-empty strings');
  });
});
