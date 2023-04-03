import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { context } from "esbuild";
import { Delivery } from "@/server/lib/models/Delivery";
import { Buyout } from "@/server/lib/models/Buyout";
import { Review } from "@/server/lib/models/Review";
import { Upload } from "@/server/lib/models/Upload";

import fs from "fs";
function decodeBase64Image(base64Str: string) {
	const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	const image = {} as any;
	if (!matches || matches.length !== 3) {
		throw new Error("Invalid base64 string");
	}

	image.type = matches[1];
	image.data = Buffer.from(matches[2], "base64");

	return image;
}
export default eventHandler(async (event) => {
	const runtimeConfig = useRuntimeConfig();
	const session = (await getServerSession(event)) as any;
	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const body = await readBody(event);
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const { type, data } = body;
	const image = decodeBase64Image(data);
	const filename = `${Date.now()}.png`;

	const upload = new Upload({
		type,
		filename,
		data: image.data,
	});
	await upload.save();
	return {
		success: true,
		url: `${runtimeConfig.PUBLIC_SITE_URL}/api/uploads/${filename}`,
		filename: filename,
	};
});
