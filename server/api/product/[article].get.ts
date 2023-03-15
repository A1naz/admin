import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { context } from "esbuild";

export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const params = event.context.params as any;

	const data: any = await $fetch(
		`https://wbx-content-v2.wbstatic.net/ru/${params.article}.json`,
		{
			method: "GET",
		},
	);

	const rawData: any = await $fetch(
		`https://card.wb.ru/cards/detail?spp=0&regions=80,64,38,4,115,83,33,68,70,69,30,86,40,1,66,31,48,110,22&pricemarginCoeff=1.0&reg=0&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,7,3,6,21&dest=12358353&nm=${params.article}`,
		{
			method: "GET",
		},
	);
	const sizes = data?.sizes_table?.values
		? data?.sizes_table?.values.map((size: any) => size.tech_size)
		: [];
	console.log(data?.sizes_table?.values);
	console.log(sizes);
	const priceData = JSON.parse(rawData);
	const price = priceData?.data?.products[0]?.salePriceU
		.toString()
		.replace(/0/g, "");
	if (!price || !sizes) {
		return createError({
			statusCode: 400,
			message: "Не удалось получить данные о товаре",
		});
	}
	return {
		product: {
			article: (data.nm_id as number) || (params.article as number),
			name: `${data.selling.brand_name} / ${data.imt_name}` || "",
			sizes: (sizes as number[]) || [],
			price: (price as number) || 0,
		},
	};
});
