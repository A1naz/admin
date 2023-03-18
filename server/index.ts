import { Nitro } from "nitropack";
import mongoose from "mongoose";
import { createStorage } from "unstorage";
import mongodbDriver from "unstorage/drivers/mongodb";

export default async (_nitroApp: Nitro) => {
	const config = useRuntimeConfig();
	try {
		await mongoose.connect(config.MONGODB_URI);
		console.log("Connected to MongoDB");
	} catch (error) {
		console.error(error);
	}
};
