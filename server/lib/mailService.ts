import nodemailer from 'nodemailer'

const config = useRuntimeConfig()
const { smtpHost, smtpPort, smtpUser, smtpPass, privateKey } = config
const alias = 'support@topvtop.pro'
const dkimKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCdu4HtswyNnv/YnDSoWLQSjWALOVzzGtQIxZhG6Ke7TO77/ywi
gEjxR6JIPDQb/AQ9cfoRtZad4WL2dHfu82KtMgzhc0CO1vY5bdEWveY/X0HGuGzG
sZj1oUeVMe4AY9CA9FyBa/tHsRp0DPlyZBFerEhKgUFDuBvM7shMbrF3bQIDAQAB
AoGASxREvTs733FugNGhsvw+ApKuw8jzOHhtsxsy55W4uUveea61eFqt3cNmOJIH
j8Z+0iydhq5z2gS9kWhQ6jmJnv3D/S9L8CCtuAPLQVwirMlA9BUOOR78N16ed+kP
a0uu5DJFDQZbrPpfZ7fI/EmfD2Fi2wGzS9CHEwXSwXQym4ECQQDQlOzzt8cXbQCL
aC7H+1YrGAI23Bu2Hmnd9yXp+elXIfBcjCTVjrY68ej/4wetX48lMUabYptjwb2E
KmLxVSQNAkEAwZc/JELf0iIR2bE8hlnJ8i1iRmCzJWLgKuWyhTQjbqYc+JtcrsZq
9N70ixuvTmuvw91pNcox1HSN5zmtIbXo4QJAOuEPUm0aYl5+vNuX+RPV6yxH07ym
he5n7CSMK1RErjgCZd2ZuD8k6dbH8xPfYu2KtvEGAW8AdlSGbvyYGY/zMQJBALRZ
MMuZOWZLsxF42gfXkhj5SrqBz6Mer/OGtX7+iZvFSOwZ4Ig59N5W7r7Bddm63K29
kQw5Z56jTqeAxdfH3kECQQCjCN6JxlOSzyuNUcrOek+QMYeKbvopznUnSdD/qk1m
2WYMGlLcIaWuQ5OqzCxfYHkCBnGaD/Mr6tCDKnseVYAs
-----END RSA PRIVATE KEY-----`
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCdu4HtswyNnv/YnDSoWLQSjWAL
OVzzGtQIxZhG6Ke7TO77/ywigEjxR6JIPDQb/AQ9cfoRtZad4WL2dHfu82KtMgzh
c0CO1vY5bdEWveY/X0HGuGzGsZj1oUeVMe4AY9CA9FyBa/tHsRp0DPlyZBFerEhK
gUFDuBvM7shMbrF3bQIDAQAB
-----END PUBLIC KEY-----`
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
        keySelector: 's1',
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
