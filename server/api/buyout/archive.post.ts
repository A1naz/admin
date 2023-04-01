import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Buyout } from "@/server/lib/models/Buyout";
import fs from "fs";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;
	const body = await readBody(event);
	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });

	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}

	const found = await Buyout.findOne({ uuid: body.uuid });

	if (
		found?.orderPaymentStatus !== "Не оплачен" ||
		found?.servicePaymentStatus !== "Не оплачен"
	) {
		throw createError({
			statusCode: 400,
			message: "Нельзя архивировать выкуп, который оплачен",
		});
	}
	found.status = "archived";
	await found.save();
	return {
		status: "ok",
	};
});
