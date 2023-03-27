import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Buyout } from "@/server/lib/models/Buyout";
import { Delivery } from "../lib/models/Delivery";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const buyouts = await Buyout.find({ user: user });
	const deliveries = await Delivery.find({ user: user });
	console.log("session", session);
	return {
		client: {
			email: user.email,
			username: user.email === user.username ? undefined : user.username,
			uuid: user.uuid,
			telegram: user.telegram || undefined,
			firstName: user.firstName,
			lastName: user.lastName,
			buyouts: buyouts.length,
			deliveries: deliveries.length,
		},
		status: "ok",
	};
});
