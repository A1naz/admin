import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { checkSignature } from '~~/server/lib/telegram/mod'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { NuxtAuthHandler } from '#auth'
import { Referral } from '~/server/lib/models/Referral'
import confirmTwoFaCode from '~/server/utils/confirmTwoFaCode'
import { checkRateLimit, logLoginAttempt, clearOldLoginAttempts } from '~/server/utils/rateLimiter'

const runtimeConfig = useRuntimeConfig()
export default NuxtAuthHandler({
  secret: runtimeConfig.SECRET,
  pages: {
    signIn: '/auth',
  },
  session: {
    maxAge: 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      const isSignIn = !!user
      if (isSignIn) {
        token.twoFaNeeded = (user as any)?.isTwoFaEnabled
          ? token.twoFaNeeded == false
            ? false
            : true
          : false
        token.email = user ? (user as any)?.email : ''
        token.uuid = user ? (user as any)?.uuid : ''
        token.username = user ? (user as any)?.username : ''
        token.balance = user ? (user as any)?.balance : 0
        token.authDate = token.authDate
          ? token.authDate
          : new Date(new Date().setDate(new Date().getDate() + 1))
      }
      const currentDate = new Date()
      if (token.authDate && token.authDate < currentDate) {
        return Promise.reject(new Error('Session expired'))
      }

      return Promise.resolve(token)
    },
    session: async ({ session, token, user }) => {
      ;(session as any).email = token.email
      ;(session as any).uuid = token.uuid
      ;(session as any).username = token.username
      ;(session as any).balance = token.balance
      const found = await AdminUser.findOne({ uuid: token.uuid })
      if (!found) return Promise.reject(new Error('User not found'))

      return Promise.resolve(session)
    },
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      id: 'telegram-login',
      name: 'Telegram Login',
      credentials: {},
      async authorize(credentials: any, req: any) {
        const event = req as any
        const user = { ...req.body }
        delete user.callbackUrl
        delete user.csrfToken
        delete user.redirect
        delete user.json
        const referral = JSON.parse(JSON.stringify(user.referral))
        delete user.referral

        const identifier = user.id?.toString() || 'telegram-unknown'
        
        // Проверка rate limit для Telegram авторизации
        const rateLimitCheck = await checkRateLimit(event, identifier)
        if (!rateLimitCheck.allowed) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(rateLimitCheck.reason || 'Rate limit exceeded')
        }

        const valid = checkSignature(runtimeConfig.BOT_TOKEN, user)

        if (!valid) {
          await logLoginAttempt(event, identifier, false)
          throw new Error('invalid signature')
        }

        const foundUser = await AdminUser.findOne({
          telegramUserId: user.id.toString(),
        })
        
        if (foundUser) {
          await logLoginAttempt(event, identifier, true)
          await clearOldLoginAttempts(identifier)
          return foundUser
        } else {
          const newUser = new AdminUser({
            uuid: uuid(),
            telegram: user.username,
            username: user.username,
            telegramUserId: user.id.toString(),
            roles: ['user'],
            firstName: user.first_name,
            lastName: user.last_name,
            emailConfirmed: true,
          })
          await newUser.save()
          if (referral) {
            const inviter = await AdminUser.findOne({ username: referral })
            if (inviter && inviter.partner) {
              const refCount = inviter?.partner.refCount ?? 0
              inviter.partner.refCount = refCount + 1
              const referralFound = await Referral.findOne({ user: inviter })
              if (referralFound) {
                referralFound.referrals.push({
                  user: user._id,
                  date: new Date(),
                })
                await referralFound.save()
              } else {
                await Referral.create({
                  user: inviter,
                  referrals: [{ user: user._id, date: new Date() }],
                })
              }
              await inviter.save()
            }
          }
          await logLoginAttempt(event, identifier, true)
          return newUser
        }
      },
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'email',
          type: 'text',
        },
        password: {
          label: 'password',
          type: 'password',
        },
        code: {
          type: 'text',
        },
      },

      async authorize(credentials: any, req: any) {
        const { email, password, code } = credentials
        if (!email || !password) return null

        const event = req as any
        const identifier = email.toLowerCase().trim()

        if (runtimeConfig.env === 'developer1') {
          const user = await AdminUser.findOne({ email })

          if (!user) return null
          return user
        }

        // Проверка rate limit перед попыткой авторизации
        const rateLimitCheck = await checkRateLimit(event, identifier)
        if (!rateLimitCheck.allowed) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(rateLimitCheck.reason || 'Rate limit exceeded')
        }

        const user =
          (await AdminUser.findOne({ email })) ||
          (await AdminUser.findOne({ username: email }))
        
        // Унифицированное сообщение об ошибке для защиты от user enumeration
        const genericError = 'Неверный логин или пароль'
        
        if (!user || user.roles.length <= 1) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(genericError)
        }
        
        if (runtimeConfig.env === 'developer1') return user
        
        if (!user.password) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(genericError)
        }

        const isValid = await bcrypt.compareSync(password, user.password)

        if (!isValid) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(genericError)
        }

        if (!user.emailConfirmed) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(genericError)
        }
        
        if (user.tg2fa && user.telegramUserId && !code) {
          // Не логируем как неудачную попытку, т.к. требуется 2FA код
          throw new Error('2fa')
        }

        // Успешная авторизация
        await logLoginAttempt(event, identifier, true)
        await clearOldLoginAttempts(identifier)

        return user
      },
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      id: '2fa',
      name: '2fa',
      credentials: {
        code: {
          type: 'text',
        },
      },

      async authorize(credentials: any, req: any) {
        const { code, uuid } = credentials
        const event = req as any

        const user = await AdminUser.findOne({
          uuid,
        })

        if (!user) {
          return null
        }

        const identifier = user.email || user.username || user.uuid
        
        // Проверка rate limit для 2FA
        const rateLimitCheck = await checkRateLimit(event, identifier)
        if (!rateLimitCheck.allowed) {
          await logLoginAttempt(event, identifier, false)
          throw new Error(rateLimitCheck.reason || 'Rate limit exceeded')
        }

        if (!user.twoFaSecret) {
          await logLoginAttempt(event, identifier, false)
          throw new Error('2FA not configured')
        }

        const verified = confirmTwoFaCode(code, user.twoFaSecret)

        if (!verified) {
          await logLoginAttempt(event, identifier, false)
          throw new Error('Invalid code')
        }

        // Успешная 2FA верификация
        await logLoginAttempt(event, identifier, true)
        await clearOldLoginAttempts(identifier)

        user.isTwoFaEnabled = false
        return user
      },
    }),
  ],
})
