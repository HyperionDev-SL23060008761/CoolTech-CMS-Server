//External Imports
import { Schema, model } from "mongoose";

//Internal Imports
import { Division } from "../types";

//Setup the Schema
const divisionSchema = new Schema<Division>({
	name: { type: String, required: true },
	organization: { type: String, required: true },
});

//Export the Model
export const DivisionModel = model("Division", divisionSchema);
