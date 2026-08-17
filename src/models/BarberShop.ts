import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBarberShopDocument extends Document {
  name: string
  location: string
  ownerId: mongoose.Types.ObjectId
  isActive: boolean
  coverImage: string
  description: string
  instagram: string
  facebook: string
  website: string
  promoVideo: string
}

const BarberShopSchema = new Schema<IBarberShopDocument>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    coverImage: { type: String, default: '' },
    description: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    website: { type: String, default: '' },
    promoVideo: { type: String, default: '' },
  },
  { timestamps: true }
)

const BarberShop: Model<IBarberShopDocument> =
  mongoose.models.BarberShop ?? mongoose.model<IBarberShopDocument>('BarberShop', BarberShopSchema)

export default BarberShop
