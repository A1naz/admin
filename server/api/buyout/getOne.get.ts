import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Buyout } from "@/server/lib/models/Buyout";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const { uuid } = getQuery(event);
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const all = await Buyout.find({ user: user });
	const buyout = await Buyout.findOne({ user: user, uuid });
	if (!buyout) {
		throw createError({
			statusCode: 404,
			message: "Buyout not found",
		});
	}

	const place = all.findIndex((item) => item.uuid === buyout.uuid);
	return {
		place: place + 1,
		uuid: buyout.uuid,
		article: buyout.article,
		searchQuery: buyout.searchQuery,
		point: buyout.point,
		dateStart: buyout.dateStart,
		dateEnd: buyout.dateEnd,
		sizeparam: buyout.sizeparam,
		quantity: buyout.quantity,
		gender: buyout.gender,
		status: buyout.status,
		orderPaymentStatus: buyout.orderPaymentStatus,
		servicePaymentStatus: buyout.servicePaymentStatus,
		rules: buyout.rules,
		createdAt: buyout.createdAt,
		product: buyout.product,
	};
});
