import nodemailer from 'nodemailer'

const config = useRuntimeConfig()
const { smtpHost, smtpPort, smtpUser, smtpPass, privateKey } = config
const alias = 'support@topvtop.com'
class MailService {
  transporter: nodemailer.Transporter
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      dkim: {
        domainName: 'openbomber.com',
        keySelector: 'google',
        privateKey,
      },
    })
  }

  async sendActivationMail(to: string | undefined, link: string) {
    const result = await this.transporter
      .sendMail({
        from: alias,
        to,
        subject: 'Активация аккаунта на TOPVTOP',
        text: '',
        html: `
                <div>
                    <h1>Для активации аккаунта перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
      })
    return result
  }

  async sendUnlinkTelgramMail(to: string | undefined, link: string) {
    const result = await this.transporter
      .sendMail({
        from: alias,
        to,
        subject: 'Подтверждение отвязки telegram на TOPVTOP',
        text: '',
        html: `
                <div>
                    <h1>Для отвязки телеграма перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
      })
    return result
  }

  async sendChangePasswordMail(to: string | undefined, link: string, username: string) {
    const result = this.transporter
      .sendMail({
        from: alias,
        to,
        subject: 'Смена пароля на TOPVTOP',
        text: '',
        html: `
                <div>
                    <h1>Привет, ${username}!</h1>
                    <h2>Вы собираетесь сменить пароль! Если это сделали не вы, то проигнорируйте это сообщение.</h2>
                    <h2>Для подтверждения смены пароля перейдите по ссылке</h2>
                    <a href="${link}"><h2>Ссылка</h2></a>
                </div>
            `,
      })
    return result
  }
}

export default new MailService()
