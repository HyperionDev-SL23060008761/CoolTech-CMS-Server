//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import {
	organizationExists,
	deleteOrganization,
	userHasAccessToOrganization,
} from "../../../controllers/organization.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get the Organization's ID from the Query Parameters
	const id = req.query.id as string | undefined;

	//Check if the Organization's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Setup the Variable to Check if the Organization Exists
	const organizationExistStatus = await organizationExists(id);

	//Check if the Organization Could not Be Found
	if (!organizationExistStatus)
		return res.status(404).send({ error: "Organization does not exist" });

	//Check if the User does not have access to the Organization
	if (!(await userHasAccessToOrganization(user, id)))
		return res.status(403).send({ error: "You do not have access to this Organization" });

	//Delete the Organization
	const result = await deleteOrganization(id);

	//Check if the Organization Could not Be Delete
	if (!result)
		return res.status(500).send({ error: "There was a Problem Deleting the Organization" });

	//Respond with a Success
	return res.sendStatus(200);
}
