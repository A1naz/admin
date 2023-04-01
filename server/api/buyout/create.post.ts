import { Buyout } from "@/server/lib/models/Buyout";
import { getServerSession } from "#auth";
import { User } from "~~/server/lib/models/User";
import { uuid } from "uuidv4";
type Item = {
	image: string;
	name: string;
	article: number;
	price: number;
	priceText: string;
	quantity: number;
	sizes: number[] | string[];
	sex: string;
	searchQuery: string;
	adress: string;
	dateRange: [Date, Date];
	selectedSize: number | string;
	rules: {
		[key: number | string]: boolean;
	};
};
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const user = await User.findOne({ uuid: session.uuid });
	if (!user) {
		return sendRedirect(event, "/auth", 302);
	}
	const body = await readBody(event);

	const products: Item[] = body;

	for await (const product of products) {
		const rules = Object.keys(product.rules).filter(
			(key) => product.rules[key],
		);
		const buyout = new Buyout({
			article: product.article,
			searchQuery: product.searchQuery,
			point: product.adress,
			dateStart: product.dateRange[0],
			dateEnd: product.dateRange[1],
			sizeparam: product.selectedSize,
			quantity: product.quantity,
			gender: product.sex,
			status: "active",
			orderPaymentStatus: "Не оплачен",
			servicePaymentStatus: "Не оплачен",
			user,
			rules,
			product: {
				name: product.name,
				price: product.price,
				priceText: product.priceText,
				image: product.image,
			},
			uuid: uuid(),
		});
		await buyout.save();
	}
	return {
		status: "ok",
	};
});
