import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBlockedDateDocument extends Document {
  barberId: mongoose.Types.ObjectId
  date: string
  reason?: string
}

const BlockedDateSchema = new Schema<IBlockedDateDocument>(
  {
    barberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
)

BlockedDateSchema.index({ barberId: 1, date: 1 }, { unique: true })

const BlockedDate: Model<IBlockedDateDocument> =
  mongoose.models.BlockedDate ?? mongoose.model<IBlockedDateDocument>('BlockedDate', BlockedDateSchema)

export default BlockedDate
