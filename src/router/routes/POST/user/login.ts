//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { loginUser, userExistsByUsername } from "../../../../controllers/user.controller";
import { EndpointMeta, Role, TokenPayload } from "../../../../types/types";
import { generateToken } from "../../../../utils";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.all],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction) {
	//Get the Username from the Request Body
	const username = req.body.username as string | undefined;

	//Get the Password from the Request Body
	const password = req.body.password as string | undefined;

	//Check if the Username was not Provided
	if (!username) return res.status(417).json({ error: "username is required" });

	//Check if the Password was not Provided
	if (!password) return res.status(417).json({ error: "password is required" });

	//Setup the Variable to Check if the User Exists
	const userExistStatus = await userExistsByUsername(username);

	//Check if the Request User could not be Found
	if (!userExistStatus) return res.status(400).send({ error: "Invalid Username/Password" });

	//Get the Requested User
	const user = await loginUser(username, password);

	//Check if the User could not be Logged in
	if (!user) return res.status(400).send({ error: "Invalid Username/Password" });

	//Generate the JWT Token
	const token = generateToken(user);

	//Return Successful Login Status with a 200
	return res.status(200).send({ token: token });
}
