//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import { createOrganization } from "../../../controllers/organization.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get the Organization's Name from the Request Body
	const name = req.body.name as string | undefined;

	//Check if the Organization's Name is invalid
	if (!name) return res.status(417).send({ error: "name is required" });

	//Create the Organization
	const organization = await createOrganization(name);

	//Check if the Organization Could not Be Created
	if (!organization)
		return res.status(500).send({ error: "There was a Problem Creating the Organization" });

	//Respond with a Success
	return res.status(200).send(organization);
}
