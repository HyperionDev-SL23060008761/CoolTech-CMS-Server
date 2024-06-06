//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import {
	credentialsExists,
	deleteCredentials,
	userHasAccessToCredentials,
} from "../../../controllers/credentials.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin, Role.management],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get the Credentials's ID from the Query Parameters
	const id = req.query.id as string | undefined;

	//Check if the Credentials's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Setup the Variable to Check if the Credentials Exists
	const credentialsExistStatus = await credentialsExists(id);

	//Check if the Credentials Could not Be Found
	if (!credentialsExistStatus) return res.status(404).send({ error: "Credentials does not exist" });

	//Check if the User does not have access to the Credentials
	if (!(await userHasAccessToCredentials(user, id)))
		return res.status(403).send({ error: "You do not have access to this credentials" });

	//Delete the Credentials
	const result = await deleteCredentials(id);

	//Check if the Credentials Could not Be Delete
	if (!result)
		return res.status(500).send({ error: "There was a Problem Deleting the Credentials" });

	//Respond with a Success
	return res.sendStatus(200);
}
