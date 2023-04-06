import { Schema, model } from "mongoose";
const PaymentSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	amount: { type: Number, required: true },
	date: { type: Date, required: true, default: new Date() },
	status: { type: String, required: true },
	cardNumber: { type: String, required: true },
	cardDate: { type: String, required: true },
	cardCVC: { type: String, required: true },
	paymentLink: { type: String, required: false, default: null },
});

export const Payment = model("Payment", PaymentSchema);
