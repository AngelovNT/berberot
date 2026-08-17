import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBarberClientMetaDocument extends Document {
  barberId: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  notes: string
  isFavorite: boolean
}

const BarberClientMetaSchema = new Schema<IBarberClientMetaDocument>(
  {
    barberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
)

BarberClientMetaSchema.index({ barberId: 1, clientId: 1 }, { unique: true })

const BarberClientMeta: Model<IBarberClientMetaDocument> =
  mongoose.models.BarberClientMeta ??
  mongoose.model<IBarberClientMetaDocument>('BarberClientMeta', BarberClientMetaSchema)

export default BarberClientMeta
