import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBookingDocument extends Document {
  barberId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  serviceId: mongoose.Types.ObjectId
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  phone?: string
  rating?: number
  reviewText?: string
  reminderSent?: boolean
  recurrenceWeeks?: number
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    barberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'confirmed',
    },
    phone: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    reviewText: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false },
    recurrenceWeeks: { type: Number, min: 1, max: 12 },
  },
  { timestamps: true }
)

BookingSchema.index({ barberId: 1, date: 1, status: 1 })

const Booking: Model<IBookingDocument> =
  mongoose.models.Booking ?? mongoose.model<IBookingDocument>('Booking', BookingSchema)

export default Booking
