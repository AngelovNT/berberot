import { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/getSession'
import { uploadImage } from '@/lib/cloudinary'
import { ok, err } from '@/lib/apiResponse'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'clipr/misc'

    if (!file) return err('No file provided', 400)
    if (!ALLOWED.includes(file.type)) return err('Only JPEG, PNG, WebP, or GIF allowed', 400)
    if (file.size > MAX_BYTES) return err('File must be under 5MB', 400)

    const buffer = Buffer.from(await file.arrayBuffer())
    const publicId = `${session.userId}_${Date.now()}`
    const url = await uploadImage(buffer, folder, publicId)

    return ok({ url })
  } catch (e) {
    console.error(e)
    return err('Upload failed', 500)
  }
}
