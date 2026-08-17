import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.SEED_DB_URI || 'mongodb://localhost:27017/clipr'

// ── Minimal schemas (enough to insert data) ──────────────────────────────────
const User        = mongoose.models.User        || mongoose.model('User',        new mongoose.Schema({ name:String, email:{type:String,unique:true,lowercase:true}, password:String, role:String, barberShopId:{type:mongoose.Schema.Types.ObjectId,ref:'BarberShop'}, isActive:{type:Boolean,default:true}, emailVerified:{type:Boolean,default:true}, photo:{type:String,default:''}, phone:{type:String,default:''} }, { timestamps:true }))
const BarberShop  = mongoose.models.BarberShop  || mongoose.model('BarberShop',  new mongoose.Schema({ name:String, location:String, ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, isActive:{type:Boolean,default:true}, coverImage:{type:String,default:''}, description:{type:String,default:''}, instagram:{type:String,default:''}, facebook:{type:String,default:''}, website:{type:String,default:''}, promoVideo:{type:String,default:''} }, { timestamps:true }))
const Service     = mongoose.models.Service     || mongoose.model('Service',     new mongoose.Schema({ barberShopId:{type:mongoose.Schema.Types.ObjectId,ref:'BarberShop'}, name:String, price:Number, duration:Number }, { timestamps:true }))
const WorkingHours= mongoose.models.WorkingHours|| mongoose.model('WorkingHours',new mongoose.Schema({ barberId:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true}, schedule:{type:mongoose.Schema.Types.Mixed,default:{}}, bufferMinutes:{type:Number,default:0} }))
const Booking     = mongoose.models.Booking     || mongoose.model('Booking',     new mongoose.Schema({ barberId:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, serviceId:{type:mongoose.Schema.Types.ObjectId,ref:'Service'}, date:String, startTime:String, endTime:String, status:{type:String,default:'confirmed'}, phone:{type:String,default:''}, rating:Number, reviewText:{type:String,default:''}, reminderSent:{type:Boolean,default:false} }, { timestamps:true }))

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  // Wipe everything
  await Promise.all([
    User.deleteMany({}),
    BarberShop.deleteMany({}),
    Service.deleteMany({}),
    WorkingHours.deleteMany({}),
    Booking.deleteMany({}),
    mongoose.connection.collection('barberclientmetas').deleteMany({}),
    mongoose.connection.collection('blockeddates').deleteMany({}),
  ])
  console.log('Cleared all collections')

  const h = (pw) => bcrypt.hash(pw, 10)

  // ── Shops ──────────────────────────────────────────────────────────────────
  const shop1 = await BarberShop.create({ name: 'The Fade Factory', location: '12 Main Street, Dublin', isActive: true, description: 'Premier barbershop in the heart of Dublin. Specialising in fades, crops and beard work.', instagram: 'fadefactory_dub' })
  const shop2 = await BarberShop.create({ name: 'Sharp Blades',     location: '88 Patrick Street, Cork', isActive: true, description: 'Two expert barbers. Classic cuts and modern styles in Cork city centre.', instagram: 'sharpblades_cork' })

  // ── Barbers ────────────────────────────────────────────────────────────────
  const marco = await User.create({ name: 'Marco Rossi', email: 'marco@berberot.com', password: await h('barber123'), role: 'barber', barberShopId: shop1._id, isActive: true, phone: '+353 87 111 1111' })
  const jake  = await User.create({ name: 'Jake Murphy', email: 'jake@berberot.com',  password: await h('barber123'), role: 'barber', barberShopId: shop2._id, isActive: true, phone: '+353 87 222 2222' })
  const liam  = await User.create({ name: 'Liam Walsh',  email: 'liam@berberot.com',  password: await h('barber123'), role: 'barber', barberShopId: shop2._id, isActive: true, phone: '+353 87 333 3333' })

  // Link owners
  shop1.ownerId = marco._id; await shop1.save()
  shop2.ownerId = jake._id;  await shop2.save()

  // ── Admin ──────────────────────────────────────────────────────────────────
  await User.create({ name: 'Admin', email: 'admin@berberot.com', password: await h('admin123'), role: 'admin', isActive: true })

  // ── Customers ──────────────────────────────────────────────────────────────
  const alex = await User.create({ name: 'Alex Byrne', email: 'alex@berberot.com', password: await h('customer123'), role: 'customer', isActive: true, phone: '+353 87 444 4444' })
  const sam  = await User.create({ name: 'Sam Doyle',  email: 'sam@berberot.com',  password: await h('customer123'), role: 'customer', isActive: true, phone: '+353 87 555 5555' })

  // ── Services ───────────────────────────────────────────────────────────────
  const [s1a, s1b, s1c] = await Service.create([
    { barberShopId: shop1._id, name: 'Haircut',         price: 20, duration: 30 },
    { barberShopId: shop1._id, name: 'Haircut + Beard', price: 30, duration: 45 },
    { barberShopId: shop1._id, name: 'Skin Fade',       price: 25, duration: 45 },
  ])
  const [s2a, s2b, s2c] = await Service.create([
    { barberShopId: shop2._id, name: 'Classic Cut', price: 18, duration: 30 },
    { barberShopId: shop2._id, name: 'Beard Trim',  price: 12, duration: 20 },
    { barberShopId: shop2._id, name: 'Full Groom',  price: 35, duration: 60 },
  ])

  // ── Working Hours ──────────────────────────────────────────────────────────
  const std  = { monday:[{start:'09:00',end:'18:00'}], tuesday:[{start:'09:00',end:'18:00'}], wednesday:[{start:'09:00',end:'18:00'}], thursday:[{start:'09:00',end:'18:00'}], friday:[{start:'09:00',end:'18:00'}], saturday:[{start:'10:00',end:'16:00'}], sunday:[] }
  const long = { monday:[{start:'08:00',end:'20:00'}], tuesday:[{start:'08:00',end:'20:00'}], wednesday:[{start:'08:00',end:'20:00'}], thursday:[{start:'08:00',end:'20:00'}], friday:[{start:'08:00',end:'20:00'}], saturday:[{start:'09:00',end:'17:00'}], sunday:[{start:'10:00',end:'14:00'}] }

  await WorkingHours.create([
    { barberId: marco._id, schedule: std,  bufferMinutes: 0 },
    { barberId: jake._id,  schedule: long, bufferMinutes: 5 },
    { barberId: liam._id,  schedule: std,  bufferMinutes: 0 },
  ])

  // ── Sample Bookings ────────────────────────────────────────────────────────
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d }

  await Booking.create([
    // Upcoming
    { barberId:marco._id, userId:alex._id, serviceId:s1a._id, date:fmt(addDays(1)),  startTime:'10:00', endTime:'10:30', status:'confirmed', phone:alex.phone },
    { barberId:marco._id, userId:sam._id,  serviceId:s1b._id, date:fmt(addDays(2)),  startTime:'11:00', endTime:'11:45', status:'confirmed', phone:sam.phone  },
    { barberId:jake._id,  userId:alex._id, serviceId:s2a._id, date:fmt(addDays(1)),  startTime:'14:00', endTime:'14:30', status:'confirmed', phone:alex.phone },
    { barberId:jake._id,  userId:sam._id,  serviceId:s2c._id, date:fmt(addDays(3)),  startTime:'10:00', endTime:'11:00', status:'confirmed', phone:sam.phone  },
    { barberId:liam._id,  userId:alex._id, serviceId:s2b._id, date:fmt(addDays(4)),  startTime:'15:00', endTime:'15:20', status:'confirmed', phone:alex.phone },
    // Past — completed with reviews
    { barberId:marco._id, userId:alex._id, serviceId:s1c._id, date:fmt(addDays(-7)),  startTime:'09:00', endTime:'09:45', status:'completed', phone:alex.phone, rating:5, reviewText:'Marco is the best! Perfect fade every time.' },
    { barberId:marco._id, userId:sam._id,  serviceId:s1a._id, date:fmt(addDays(-14)), startTime:'11:30', endTime:'12:00', status:'completed', phone:sam.phone,  rating:4, reviewText:'Great cut, friendly atmosphere.'              },
    { barberId:jake._id,  userId:alex._id, serviceId:s2a._id, date:fmt(addDays(-5)),  startTime:'13:00', endTime:'13:30', status:'completed', phone:alex.phone, rating:5, reviewText:'Jake really knows his craft.'                   },
    { barberId:liam._id,  userId:sam._id,  serviceId:s2b._id, date:fmt(addDays(-10)), startTime:'15:00', endTime:'15:20', status:'completed', phone:sam.phone,  rating:3, reviewText:'Good but had to wait a bit.'                    },
    { barberId:marco._id, userId:alex._id, serviceId:s1b._id, date:fmt(addDays(-21)), startTime:'10:00', endTime:'10:45', status:'completed', phone:alex.phone, rating:5 },
    // Cancelled
    { barberId:jake._id,  userId:sam._id,  serviceId:s2c._id, date:fmt(addDays(-3)),  startTime:'09:00', endTime:'10:00', status:'cancelled', phone:sam.phone },
    // No-show
    { barberId:liam._id,  userId:alex._id, serviceId:s2a._id, date:fmt(addDays(-6)),  startTime:'11:00', endTime:'11:30', status:'no-show',   phone:alex.phone },
  ])

  console.log('\n✅ Seed complete!\n')
  console.log('────────────────────────────────────────────────────')
  console.log('ADMIN')
  console.log('  admin@berberot.com     / admin123')
  console.log('\nBARBERS')
  console.log('  marco@berberot.com     / barber123  →  The Fade Factory (sole barber, Dublin)')
  console.log('  jake@berberot.com      / barber123  →  Sharp Blades (owner, Cork)')
  console.log('  liam@berberot.com      / barber123  →  Sharp Blades (2nd barber, Cork)')
  console.log('\nCUSTOMERS')
  console.log('  alex@berberot.com      / customer123')
  console.log('  sam@berberot.com       / customer123')
  console.log('────────────────────────────────────────────────────')

  await mongoose.disconnect()
}

seed().catch((e) => { console.error(e); process.exit(1) })
