//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { User, EndpointMeta, Role } from "../../../../types/types";
import { getUserByID, getUsers, getUsersByDivision } from "../../../../controllers/user.controller";
import { divisionExists } from "../../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get ID from the Query Data (This ID serves as the Division ID aswell as a specific User's ID)
	const id = req.query.id as string | undefined;

	//Setup the Variable to Check whether the ID is for an Division
	const isDivisionID = id ? await divisionExists(id) : false;

	//Setup the User Variable
	let requestedUser: User | Array<User> | null = null;

	//Check if no ID was provided and get a list of all Users
	if (!id) requestedUser = await getUsers();

	//Check if the ID provided is an Division's ID
	if (id && isDivisionID) requestedUser = await getUsersByDivision(id);

	//Check if the ID provided is a User's ID
	if (id && !isDivisionID) requestedUser = await getUserByID(id);

	//Check if the Requested User is Invalid
	if (!requestedUser) return res.status(404).send({ error: "User Could not be Found" });

	//Respond with a Success
	return res.status(200).send(requestedUser);
}
