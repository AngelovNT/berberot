import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWorkingHoursDocument extends Document {
  barberId: mongoose.Types.ObjectId
  schedule: mongoose.Schema.Types.Mixed
  bufferMinutes: number
}

const WorkingHoursSchema = new Schema<IWorkingHoursDocument>(
  {
    barberId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    schedule: { type: Schema.Types.Mixed, default: {} },
    bufferMinutes: { type: Number, default: 0, min: 0, max: 60 },
  },
  { timestamps: true }
)

const WorkingHours: Model<IWorkingHoursDocument> =
  mongoose.models.WorkingHours ??
  mongoose.model<IWorkingHoursDocument>('WorkingHours', WorkingHoursSchema)

export default WorkingHours
