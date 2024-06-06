//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../../types/types";
import { updateUser, userExists } from "../../../../controllers/user.controller";

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

	//Get the User's Name from the Request Body
	const username = req.body.username as string | undefined;

	//Get the Role from the Request Body
	const role = req.body.role as string | undefined;

	//Check if the Requested User's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Setup the Variable to check if the Requested User Exists
	const requestedUserExistStatus = await userExists(id);

	//Check if the Requested User does not exists
	if (!requestedUserExistStatus)
		return res.status(404).send({ error: "Requested User does not exist" });

	//Check if No Update Fields were Provided
	if (!username && !role)
		return res.status(417).send({ error: "Atleast one updated field is required" });

	//Update the Requested User
	const requestedUser = await updateUser(id, username, role as Role);

	//Check if the Requested User Could not Be Updated
	if (!requestedUser)
		return res.status(500).send({ error: "There was a Problem Updating the Requested User" });

	//Respond with a Success
	return res.status(200).send(requestedUser);
}
