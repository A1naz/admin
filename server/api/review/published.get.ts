import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Review } from "~~/server/lib/models/Review";

export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const reviews = await Review.find({ user: user }).sort({ _id: -1 });
	const format = await Promise.all(
		reviews.map((review) => {
			return {
				article: review.article,
				name: review.name,
				text: review.text,
				rating: review.rating,
				images: review.images,
				date: review.date,
				status: review.status,
			};
		}),
	);
	console.log(format);
	return format;
});
