import nodemailer from 'nodemailer'

const config = useRuntimeConfig()
const { smtpHost, smtpPort, smtpUser, smtpPass, privateKey } = config
const alias = 'support@topvtop.pro'
const dkimKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCTvi251KPBHP9WoY8EetJSisyS3UazL+H9CSUVEB1rvQXItA8A
hUstcJnHDVdiEnFGN9+f/vL1jlHZVGDnTFnZmO+o1aZhhKYBjVLdFsv+y/6WaO7a
RHiyfrg0ELqs9Jcv8q88JjBytFtn1fXprMZyWyELeiRY+A8mmI6PWpz/AQIDAQAB
AoGASieET+d4oa7qQhMo83iqJB/iejxyBfIcnaJ/aEkEW1UumAQ4G2zLxOzlYlFB
8MmM7U+SAH44eCOM1WZSlQVvetLcF9v9FqIxDWg5iAJSPT9+iisUbtz2qUsXSlzv
ZlJOmYKoUKMbJxOl0ulW6Lgk8sfDiQO/WHTFzEo/TI2e/fkCQQDCxmOFF/qZP+zz
UWmokdXmPVKitsMRBip1p+SioFX6XrQb15h8P1zfBd7EdahazVeD7OXVpSgAEG79
cEmRTOtfAkEAwi8aIuVz+/pjad706w7IdTh3HHICTTobENOAYXdBAHCFC0RiB7U0
aaHA7DFW4qNdZESn1cX25Oz68L7OKTqRnwJAZi+NINN+vw4Bs3n/89dnIB8GDqXR
20mf1xBZbFSwJuWumnjW4ECh6cP7ppiP1eurQWR1BExcmwQEJuTVQ+zWAwJBAI1x
c89BZXeAjhNa9PmW3gsMYy6UGPsZvQdHl/bmv7FLRI3NdL56jj/3M6iX09rn9ioI
HFyJg2qC99KOmWrMn68CQQCrMTEiIwMOG0v5/900CmCNGgkc0Du3Rlzl73rdH46h
L2lWixJN/7Q4b6WLLGB9KJnCREX1tOIhiCMzFo6v5zT7
-----END RSA PRIVATE KEY-----`

class MailService {
  transporter: nodemailer.Transporter
  constructor() {
    this.transporter = nodemailer.createTransport({
      // @ts-expect-error nodemailer types bad
      host: smtpHost,
      port: smtpPort,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      dkim: {
        domainName: 'topvtop.pro',
        keySelector: 'dkim',
        privateKey: dkimKey,
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
                    <a href="${link}"><h2>Ссылка</h2></a>
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
        subject: 'Подтверждение отвязки Telegram на TOPVTOP',
        text: '',
        html: `
                <div>
                    <h1>Для отвязки телеграма перейдите по ссылке</h1>
                    <a href="${link}"><h2>Ссылка</h2></a>
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
