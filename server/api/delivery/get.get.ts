import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { context } from "esbuild";
import { Delivery } from "@/server/lib/models/Delivery";
import { Buyout } from "@/server/lib/models/Buyout";
import QRCode from "qrcode";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const { status, limit, skip } = getQuery(event);
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const all = await Delivery.find({ user: user });
	let deliveries;
	if (status === "all") {
		deliveries = await Delivery.find({ user: user })
			.sort({ _id: -1 })
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "active") {
		deliveries = await Delivery.find({ user: user, status: "active" })
			.sort({
				_id: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "completed") {
		deliveries = await Delivery.find({ user: user, status: "completed" })
			.sort({
				_id: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else if (status === "canceled") {
		deliveries = await Delivery.find({ user: user, status: "canceled" })
			.sort({
				_id: -1,
			})
			.skip(skip as number)
			.limit(limit as number);
	} else {
		return {
			error: "Неизвестный статус",
		};
	}
	// const buyout = await Buyout.findOne({ user: user }).sort({ _id: 1 });
	// if (!deliveries.length) {
	// 	const created = new Delivery({
	// 		article: buyout?.article,
	// 		pricebuy: buyout?.product.price,
	// 		point: buyout?.point,
	// 		user: user,
	// 		idbuyout: buyout,
	// 		uuidbuyout: buyout?.uuid,
	// 		statusdelivery: [{ status: "Отправлен на сборку", date: new Date() }],
	// 		receiptcode: "520",
	// 		receiptcodeqr: await QRCode.toDataURL("520", {
	// 			width: 250,
	// 			scale: 8,
	// 			margin: 0,
	// 		}),
	// 		recipient: "Данил",
	// 		recipientphone: "+7 (999) 999 99 99",
	// 		status: "active",
	// 		updatedAt: new Date(),
	// 	});
	// 	await created.save();
	// }
	const format = await Promise.all(
		deliveries.map(async (delivery) => {
			const buyout = await Buyout.findOne({ _id: delivery.idbuyout });
			if (!buyout) return;
			const place = all.findIndex(
				(item) => item._id.toString() === delivery._id.toString(),
			);

			const phone = delivery.recipientphone;
			const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`;

			return {
				place: place + 1,
				uuid: buyout.uuid,
				article: delivery.article,
				pricebuy: delivery.pricebuy,
				size: buyout.sizeparam,
				point: delivery.point,
				statusdelivery: delivery.statusdelivery,
				currentstatus:
					delivery.statusdelivery[delivery.statusdelivery.length - 1].status,
				statusupdated:
					delivery.statusdelivery[delivery.statusdelivery.length - 1].date,

				productname: buyout.product.name,
				productimage: buyout.product.image,
				receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
				receiptcodeqr: delivery.receiptcodeqr
					? delivery.receiptcodeqr
					: undefined,
				recipient: delivery.recipient,
				recipientphone: replaced,
				updatedAt: delivery.updatedAt,
			};
		}),
	);
	console.log(format);
	return format;
});
