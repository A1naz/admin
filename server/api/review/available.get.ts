import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Delivery } from "@/server/lib/models/Delivery";
import { Buyout } from "@/server/lib/models/Buyout";

export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const readyForReview = await Delivery.find({
		user: user,
		status: "completed",
	}).sort({
		createdAt: -1,
	});

	const format = await Promise.all(
		readyForReview.map(async (delivery) => {
			const buyout = await Buyout.findOne({ _id: delivery.idbuyout });
			if (!buyout) return;
			return {
				buyoutuuid: buyout.uuid,
				article: delivery.article,
				pricebuy: delivery.pricebuy,
				size: buyout.sizeparam,
				productname: buyout.product.name,
				productimage: buyout.product.image,
				updatedAt: delivery.updatedAt,
			};
		}),
	);
	console.log(format);
	return format;
});
