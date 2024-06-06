//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import { userExists, deleteUser } from "../../../controllers/user.controller";

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

	//Check if the Requested User's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Setup the Variable to Check if the Requested User Exists
	const requestedUserExistStatus = await userExists(id);

	//Check if the Requested User Could not Be Found
	if (!requestedUserExistStatus)
		return res.status(404).send({ error: "Requested User does not exist" });

	//Delete the Requested User
	const result = await deleteUser(id);

	//Check if the Requested User Could not Be Delete
	if (!result)
		return res.status(500).send({ error: "There was a Problem Deleting the Requested User" });

	//Respond with a Success
	return res.sendStatus(200);
}
