import AWS from 'aws-sdk'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const { path }: any = getQuery(event)

  console.log(path);
  
  AWS.config.update({
    accessKeyId: config.VK_ACCESS_KEY,
    secretAccessKey: config.VK_SECRET_KEY,
    endpoint: 'https://hb.vkcs.cloud',
  })

  const s3 = new AWS.S3()
  const bucket = 'ozonmpportal'

  // Генерируем пресайндованную ссылку на объект
  const getImageUrl = async (bucket: string, key: string) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 3600 * 24 * 365 * 1000, // Время жизни ссылки (в секундах)
    }

    try {
      const url = await s3.getSignedUrlPromise('getObject', params)
      return url
    } catch (error) {
      console.error('Ошибка при генерации ссылки на изображение:', error)
      throw error
    }
  }

  const imageUrl = await getImageUrl(bucket, path)

  return imageUrl
})
