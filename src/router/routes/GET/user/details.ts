//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { loginUser, userExistsByUsername } from "../../../../controllers/user.controller";
import { EndpointMeta, Role, TokenPayload, User } from "../../../../types/types";
import { generateToken } from "../../../../utils";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.all],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user: User) {
	//Check if the Payload was not Provided
	if (!user) return res.sendStatus(401);

	//Return Successful Status with a 200
	return res.status(200).send(user);
}
