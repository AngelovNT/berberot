import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IServiceDocument extends Document {
  barberShopId: mongoose.Types.ObjectId
  name: string
  price: number
  duration: number
}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    barberShopId: { type: Schema.Types.ObjectId, ref: 'BarberShop', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 5 },
  },
  { timestamps: true }
)

const Service: Model<IServiceDocument> =
  mongoose.models.Service ?? mongoose.model<IServiceDocument>('Service', ServiceSchema)

export default Service
