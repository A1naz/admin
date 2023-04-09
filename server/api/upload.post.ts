import { getServerSession } from '#auth'

function decodeBase64Image(base64Str: string) {
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  const image = {} as any
  if (!matches || matches.length !== 3)
    throw new Error('Invalid base64 string')

  image.type = matches[1]
  image.data = Buffer.from(matches[2], 'base64')

  return image
}
export default eventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const filename = `${Date.now()}.png`
  const files = await readMultipartFormData(event)
  if (!files?.length) {
    return {
      success: false,
      message: 'No file uploaded',
    }
  }
  const file = files[0]
  const { name, type, data } = file
  if (!type?.startsWith('image/')) {
    return {
      success: false,
      message: 'Only image files are allowed',
    }
  }

  // save file logic
  return {
    success: true,
    url: `${runtimeConfig.PUBLIC_SITE_URL}/api/uploads/${filename}`,
    filename,
  }
})
