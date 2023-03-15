import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import jwt from "jsonwebtoken";
import { run } from "node:test";
import bcrypt from "bcrypt";
export default eventHandler(async (event) => {
	const runtimeConfig = useRuntimeConfig();
	const params = event.context.params;

	if (!params?.token) {
		throw createError({
			statusCode: 400,
			message: "Token is not valid",
		});
	}

	try {
		const data: any = jwt.verify(params.token, runtimeConfig.SECRET);

		if (!data) {
			throw createError({
				statusCode: 400,
				message: "Token is not valid",
			});
		}
		const user = await User.findById(data.id);

		if (!user) {
			throw createError({
				statusCode: 400,
				message: "User not found",
			});
		}
		const hash = bcrypt.hashSync(data.password, 7);

		user.password = hash;
		await user.save();

		return sendRedirect(event, "/auth?passwordChanged=true", 302);
	} catch (e) {
		return "Token is not valid";
	}
});
