import { User } from "@/server/lib/models/User";
import { Buyout } from "@/server/lib/models/Buyout";
import { getServerSession } from "#auth";
import { context } from "esbuild";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}

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
		dateRange: [Date | null, Date | null] | [];
		selectedSize: number | string;
		rules: {
			[key: number]: boolean;
		};
	};
	const query = getQuery(event);
	const buyout = await Buyout.findOne({ uuid: query.uuid });
	console.log(buyout);
	if (!buyout) {
		return createError({
			statusCode: 400,
			message: "Выкуп не найден",
		});
	}

	const article = buyout?.article;
	const data: any = await $fetch(
		`https://wbx-content-v2.wbstatic.net/ru/${article}.json`,
		{
			method: "GET",
		},
	);

	const rawData: any = await $fetch(
		`https://card.wb.ru/cards/detail?spp=0&regions=80,64,38,4,115,83,33,68,70,69,30,86,40,1,66,31,48,110,22&pricemarginCoeff=1.0&reg=0&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,7,3,6,21&dest=12358353&nm=${article}`,
		{
			method: "GET",
		},
	);
	const sizes = data?.sizes_table?.values
		? data?.sizes_table?.values.map((size: any) => size.tech_size)
		: [];
	const priceData = JSON.parse(rawData);
	const priceRaw = priceData?.data?.products[0]?.salePriceU.toString();
	if (!priceRaw || !sizes) {
		return createError({
			statusCode: 400,
			message: "Не удалось получить данные о товаре",
		});
	}
	const price = priceRaw?.substring(0, priceRaw.length - 2);
	console.log(price);
	const currency = new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: "RUB",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
	const priceText = currency.format(price);

	return {
		image: buyout.product.image,
		article: (data.nm_id as number) || (buyout.article as number),
		name: `${data.selling.brand_name} / ${data.imt_name}` || "",
		sizes: (sizes as number[] | string[]) || [],
		price: (price as number) || 0,
		priceText: (priceText as string) || "",
		quantity: buyout.quantity,
		sex: buyout.gender,
		searchQuery: buyout.searchQuery,
		adress: buyout.point,
		dateRange: [buyout.dateStart, buyout.dateEnd],
		selectedSize: buyout.sizeparam,
		rules: buyout.rules,
	};
});
