import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { context } from "esbuild";
import { Buyout } from "@/server/lib/models/Buyout";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const { status } = getQuery(event);
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	let buyouts;
	if (status === "all") {
		buyouts = await Buyout.find({ user: user }).sort({ createdAt: -1 });
	} else if (status === "active") {
		buyouts = await Buyout.find({ user: user, status: "active" }).sort({
			createdAt: -1,
		});
	} else if (status === "completed") {
		buyouts = await Buyout.find({ user: user, status: "completed" }).sort({
			createdAt: -1,
		});
	} else if (status === "canceled") {
		buyouts = await Buyout.find({ user: user, status: "canceled" }).sort({
			createdAt: -1,
		});
	} else if (status === "archived") {
		buyouts = await Buyout.find({ user: user, status: "archived" }).sort({
			createdAt: -1,
		});
	} else {
		buyouts = await Buyout.find({ user: user }).sort({ createdAt: -1 });
	}

	const format = buyouts.map((buyout) => {
		return {
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
