//External Imports
import { Schema, model } from "mongoose";

//Internal Imports
import { Organization } from "../types";

//Setup the Schema
const organizationSchema = new Schema<Organization>({
	name: {
		type: String,
		required: true,
	},
});

//Export the Model
export const OrganizationModel = model("Organization", organizationSchema);
