import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { context } from "esbuild";
import { Delivery } from "@/server/lib/models/Delivery";
import { Buyout } from "@/server/lib/models/Buyout";
import { Review } from "@/server/lib/models/Review";
import QRCode from "qrcode";
import { imgbox } from "imgbox-js";

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
const uploadImage = async (base64img: string) => {
	const decoded = decodeBase64Image(base64img);
	const response = await $fetch("https://freeimage.host/api/1/upload", {
		method: "POST",
		params: {
			key: "6d207e02198a847aa98d0a2a901485a5",
			action: "upload",
			source: decoded,
		},
	}).catch((e) => {
		console.log(e);
	});
	console.log(response);
	const { image } = response as any;
	return image.url;
};
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
	// for await (const image of photos) {
	// 	if (image) {
	// 		const url = await uploadImage(image);
	// 		console.log(url);
	// 		uploaded.push(url);
	// 	}
	// }
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
