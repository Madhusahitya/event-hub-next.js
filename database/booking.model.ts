import { HydratedDocument, Model, Schema, Types, model, models } from "mongoose";
import Event from "./event.model";

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

type BookingAttrs = {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

const bookingSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

type BookingDocument = HydratedDocument<BookingAttrs>;
type BookingModel = Model<BookingAttrs>;

// Validate referenced event existence and email format before saving.
bookingSchema.pre<BookingDocument>("save", async function (next) {
  if (!Types.ObjectId.isValid(this.eventId)) {
    return next(new Error("Invalid eventId format"));
  }

  if (!emailRegex.test(this.email)) {
    return next(new Error("Invalid email address"));
  }

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    return next(new Error("Referenced event does not exist"));
  }

  return next();
});

export type { BookingDocument };

let bookingModel = models.Booking as unknown as BookingModel | undefined;
if (!bookingModel) {
  bookingModel = model(
    "Booking",
    bookingSchema,
    "bookings" // explicit collection name for clarity
  ) as unknown as BookingModel;
}

if (!bookingModel) {
  throw new Error("Failed to initialize Booking model");
}

const Booking: BookingModel = bookingModel;

export default Booking;
