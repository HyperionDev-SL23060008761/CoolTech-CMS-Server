//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import {
	getOrganizationById,
	getOrganizationsForUser,
	userHasAccessToOrganization,
} from "../../../controllers/organization.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin, Role.management, Role.user],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get ID from the Query Data
	const id = req.query.id as string | undefined;

	//Check if the User does not have access to the Organization
	if (id && !(await userHasAccessToOrganization(user, id)))
		return res.status(403).send({ error: "You do not have access to this Organization" });

	//Get the Organization (or List of Organizations if no ID was provided)
	const organization = id ? await getOrganizationById(id) : await getOrganizationsForUser(user);

	//Check if the Organization is Invalid
	if (!organization) return res.status(404).send({ error: "Organization Could not be Found" });

	//Respond with a Success
	return res.status(200).send(organization);
}
