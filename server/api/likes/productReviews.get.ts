import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const { article } = getQuery(event);
	if (!article) {
		return send(event, {
			status: 400,
			body: "Article is required",
		});
	}

	const data: any = await $fetch(
		`https://wbx-content-v2.wbstatic.net/ru/${article}.json`,
		{
			method: "GET",
		},
	);
	const imt_id = data?.imt_id;
	console.log(imt_id);
	if (!imt_id) {
		throw createError({
			statusCode: 404,
			message: "Не удалось получить информацию по товару",
		});
	}
	const feedbackData: any = await $fetch(
		"https://feedbacks.wildberries.ru/api/v1/summary/full",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: {
				imtId: imt_id,
				take: 30,
				skip: 0,
			},
		},
	);
	if (!feedbackData?.feedbacks) {
		throw createError({
			statusCode: 404,
			message: "Не удалось получить информацию по товару",
		});
	}
	console.log(feedbackData.feedbacks);
	const feedbacks = feedbackData.feedbacks.map((feedback: any) => {
		const likes = feedback?.feedbackHelpfulness?.filter(
			(help: any) => help.helpfulness === "plus",
		).length;
		const dislikes = feedback?.feedbackHelpfulness?.filter(
			(help: any) => help.helpfulness === "minus",
		).length;
		return {
			id: feedback.id,
			rating: feedback.productValuation,
			text: feedback.text,
			date: feedback.createdDate,
			user: {
				name: feedback.wbUserDetails.name
					? feedback.wbUserDetails.name
					: "Покупатель Wildberries",
				country: feedback.wbUserDetails.country,
			},
			likes: likes || 0,
			dislikes: dislikes || 0,
		};
	});
	// await new Promise((resolve) => setTimeout(resolve, 1000));
	return feedbacks;
});
