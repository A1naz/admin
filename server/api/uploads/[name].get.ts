import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
import { Upload } from "~~/server/lib/models/Upload";
export default eventHandler(async (event) => {
	const name = event.context.params?.name;
	if (!name) {
		return createError({
			statusCode: 400,
			message: "Не указано имя файла",
		});
	}
	const upload = await Upload.findOne({ filename: name });
	if (!upload) {
		return createError({
			statusCode: 400,
			message: "Файл не найден",
		});
	}
	setResponseHeader(event, "content-type", upload.type);
	return send(event, upload.data, "image/png");
});
