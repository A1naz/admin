import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Referral } from '~~/server/lib/models/Referral'

import MailService from '~~/server/lib/mailService.js'

function hasWhiteSpace(s: string) {
  return s.includes(' ') || !/^[a-zA-Z0-9_-]{4,14}$/.test(s)
}
export default eventHandler(async (event) => {
  const body = await readBody(event)

  const { email, password, referral } = body

  if (!email || !password)
    return { status: 'error', error: 'missing email or password' }

  if (!validator.isEmail(email)) {
    return {
      status: 'error',
      error: 'Некорректный email.',
    }
  }
  if (hasWhiteSpace(password)) {
    return {
      status: 'error',
      error:
        'Пароль не должен содержать пробелов, и состоять только из английских букв и цифр.',
    }
  }
  if (password.length < 6 || password.length > 14) {
    return {
      status: 'error',
      error: 'Пароль должен быть от 6 до 14 символов.',
    }
  }
  const session = await getServerSession(event)
  if (session)
    return { status: 'error', error: 'Вы уже авторизованы.' }

  const candidate = await User.findOne({ email })
  if (candidate) {
    return {
      status: 'error',
      error: 'Пользователь с таким email уже существует.',
    }
  }

  const hash = bcrypt.hashSync(password, 7)

  const user = new User({
    email,
    password: hash,
    username: email.split('@')[0],
    roles: ['user'],
    uuid: uuid(),
  })
  const url = useRuntimeConfig().PUBLIC_SITE_URL
  const link = `${url}/api/auth/activate?uuid=${user.uuid}`
  try {
    await MailService.sendActivationMail(user.email, link)
  }
  catch (error) {
    console.log(error)
    return { status: 'error', error: 'Ошибка отправки письма.' }
  }

  await user.save()

  if (referral) {
    const inviter = await User.findOne({ username: referral })
    if (!inviter)
      return
    if (inviter.partner) {
      const refCount = inviter?.partner.refCount ?? 0
      inviter.partner.refCount = refCount + 1

      const referralFound = await Referral.findOne({ user: inviter })
      if (referralFound) {
        referralFound.referrals.push(user._id)
        await referralFound.save()
      }
      else {
        await Referral.create({
          user: inviter,
          referrals: [user._id],
        })
      }
      await inviter.save()
    }
  }
  return { status: 'ok', error: null }
})
