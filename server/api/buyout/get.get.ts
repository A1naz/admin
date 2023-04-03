import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { context } from "esbuild";
import { Buyout } from "@/server/lib/models/Buyout";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const { status, limit, skip } = getQuery(event);
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const all = await Buyout.find({ user: user });
	let buyouts;
	if (status === "all") {
		buyouts = await Buyout.find({ user: user })
			.sort({ createdAt: -1 })
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "active") {
		buyouts = await Buyout.find({ user: user, status: "active" })
			.sort({
				createdAt: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "completed") {
		buyouts = await Buyout.find({ user: user, status: "completed" })
			.sort({
				createdAt: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "canceled") {
		buyouts = await Buyout.find({ user: user, status: "canceled" })
			.sort({
				createdAt: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "archived") {
		buyouts = await Buyout.find({ user: user, status: "archived" })
			.sort({
				createdAt: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else {
		buyouts = await Buyout.find({ user: user })
			.sort({ createdAt: -1 })
			.skip(skip as number)
			.limit(limit as number);
	}

	const format = buyouts.map((buyout) => {
		const place = all.findIndex((item) => item.uuid === buyout.uuid);
		return {
			place: buyout.place ? buyout.place : place + 1,
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
	return format;
});
