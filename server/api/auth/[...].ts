import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { checkSignature } from '~~/server/lib/telegram/mod'
import { User } from '~/server/lib/models/User'
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()
export default NuxtAuthHandler({
  // adapter: MongoDBAdapter(clientPromise),
  secret: runtimeConfig.SECRET,
  pages: {
    // error: '/auth?error'
    signIn: '/auth',
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      const isSignIn = !!user
      if (isSignIn) {
        token.email = user ? (user as any)?.email : ''
        token.uuid = user ? (user as any)?.uuid : ''
        token.username = user ? (user as any)?.username : ''
        token.balance = user ? (user as any)?.balance : 0
      }
      return Promise.resolve(token)
    },
    // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
    session: async ({ session, token, user }) => {
      (session as any).email = token.email;
      (session as any).uuid = token.uuid;
      (session as any).username = token.username;
      (session as any).balance = token.balance
      const found = await User.findOne({ uuid: token.uuid })
      if (!found)
        return Promise.reject(new Error('User not found'))

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
        const user = { ...req.body }
        delete user.callbackUrl
        delete user.csrfToken
        delete user.redirect
        delete user.json

        const valid = checkSignature(runtimeConfig.BOT_TOKEN, user)

        if (!valid)
          throw new Error('invalid signature')

        const foundUser = await User.findOne({ telegram: user.username })
        if (foundUser) {
          return foundUser
        }
        else {
          const newUser = new User({
            uuid: user.id.toString(),
            telegram: user.username,
            username: user.username,
            roles: ['user'],
            firstName: user.first_name,
            lastName: user.last_name,
            emailConfirmed: true,
          })
          await newUser.save()
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

        if (!email || !password)
          return null

        const user = await User.findOne({ email })

        if (!user)
          throw new Error('User not found')

        if (!user.password)
          throw new Error('Password not set')

        const isValid = bcrypt.compare(password, user.password)

        if (!isValid)
          throw new Error('Invalid password')

        if (!user.emailConfirmed)
          throw new Error('Email is not confirmed')

        return user
      },
    }),
  ],
})
