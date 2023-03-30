import { Schema, model } from "mongoose";
const ReviewSchema = new Schema({
	article: { type: Number, required: true },
	name: { type: String, required: true },
	rating: { type: Number, required: true },
	text: { type: String, required: true },
	date: { type: Date, required: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	delivery: { type: Schema.Types.ObjectId, ref: "Delivery", required: true },
	images: { type: Array, required: false },
	status: { type: String, required: true },
});

export const Review = model("Review", ReviewSchema);
