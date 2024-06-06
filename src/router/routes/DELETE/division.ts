//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";
import {
	divisionExists,
	deleteDivision,
	userHasAccessToDivision,
} from "../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.admin],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Get the Division's ID from the Query Parameters
	const id = req.query.id as string | undefined;

	//Check if the Division's ID is invalid
	if (!id) return res.status(417).send({ error: "id is required" });

	//Setup the Variable to Check if the Division Exists
	const divisionExistStatus = await divisionExists(id);

	//Check if the Division Could not Be Found
	if (!divisionExistStatus) return res.status(404).send({ error: "Division does not exist" });

	//Check if the User does not have access to the Division
	if (!(await userHasAccessToDivision(user, id)))
		return res.status(403).send({ error: "You do not have access to this division" });

	//Delete the Division
	const result = await deleteDivision(id);

	//Check if the Division Could not Be Delete
	if (!result) return res.status(500).send({ error: "There was a Problem Deleting the Division" });

	//Respond with a Success
	return res.sendStatus(200);
}
