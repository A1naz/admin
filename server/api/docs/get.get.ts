import { User } from '@/server/lib/models/User'
import { AdminUser } from '@/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import {
  Paragraph,
  patchDocument,
  PatchType,
  AlignmentType,
  TextRun,
} from 'docx'
import fs from 'node:fs'
import path from 'node:path'
import he from 'he'
import checkAndRemove from './checkAndRemove'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || (!admin.tabs.includes('Клиенты') && !admin.mainAdmin))
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const user = await User.findOne({ uuid })

  if (!user) return sendRedirect(event, '/auth', 302)

  checkAndRemove('server/docs/signedOferta.docx')

  let doc: any

  if (user.fizFace) {
    doc = await patchDocument(
      fs.readFileSync('server/docs/templates/ofertaFiz.docx'),
      {
        patches: {
          username: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.username,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          phoneNumber: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.phoneNumber,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          registrationDate: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.registrationDate
                      .toISOString()
                      .slice(0, 10)
                      .replace(/-/g, '.'),
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          email: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.email,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
        },
      }
    )
  } else if (user.orgKey === 'ООО') {
    if (!user.bik)
      throw createError({
        statusCode: 400,
        statusMessage:
          'Не удалось получить информацию о банке, заполните БИК и Р/С',
      })
    if (!user.firstName || !user.lastName || !user.middleName)
      throw createError({
        statusCode: 400,
        statusMessage: 'Не удалось получить информацию о ФИО, заполните ФИО',
      })

    doc = await patchDocument(
      fs.readFileSync('server/docs/templates/ofertaOOO.docx'),
      {
        patches: {
          ogrn: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.orgOgrn,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          inn: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.orgInn,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          address: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.bankInfo.address,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          bank: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: he.decode(user.bankInfo.name),
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          bik: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.bik,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          rs: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.rs,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          ks: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.bankInfo.ks,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          email: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.email,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          genDirector: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `${user.firstName} ${user.lastName} ${user.middleName}`,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          orgType: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `Генеральный директор`,
                    font: 'Times New Roman',
                    size: 20,
                  }),
                ],
              }),
            ],
          },
          fio: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `${user.lastName} ${user.firstName} ${user.middleName}`,
                    font: 'Times New Roman',
                    size: 20,
                  }),
                ],
              }),
            ],
          },
          initials: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `________________________ / ${user.firstName[0]}. ${user.middleName[0]}. ${user.lastName}`,
                    font: 'Times New Roman',
                    size: 21,
                  }),
                ],
              }),
            ],
          },
          fioFirst: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `${user.orgName}`,
                    font: 'Times New Roman',
                    size: 22,
                    bold: true,
                  }),
                ],
              }),
            ],
          },
        },
      }
    )
  } else if (user.orgKey === 'ИП') {
    if (!user.bik)
      throw createError({
        statusCode: 400,
        statusMessage:
          'Не удалось получить информацию о банке, заполните БИК и Р/С',
      })

    if (!user.firstName || !user.lastName || !user.middleName)
      throw createError({
        statusCode: 400,
        statusMessage: 'Не удалось получить информацию о ФИО, заполните ФИО',
      })

    doc = await patchDocument(
      fs.readFileSync('server/docs/templates/ofertaIP.docx'),
      {
        patches: {
          ogrn: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.orgOgrn,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          inn: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.orgInn,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          address: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.bankInfo.address,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          bank: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: he.decode(user.bankInfo.name),
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          bik: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.bik,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          rs: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.rs,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          ks: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.bankInfo.ks,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          email: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: user.email,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          genDirector: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `${user.firstName} ${user.lastName} ${user.middleName}`,
                    font: 'Times New Roman',
                    size: 22,
                  }),
                ],
              }),
            ],
          },
          orgType: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `Индивидуальный предприниматель`,
                    font: 'Times New Roman',
                    size: 20,
                  }),
                ],
              }),
            ],
          },
          fio: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `${user.lastName} ${user.firstName} ${user.middleName}`,
                    font: 'Times New Roman',
                    size: 20,
                  }),
                ],
              }),
            ],
          },
          initials: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `________________________ / ${user.firstName[0]}. ${user.middleName[0]}. ${user.lastName}`,
                    font: 'Times New Roman',
                    size: 21,
                  }),
                ],
              }),
            ],
          },
          fioFirst: {
            type: PatchType.DOCUMENT,
            children: [
              new Paragraph({
                spacing: {
                  line: 276, // Интервал между абзацами 1.15
                },
                children: [
                  new TextRun({
                    text: `${user.orgName}`,
                    font: 'Times New Roman',
                    size: 22,
                    bold: true,
                  }),
                ],
              }),
            ],
          },
        },
      }
    )
  }

  fs.writeFileSync('server/docs/signedOferta.docx', doc)
  const dirPath = path.join('server', 'docs')
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  fs.writeFileSync(path.join(dirPath, 'signedOferta.docx'), doc)

  console.log('createdFile')

  const fileStream = fs.createReadStream(
    path.join(dirPath, 'signedOferta.docx')
  )

  event.res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )

  event.res.setHeader(
    'Content-Disposition',
    'attachment; filename="signedOferta.docx"'
  )

  fileStream.on('close', async () => {
    try {
      fs.unlink(path.join(dirPath, 'signedOferta.docx'), () => {})
    } catch (err) {
      console.error('Ошибка при удалении файла:', err)
    }
  })

  return sendStream(event, fileStream)
})
