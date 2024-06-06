//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../../types/types";
import { addRemoveUserDivision, userExists } from "../../../../controllers/user.controller";
import { divisionExists } from "../../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get the Requested User's ID from the Query Parameters
	const id = req.query.id as string | undefined;

	//Get the Division ID from the Request Body
	const divisionID = req.body.division as string | undefined;

	//Check if the Requested User's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Check if the Division ID is invalid
	if (!divisionID) return res.status(417).send({ error: "divisionID is required" });

	//Setup the Variable to check if the Requested User Exists
	const requestedUserExistStatus = await userExists(id);

	//Check if the Requested User does not exists
	if (!requestedUserExistStatus)
		return res.status(404).send({ error: "Requested User does not exist" });

	//Setup the Variable to Check if the Requested Division does not exists
	const requestedDivisionExistStatus = await divisionExists(divisionID);

	//Check if the Requested Division does not exists
	if (!requestedDivisionExistStatus)
		return res.status(404).send({ error: "Requested Division does not exist" });

	//Update the Requested User
	const requestedUser = await addRemoveUserDivision(id, divisionID, false);

	//Check if the Requested User Could not Be Updated
	if (!requestedUser)
		return res.status(500).send({ error: "There was a Problem Adding the Division" });

	//Respond with a Success
	return res.status(200).send(requestedUser);
}
