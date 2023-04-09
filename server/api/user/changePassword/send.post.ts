import jwt from 'jsonwebtoken'
import validator from 'validator'
import { User } from '@/server/lib/models/User'
import mailService from '@/server/lib/mailService'

export default eventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { email, password, confirmPassword } = await readBody(event)

  if (!validator.isEmail(email)) {
    throw createError({
      statusCode: 400,
      message: 'Email is not valid',
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: 'Passwords do not match',
    })
  }

  const found = await User.findOne({ email })

  if (!found) {
    return {
      status: 'ok',
    }
  }
  const token = jwt.sign(
    { email: found.email, id: found.id, password },
    runtimeConfig.SECRET,
    {
      expiresIn: '10m',
    },
  )

  const url = `${runtimeConfig.PUBLIC_SITE_URL}/api/user/changePassword/${token}`

  await mailService.sendChangePasswordMail(
    found.email,
    url,
    found.firstName || found.username,
  )
  return {
    status: 'ok',
  }
})
