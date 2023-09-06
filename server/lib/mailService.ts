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
        subject: '[TOPVTOP] Завершите регистрацию',
        text: '',
        html: `
                <div>
                <h2>Приветствуем!</h2>
                
                <h3>
                Вы успешно зарегистрировались 
                на платформе TOPVTOP
                </h3>
                <h3>
                Для завершения регистрации 
                вам необходимо перейти по ссылке
                </h3>

                <a href="${link}"><h2>Ссылка</h2></a>
                
                <p>
                Если вдруг вы не регистрировались и 
                данное письмо получили случайно, 
                просто его проигнорируйте
                </p>

                <p>
                Данное письмо было создано автоматически 
                и если вы напишите на него нам ответ, 
                мы не сможем его прочитать
                </p>


                Все свои вопросы можете задавать тут
                
                <a href="https://t.me/+Y9WKYbGsMeM3ZDli">Поддержка</a>



                <p>
                Решайте любые задачи в TOPVTOP
                </p>
                <p>
                С уважением, служба заботы TOPVTOP      
                </p>          
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
        subject: '[TOPVTOP] Подтверждение отвязки Telegram',
        text: '',
        html: `
                <div>
                    <h2>Для отвязки телеграма перейдите по ссылке</h2>
                    <a href="${link}"><h2>Ссылка</h2></a>

                    <p>
                    Решайте любые задачи в TOPVTOP
                    </p>
                    <p>
                    С уважением, служба заботы TOPVTOP      
                    </p>    
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
        subject: '[TOPVTOP] Запрос на смену пароля',
        text: '',
        html: `
                <div>
                    <h2>Привет, ${username}!</h2>
                    <h3>Вы или кто-то другой использовал функцию смены пароля для доступа к личному кабинету</h3>
                    <h3>Вы собираетесь сменить пароль! Если это сделали не вы, то проигнорируйте это сообщение.</h3>
                    <h3>Для подтверждения смены пароля перейдите по ссылке</h3>
                    <a href="${link}"><h2>Ссылка</h2></a>

                    <p>
                    Решайте любые задачи в TOPVTOP
                    </p>
                    <p>
                    С уважением, служба заботы TOPVTOP      
                    </p>    
                </div>
            `,
      })
    return result
  }
}

export default new MailService()
