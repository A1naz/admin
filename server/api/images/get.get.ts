import AWS from 'aws-sdk'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const { path }: any = getQuery(event)
  
  const bucket = 'ozonmpportal'
  AWS.config.update({
    accessKeyId: config.VK_ACCESS_KEY,
    secretAccessKey: config.VK_SECRET_KEY,
    //@ts-ignore
    endpoint: 'https://hb.vkcs.cloud',
  })

  const params: AWS.S3.GetObjectRequest = {
    Bucket: 'ozonmpportal',
    Key: path,
  }

  const getImage = (params: AWS.S3.GetObjectRequest) => {
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Body)
        }
      })
    })
  }

  const s3 = new AWS.S3()

  const data = await getImage(params)

  return data
})
