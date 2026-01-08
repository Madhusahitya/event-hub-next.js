import {
  InferSchemaType,
  HydratedDocument,
  Model,
  Schema,
  model,
  models,
} from "mongoose";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeDate = (value: string): string | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const normalizeTime = (value: string): string | null => {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(trimmed);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();

  if (meridiem) {
    if (hours === 12) hours = 0;
    hours += meridiem === "PM" ? 12 : 0;
  }

  if (hours > 23 || Number(minutes) > 59) return null;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const requiredStringFields: Array<
  keyof Pick<
    InferSchemaType<typeof eventSchema>,
    | "title"
    | "description"
    | "overview"
    | "image"
    | "venue"
    | "location"
    | "date"
    | "time"
    | "mode"
    | "audience"
    | "organizer"
  >
> = [
  "title",
  "description",
  "overview",
  "image",
  "venue",
  "location",
  "date",
  "time",
  "mode",
  "audience",
  "organizer",
];

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0 && arr.every((v) => v.trim().length > 0),
        message: "Agenda must contain at least one non-empty item",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0 && arr.every((v) => v.trim().length > 0),
        message: "Tags must contain at least one non-empty item",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

type EventDocument = HydratedDocument<InferSchemaType<typeof eventSchema>>;

// Ensure required fields are present, normalize date/time, and generate slug when title changes.
eventSchema.pre<EventDocument>("save", function (next) {
  for (const field of requiredStringFields) {
    const value: string | undefined = this.get(field);
    if (typeof value !== "string" || value.trim().length === 0) {
      return next(new Error(`${field} is required and cannot be empty`));
    }
    this.set(field, value.trim());
  }

  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  const normalizedDate = normalizeDate(this.date);
  if (!normalizedDate) {
    return next(new Error("Invalid date format; expected a parsable date string"));
  }
  this.date = normalizedDate;

  const normalizedTime = normalizeTime(this.time);
  if (!normalizedTime) {
    return next(new Error("Invalid time format; expected HH:MM or HH:MM AM/PM"));
  }
  this.time = normalizedTime;

  return next();
});

export type { EventDocument };

let eventModel = models.Event as unknown as Model<EventDocument> | undefined;
if (!eventModel) {
  eventModel = model(
    "Event",
    eventSchema,
    "events" // explicit collection name for clarity
  ) as unknown as Model<EventDocument>;
}

const Event: Model<EventDocument> = eventModel;

export default Event;
