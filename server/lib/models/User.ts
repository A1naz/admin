import { Schema, model } from "mongoose";
const UserSchema = new Schema({
	username: { type: String, unique: true, required: true, text: true },
	firstName: { type: String, required: false },
	lastName: { type: String, required: false },
	email: { type: String, unique: true, required: false },
	password: { type: String, required: false },
	uuid: { type: String, unique: true, required: true },
	roles: [{ type: String, ref: "Role" }],
	emailConfirmed: { type: Boolean, default: false },
	telegram: { type: String, required: false },
	registrationDate: { type: Date, default: Date.now },
});

export const User = model("User", UserSchema);
