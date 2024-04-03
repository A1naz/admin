export async function getS3PublicUrl(key: string) {
  const { data, error }: any = await useFetch('/api/images/publicUrl', {
    method: 'GET',
    params: {
      path: 'admin/' + key,
    },
  })

  if (data.value) {
      console.log(data.value);
    return data.value
    
  } else {
    return 'null'
  }
}
