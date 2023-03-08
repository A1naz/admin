import nodemailer from 'nodemailer'
const config = useRuntimeConfig()
const { smtpHost, smtpPort, smtpUser, smtpPass, privateKey } = config
console.log('smtpHost', smtpHost)
const alias = 'support@topvtop.com'
class MailServiceClass {
  constructor() {
    this.tranporter = nodemailer.createTransport({
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
  async sendThanksMail(to, link) {
    await this.tranporter
      .sendMail({
        from: alias,
        to: to,
        subject: 'Ваш платеж на OpenBomber.com был успешно зачислен. 💣',
        text: '',
        html: `
                <div>
                    <h1>Спасибо за поддержку! <3 </h1>
                    <a href="${link}">Наш сайт</a>
                </div>
            `,
      })
      .then((info) => {
        console.log(info)
      })
  }
  async sendActivationMail(to, link) {
    await this.tranporter
      .sendMail({
        from: alias,
        to: to,
        subject: 'Активация аккаунта на TOPVTOP',
        text: '',
        html: `
                <div>
                    <h1>Для активации аккаунта перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
      })
      .then((info) => {
        console.log(info)
      })
  }
  async sendResetPasswordMail(to, link, username) {
    await this.tranporter
      .sendMail({
        from: alias,
        to: to,
        subject: 'Восстановление пароля на  TOPVTOP',
        text: '',
        html: `
                <div>
                    <h1>Привет, ${username}!</h1>
                    <h2>Для восстановления пароля перейдите по ссылке</h2>
                    <a href="${link}">${link}</a>
                </div>
            `,
      })
      .then((info) => {
        console.log(info)
      })
  }
}

export default new MailServiceClass()
