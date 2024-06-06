//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { Division, EndpointMeta, Role, User } from "../../../types/types";
import {
	getDivisionById,
	getDivisionsByOrganizationForUser,
	getDivisionsForUser,
	userHasAccessToDivision,
} from "../../../controllers/division.controller";
import { organizationExists } from "../../../controllers/organization.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.management, Role.admin, Role.user],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get ID from the Query Data (This ID serves as the Organization ID aswell as a specific Division's ID)
	const id = req.query.id as string | undefined;

	//Setup the Variable to Check whether the ID is for an Organization
	const isOrganizationID = id ? await organizationExists(id) : false;

	//Setup the Division Variable
	let division: Division | Array<Division> | null = null;

	//Check if the User does not have access to the Division
	if (id && !isOrganizationID && !(await userHasAccessToDivision(user, id)))
		return res.status(403).send({ error: "You do not have access to this Division" });

	//Check if no ID was provided and get a list of all Divisions
	if (!id) division = await getDivisionsForUser(user);

	//Check if the ID provided is an Organization's ID
	if (id && isOrganizationID) division = await getDivisionsByOrganizationForUser(user, id);

	//Check if the ID provided is a Division's ID
	if (id && !isOrganizationID) division = await getDivisionById(id);

	//Check if the Division is Invalid
	if (!division) return res.status(404).send({ error: "Division Could not be Found" });

	//Respond with a Success
	return res.status(200).send(division);
}
