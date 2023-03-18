import { Schema, model } from "mongoose";
import { uuid } from "uuidv4";
const BuyoutSchema = new Schema({
	searchQuery: { type: String, required: true, text: true },
	sizeparam: { type: String, required: true, text: true },
	quantity: { type: Number, required: true, text: true },
	gender: { type: String, required: true, text: true },
	article: { type: Number, required: true, text: true },
	point: { type: String, required: true, text: true },
	dateStart: { type: Date, required: true },
	dateEnd: { type: Date, required: true },
	orderPaymentDate: { type: Date },
	product: { type: Object, required: true },
	orderPaymentStatus: {
		type: String,
		required: true,
	},
	orderPaymentLink: { type: String, required: false },
	servicePaymentDate: { type: Date },
	servicePaymentStatus: {
		type: String,
		required: true,
	},
	servicePaymentLink: {
		type: String,
		required: false,
	},
	rules: { type: Array, required: true },
	status: { type: String, required: true, text: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	uuid: { type: String, default: uuid() },
	createdAt: { type: Date, default: Date.now },
	data5: { type: {}, default: "" },
	data6: { type: {}, default: "" },
	data7: { type: {}, default: "" },
	data8: { type: {}, default: "" },
	data9: { type: {}, default: "" },
	data10: { type: {}, default: "" },
	data11: { type: {}, default: "" },
	data12: { type: {}, default: "" },
	data13: { type: {}, default: "" },
	data14: { type: {}, default: "" },
	data15: { type: {}, default: "" },
	data16: { type: {}, default: "" },
	data17: { type: {}, default: "" },
	data18: { type: {}, default: "" },
});

export const Buyout = model("Buyout", BuyoutSchema);
