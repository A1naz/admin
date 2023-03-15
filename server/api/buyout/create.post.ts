import { Buyout } from "@/server/lib/models/Buyout";
import { getServerSession } from "#auth";

export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}

	const body = await readBody(event);
});
