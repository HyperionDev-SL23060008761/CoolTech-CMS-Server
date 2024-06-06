//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import {
	divisionExists,
	updateDivision,
	userHasAccessToDivision,
} from "../../../controllers/division.controller";
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

	//Get the Division's ID from the Query Parameters
	const id = req.query.id as string | undefined;

	//Get the Division's Name from the Request Body
	const name = req.body.name as string | undefined;

	//Get the Organization ID from the Request Body
	const organizationID = (req.body.organizationID || req.body.organization) as string | undefined;

	//Check if the Organization's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Check if No Update Fields were Provided
	if (!name && !organizationID)
		return res.status(417).send({ error: "Atleast one updated field is required" });

	//Setup the Variable to check if the Division Exists
	const divisionExistStatus = await divisionExists(id);

	//Check if the Division Could not Be Found
	if (!divisionExistStatus) return res.status(404).send({ error: "Division does not exist" });

	//Check if the User does not have access to the Division
	if (!(await userHasAccessToDivision(user, id)))
		return res.status(403).send({ error: "You do not have access to this division" });

	//Setup the Variable to check if the Organization Exists
	const organizationExistStatus = organizationID ? await organizationExists(organizationID) : true;

	//Check if the Organization Could not Be Found
	if (!organizationExistStatus)
		return res.status(404).send({ error: "Organization does not exist" });

	//Check if the User does not have access to the Organization
	if (organizationID && !(await userHasAccessToOrganization(user, organizationID)))
		return res.status(403).send({ error: "You do not have access to this organization" });

	//Update the Division
	const division = await updateDivision(id, name, organizationID);

	//Check if the Division Could not Be Updated
	if (!division)
		return res.status(500).send({ error: "There was a Problem Updating the Division" });

	//Respond with a Success
	return res.status(200).send(division);
}
