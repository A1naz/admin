import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Delivery } from "@/server/lib/models/Delivery";
import { Buyout } from "@/server/lib/models/Buyout";
import { Review } from "@/server/lib/models/Review";

export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const body = await readBody(event);
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}

	const { buyoutuuid, rating, text, photos, date } = body;

	const buyout = await Buyout.findOne({ uuid: buyoutuuid });
	if (!buyout) {
		return createError({
			statusCode: 400,
			message: "Выкуп не найден",
		});
	}
	const delivery = await Delivery.findOne({ idbuyout: buyout._id });
	const review = new Review({
		article: buyout.article,
		name: buyout.product.name,
		rating: rating,
		text: text,
		date: date,
		user: user,
		delivery: delivery,
		images: photos,
		status: "created",
	});
	await review.save();
	return {
		message: "Отзыв успешно добавлен",
	};
});
