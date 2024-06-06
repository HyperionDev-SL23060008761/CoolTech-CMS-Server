//External Imports
import { Schema, model } from "mongoose";

//Internal Imports
import { Credentials } from "../types";

//Setup the Schema
const credentialsSchema = new Schema<Credentials>({
	division: { type: String, required: true },
	name: { type: String, required: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	notes: { type: String },
});

//Export the Model
export const CredentialsModel = model("Credentials", credentialsSchema);
