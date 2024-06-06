//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { Credentials, EndpointMeta, Role, User } from "../../../types/types";
import {
	getCredentialsForUser,
	getCredentialsByDivisionForUser,
	userHasAccessToCredentials,
	getCredentialsById,
} from "../../../controllers/credentials.controller";
import { divisionExists } from "../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.management, Role.admin, Role.user],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get ID from the Query Data (This ID serves as the Division ID aswell as a specific Credentials's ID)
	const id = req.query.id as string | undefined;

	//Setup the Variable to Check whether the ID is for a Division
	const isDivisionID = id ? await divisionExists(id) : false;

	//Setup the Credentials Variable
	let credentials: Credentials | Array<Credentials> | null = null;

	//Check if the User does not have access to the Credentials
	if (id && !isDivisionID && !(await userHasAccessToCredentials(user, id)))
		return res.status(403).send({ error: "You do not have access to this credentials" });

	//Check if no ID was provided and get a list of all Credentials
	if (!id) credentials = await getCredentialsForUser(user);

	//Check if the ID provided is a Division's ID
	if (id && isDivisionID) credentials = await getCredentialsByDivisionForUser(user, id);

	//Check if the ID provided is a Credentials' ID
	if (id && !isDivisionID) credentials = await getCredentialsById(id);

	//Check if the Credentials is Invalid
	if (!credentials) return res.status(404).send({ error: "Credentials Could not be Found" });

	//Respond with a Success
	return res.status(200).send(credentials);
}
