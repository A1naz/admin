import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { checkSignature } from "@/server/lib/telegram/mod";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;
	const runtimeConfig = useRuntimeConfig();
	const body = await readBody(event);
	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}

	const candidate = await User.findOne({ telegram: body.username });
	if (candidate && candidate.uuid !== user.uuid) {
		throw createError({
			statusCode: 400,
			message: "Этот Telegram уже занят",
		});
	}
	const valid = checkSignature(runtimeConfig.BOT_TOKEN, body);

	if (!valid) {
		throw createError({
			statusCode: 400,
			message: "Invalid signature",
		});
	}

	user.telegram = body.username;
	await user.save();

	console.log("session", session);
	return {
		status: "ok",
	};
});
