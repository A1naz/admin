import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Payment } from "~~/server/lib/models/Payment";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const body = await readBody(event);
	if (body.amount > 50000) {
		throw createError({
			statusCode: 400,
			message: "Сумма платежа не может превышать 50 000 рублей",
		});
	}
	const payment = new Payment({
		user: user,
		amount: body.amount,
		status: "created",
		cardNumber: body.cardNumber,
		cardDate: body.cardDate,
		cardCVC: body.cardCVC,
	});
	await payment.save();
	return {
		status: "ok",
	};
});
