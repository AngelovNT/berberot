import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUserDocument extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'barber' | 'customer'
  barberShopId?: mongoose.Types.ObjectId
  isActive: boolean
  photo: string
  phone?: string
  emailVerified: boolean
  emailVerificationToken?: string
  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'barber', 'customer'], required: true },
    barberShopId: { type: Schema.Types.ObjectId, ref: 'BarberShop' },
    isActive: { type: Boolean, default: true },
    photo: { type: String, default: '' },
    phone: { type: String, default: '' },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema)

export default User
