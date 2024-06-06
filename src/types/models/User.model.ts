//External Imports
import { Schema, model } from "mongoose";

//Internal Imports
import { Role, User } from "../types";

//Setup the Schema
const userSchema = new Schema<User>({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: Role,
		default: Role.user,
	},
	divisions: { type: [String], required: true },
});

//Export the Model
export const UserModel = model("User", userSchema);
