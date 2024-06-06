//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { EndpointMeta, Role, User } from "../../../types/types";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.all],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Return Successful Validation
	return res.sendStatus(200);
}
