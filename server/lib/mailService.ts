//@ts-nocheck
import nodemailer from "nodemailer";
const config = useRuntimeConfig();
const { smtpHost, smtpPort, smtpUser, smtpPass, privateKey } = config;
console.log("smtpHost", smtpHost);
const alias = "support@topvtop.com";
class MailService {
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
				domainName: "openbomber.com",
				keySelector: "google",
				privateKey,
			},
		});
	}
	async sendActivationMail(to, link) {
		await this.tranporter
			.sendMail({
				from: alias,
				to: to,
				subject: "Активация аккаунта на TOPVTOP",
				text: "",
				html: `
                <div>
                    <h1>Для активации аккаунта перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
			})
			.then((info) => {
				console.log(info);
			});
	}
	async sendChangePasswordMail(to, link, username) {
		await this.tranporter
			.sendMail({
				from: alias,
				to: to,
				subject: "Смена пароля на TOPVTOP",
				text: "",
				html: `
                <div>
                    <h1>Привет, ${username}!</h1>
					<h2>Вы собираетесь сменить пароль! Если это сделали не вы, то проигнорируйте это сообщение.</h2>
                    <h2>Для подтверждения смены пароля на перейдите по ссылке</h2>
                    <a href="${link}">Ссылка</a>
                </div>
            `,
			})
			.then((info) => {
				console.log(info);
			});
	}
}

export default new MailService();
