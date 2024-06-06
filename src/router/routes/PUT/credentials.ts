//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import {
	credentialsExists,
	updateCredentials,
	userHasAccessToCredentials,
} from "../../../controllers/credentials.controller";
import { divisionExists, userHasAccessToDivision } from "../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin, Role.management],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get the Division's ID from the Query Parameters
	const id = req.query.id as string | undefined;

	//Get the Division ID from the Request Body
	const divisionID = (req.body.divisionID || req.body.division) as string | undefined;

	//Get the Credential's Name from the Request Body
	const name = req.body.name as string | undefined;

	//Get the Username from the Request Body
	const username = req.body.username as string | undefined;

	//Get the Password from the Request Body
	const password = req.body.password as string | undefined;

	//Get the Notes from the Request Body
	const notes = req.body.notes as string | undefined;

	//Check if the Credential's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Setup the Variable to check if the Credentials Exist
	const credentialsExistStatus = await credentialsExists(id);

	//Check if the Credentials does not exists
	if (!credentialsExistStatus) return res.status(404).send({ error: "Credentials does not exist" });

	//Check if the User does not have access to the Credentials
	if (!(await userHasAccessToCredentials(user, id)))
		return res.status(403).send({ error: "You do not have access to this credentials" });

	//Check if No Update Fields were Provided
	if (!divisionID && !name && !username && !password && !notes)
		return res.status(417).send({ error: "Atleast one updated field is required" });

	//Setup the Variable to check if the Division Exists
	const divisionExistStatus = divisionID ? await divisionExists(divisionID) : true;

	//Check if the Division Could not Be Found
	if (!divisionExistStatus) return res.status(404).send({ error: "Division does not exist" });

	//Check if the User does not have access to the Division
	if (divisionID && !(await userHasAccessToDivision(user, divisionID)))
		return res.status(403).send({ error: "You do not have access to this division" });

	//Update the Credentials
	const credentials = await updateCredentials(id, divisionID, name, username, password, notes);

	//Check if the Credentials Could not Be Updated
	if (!credentials)
		return res.status(500).send({ error: "There was a Problem Updating the Credentials" });

	//Respond with a Success
	return res.status(200).send(credentials);
}
