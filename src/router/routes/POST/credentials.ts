//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import { createCredentials } from "../../../controllers/credentials.controller";
import { divisionExists, userHasAccessToDivision } from "../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin, Role.management, Role.user],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

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

	//Check if the Division's ID is invalid
	if (!divisionID) return res.status(417).send({ error: "divisionID is required" });

	//Check if the Credentials's Name is invalid
	if (!name) return res.status(417).send({ error: "name is required" });

	//Check if the Username is invalid
	if (!username) return res.status(417).send({ error: "username is required" });

	//Check if the Password is invalid
	if (!password) return res.status(417).send({ error: "password is required" });

	//Setup the Variable to check if the Division Exists
	const divisionExistStatus = await divisionExists(divisionID);

	//Check if the Division Could not Be Found
	if (!divisionExistStatus) return res.status(404).send({ error: "Division does not exist" });

	//Check if the User does not have access to the Division
	if (!(await userHasAccessToDivision(user, divisionID)))
		return res.status(403).send({ error: "You do not have access to this Division" });

	//Create the Credentials
	const credentials = await createCredentials(divisionID, name, username, password, notes);

	//Check if the Credentials Could not Be Created
	if (!credentials)
		return res.status(500).send({ error: "There was a Problem Creating the Credentials" });

	//Respond with a Success
	return res.status(200).send(credentials);
}
