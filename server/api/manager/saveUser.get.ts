import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { v4 as unicalUuid } from 'uuid'

const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { uuid, strBody }: any = getQuery(event)

  const body = JSON.parse(strBody)

  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !userAdmin ||
    !userAdmin.roles.includes('manager') ||
    !userAdmin.mainAdmin
  )
    return sendRedirect(event, '/auth', 302)

  if (uuid) {
    let userToEdit = await User.findOne({ uuid: uuid })

    if (!userToEdit) {
      throw createError({
        statusCode: 400,
        message: 'Пользователь не найден',
      })
    }

    if (userToEdit) {
      userToEdit.username = body.username ? body.username : userToEdit.username
      userToEdit.email = body.email ? body.email : userToEdit.email
      userToEdit.roles = body.roles ? body.roles : userToEdit.roles
      userToEdit.tabs = body.tabs

      if (body.roles.includes('manager')) {
        let adminUserToEdit = await AdminUser.findOne({ uuid: uuid })

        if (!adminUserToEdit) {
          await AdminUser.create({
            uuid: userToEdit.uuid,
            username: userToEdit.username,
            email: userToEdit.email,
            roles: userToEdit.roles,
            tabs: userToEdit.tabs,
            emailConfirmed: true,
            firstName: userToEdit.firstName,
            lastName: userToEdit.lastName,
          })
        } else {
          adminUserToEdit.username = body.username
            ? body.username
            : adminUserToEdit.username
          adminUserToEdit.email = body.email
            ? body.email
            : adminUserToEdit.email
          adminUserToEdit.roles = body.roles
            ? body.roles
            : adminUserToEdit.roles
          adminUserToEdit.tabs = body.tabs
          await adminUserToEdit.save()
        }
      } else if (!body.roles.includes('manager')) {
        const adminToRemove = await AdminUser.findOne({ uuid: uuid })
        if (adminToRemove) {
          await adminToRemove.deleteOne()
        }
      }
    }

    await userToEdit.save()
  } else {
    let newUuid = unicalUuid()
    console.log(newUuid)

    let newUser = await User.create({
      uuid: newUuid,
      username: body.username,
      email: body.email,
      roles: body.roles,
      tabs: body.tabs,
      emailConfirmed: true,
      firstName: body.firstName,
      lastName: body.lastName,
    })

    if (body.roles.includes('manager')) {
      await AdminUser.create({
        uuid: newUser.uuid,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
        tabs: newUser.tabs,
        emailConfirmed: true,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      })
    }
  }

  return { status: 'ok' }
})
