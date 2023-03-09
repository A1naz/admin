import { NuxtAuthHandler } from '#auth'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { checkSignature } from '~~/server/lib/telegram/mod'
import bcrypt from 'bcrypt'
import { User } from '~/server/lib/models/User'
import clientPromise from '~/server/lib/mongodb'
import { uuid } from 'uuidv4'
const runtimeConfig = useRuntimeConfig()
export default NuxtAuthHandler({
  secret: runtimeConfig.SECRET,
  pages: {
    //error: '/auth?error'
    signIn: '/auth',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      const isSignIn = user ? true : false
      if (isSignIn) {
        token.email = user ? (user as any).email || '' : ''
        token.uuid = user ? (user as any).uuid || '' : ''
        token.username = user ? (user as any).username || '' : ''
      }
      return Promise.resolve(token)
    },
    // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
    session: async ({ session, token }) => {
      ;(session as any).email = token.email
      ;(session as any).uuid = token.uuid
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
        const config = useRuntimeConfig()
        console.log(config.BOT_TOKEN)
        const user = { ...req.body }
        delete user.callbackUrl
        delete user.csrfToken
        delete user.redirect
        delete user.json

        const valid = checkSignature(config.BOT_TOKEN, user)

        console.log(user)

        if (!valid) {
          console.log('invalid signature')
          throw new Error('invalid signature')
        }

        const foundUser = await User.findOne({ uuid: user.id.toString() })
        if (foundUser) {
          console.log(foundUser)
          foundUser.name = [user.first_name, user.last_name || ''].join(' ')
          await foundUser.save()
          return foundUser
        } else {
          const newUser = new User({
            uuid: user.id.toString(),
            username: user.username,
            roles: ['user'],
            name: [user.first_name, user.last_name || ''].join(' '),
            email: user.username + '@telegram.com',
            emailConfirmed: true,
            password: uuid(),
          })
          await newUser.save()
          console.log(newUser)
          return newUser
        }
      },
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: 'email',
          type: 'text',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials: any) {
        const { email, password } = credentials

        if (!email || !password) {
          return null
        }
        const user = await User.findOne({ email })

        if (!user) {
          throw new Error('User not found')
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new Error('Invalid password')
        }

        if (!user.emailConfirmed) {
          throw new Error('Email is not confirmed')
        }

        return user
      },
    }),
  ],
})
