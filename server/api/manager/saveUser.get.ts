import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { v4 as unicalUuid } from 'uuid'
import bcrypt from 'bcrypt'
import { ActionHistory } from '~/server/lib/models/actionHistory'

const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { uuid, strBody }: any = getQuery(event)

 
  const body = JSON.parse(strBody)
 console.log(body);
  
  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin || !userAdmin.mainAdmin)
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
      userToEdit.firstName = body.firstName
        ? body.firstName
        : userToEdit.firstName
      userToEdit.lastName = body.lastName ? body.lastName : userToEdit.lastName

      if (body.roles.length > 1) {
        let adminUserToEdit = await AdminUser.findOne({ uuid: uuid })
        let adminUserToEditByEmail: any = null
        if (body.email) {
          adminUserToEditByEmail = await AdminUser.findOne({
            email: body.email,
          })
        }

        if (!adminUserToEdit && !adminUserToEditByEmail) {
          await AdminUser.create({
            uuid: userToEdit.uuid,
            username: userToEdit.username,
            password: userToEdit.password,
            email: userToEdit.email,
            roles: userToEdit.roles,
            tabs: userToEdit.tabs,
            emailConfirmed: true,
            firstName: userToEdit.firstName,
            lastName: userToEdit.lastName,
            allowedUsers: body.allowedUsers,
            isAllUsersAllowed: body.allowedUsers.length > 0 ? false : true,
          })

          await ActionHistory.create({
            adminUser: userAdmin._id,
            actionId: 13,
            actionDescription: `Админ ${userToEdit.uuid} - ${userToEdit.username} создан`,
            date: new Date(),
            userUuid: userToEdit.uuid,
          })
        } else if (adminUserToEdit) {
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

          adminUserToEdit.allowedUsers = body.allowedUsers
          adminUserToEdit.isAllUsersAllowed = body.allowedUsers.length > 0 ? false : true
          await adminUserToEdit.save()
        }
      } else if (body.roles.length <= 1) {
        const adminToRemove = await AdminUser.findOne({ uuid: uuid })
        if (adminToRemove) {
          await adminToRemove.deleteOne()
          await ActionHistory.create({
            adminUser: userAdmin._id,
            actionId: 15,
            actionDescription: `Админ ${adminToRemove.uuid} - ${adminToRemove.username} удален`,
            date: new Date(),
          })
        }
      }
    }

    await userToEdit.save()

    await ActionHistory.create({
      adminUser: userAdmin._id,
      actionId: 11,
      actionDescription: `Пользователь ${userToEdit.uuid} - ${userToEdit.username} изменен`,
      date: new Date(),
      userUuid: userToEdit.uuid,
    })
  } else {
    let newUuid = unicalUuid()
    const hash = bcrypt.hashSync(body.password, 7)

    const isUserExist = await User.findOne({ email: body.email })

    if (isUserExist) {
      throw createError({
        statusCode: 404,
        message: 'Пользователь уже существует с таким email',
      })
    }

    if (!isUserExist) {
      let newUser = await User.create({
        uuid: newUuid,
        username: body.username,
        email: body.email,
        password: hash,
        roles: body.roles,
        tabs: body.tabs,
        emailConfirmed: true,
        firstName: body.firstName,
        lastName: body.lastName,
      })

      await ActionHistory.create({
        adminUser: userAdmin._id,
        actionId: 12,
        actionDescription: `Пользователь ${newUser.uuid} - ${newUser.username} создан`,
        date: new Date(),
        userUuid: newUser.uuid,
      })

      if (body.roles.length > 1) {
        await AdminUser.create({
          uuid: newUser.uuid,
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          roles: newUser.roles,
          tabs: newUser.tabs,
          emailConfirmed: true,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          allowedUsers: body.allowedUsers,
          isAllUsersAllowed: body.allowedUsers.length > 0 ? false : true,
        })

        await ActionHistory.create({
          adminUser: userAdmin._id,
          actionId: 13,
          actionDescription: `Админ ${newUser.uuid} - ${newUser.username} создан`,
          userUuid: newUser.uuid,
          date: new Date(),
        })
      }
    }
  }

  return { status: 'ok' }
})
