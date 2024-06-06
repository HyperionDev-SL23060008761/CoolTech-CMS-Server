//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import { createDivision } from "../../../controllers/division.controller";
import {
	organizationExists,
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

	//Get the Division's Name from the Request Body
	const name = req.body.name as string | undefined;

	//Get the Organization ID from the Request Body
	const organizationID = (req.body.organizationID || req.body.organization) as string | undefined;

	console.log(req.body);

	//Check if the Division's Name is invalid
	if (!name) return res.status(417).send({ error: "name is required" });

	//Check if the Organization's ID is invalid
	if (!organizationID) return res.status(417).send({ error: "organizationID is required" });

	//Setup the Variable to check if the Organization Exists
	const organizationExistStatus = await organizationExists(organizationID);

	//Check if the user does not have access to the Organization
	if (!(await userHasAccessToOrganization(user, organizationID)))
		return res.status(403).send({ error: "You do not have access to this Organization" });

	//Check if the Organization Could not Be Found
	if (!organizationExistStatus)
		return res.status(404).send({ error: "Organization does not exist" });

	//Create the Division
	const division = await createDivision(name, organizationID);

	//Check if the Division Could not Be Created
	if (!division)
		return res.status(500).send({ error: "There was a Problem Creating the Division" });

	//Respond with a Success
	return res.status(200).send(division);
}
