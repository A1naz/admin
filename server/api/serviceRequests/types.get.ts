import { Service } from "~/server/lib/models/Service";
import { User } from "~/server/lib/models/User";

export default defineEventHandler(async (event) => {
        const groupedServices = await Service.aggregate([
                {
                        $group: {
                                _id: "$type", // Группировка по полю "type"
                                services: {
                                        $push: {
                                                type: "$type",
                                                slug: "$slug",
                                                name: "$name",
                                        },
                                },
                        },
                },
        ]);

        const format = groupedServices.map((group) => {
                return {
                        type: group._id,
                        services: group.services,
                };
        })
        return format
}
)