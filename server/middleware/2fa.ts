import { getToken } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
  const token: any = await getToken({ event })

  if (token && token.twoFaNeeded && event._path == '/api/user/client') {
    const client = {
      email: token.email,
      uuid: token.uuid,
    }

    return {
      client,
      status: 'ok',
    }
  }

  if (
    token &&
    token.twoFaNeeded &&
    !event._path?.includes('/2fa') &&
    !event._path?.includes('/auth') &&
    !event._path?.includes('/token') &&
    !event._path?.includes('/register')
  ) {
    return sendRedirect(event, '/2fa', 302)
  }
})
