//External Imports
import { NextFunction, Request, Response } from "express";

//Internal Imports
import { createUser, userExistsByUsername } from "../../../../controllers/user.controller";
import { EndpointMeta, Role, User } from "../../../../types/types";
import { generateToken } from "../../../../utils";
import { divisionExists } from "../../../../controllers/division.controller";

//Setup the Meta Data
export const meta: EndpointMeta = {
	authentication: [Role.all],
};

//Export the Endpoints Function
export default async function (req: Request, res: Response, next: NextFunction, user?: User) {
	//Get the Username from the Request Body
	const username = req.body.username as string | undefined;

	//Get the Password from the Request Body
	const password = req.body.password as string | undefined;

	//Get the Divisions from the Request Body
	const divisions = req.body.divisions as string | undefined;

	//Get the Variable to Check if an Admin is Trying to Register
	const isAdmin = req.body.isAdmin as boolean | undefined;

	//Get the Variable to Check if Management is Trying to Register
	const isManagement = req.body.isManagement as boolean | undefined;

	//Setup the Selected Role
	const selectedRole = isAdmin ? Role.admin : isManagement ? Role.management : Role.user;

	//Get the Registrar's Role
	const registrarRole = user?.role || Role.user;

	//Setup the Divisions List
	const divisionsList = divisions ? divisions.split(",") : new Array();

	//Loop Through the Provided Divisions to Check if they are valid
	for (const divisionID of divisionsList) {
		//Setup the Variable to Check if the Division Exists
		const divisionExistStatus = await divisionExists(divisionID);

		//Check if the Division Exists and continue
		if (divisionExistStatus) continue;

		//Return an Error (Division does not Exist)
		return res.status(400).send({ error: "One of the Provided Divisions do not Exist" });
	}

	//Check if the Username was not Provided
	if (!username) return res.status(417).json({ error: "username is required" });

	//Check if the Password was not Provided
	if (!password) return res.status(417).json({ error: "password is required" });

	//Check if an Admin is trying to Register and no Admin Token was provided
	if (selectedRole === Role.admin && registrarRole !== Role.admin)
		return res.status(401).send({ error: "Only an Admin can Register another Admin" });

	//Check if Management is trying to Register and no Admin Token was provided
	if (selectedRole === Role.management && registrarRole !== Role.admin)
		return res.status(401).send({ error: "Only an Admin can Register a Management User" });

	//Setup the Variable to Check if the User Exists
	const userExistStatus = await userExistsByUsername(username);

	//Check if the Request User could not be Found
	if (userExistStatus) return res.status(400).send({ error: "Username is not available" });

	//Register the New User
	const newUser = await createUser(username, password, selectedRole, divisionsList);

	//Check if the User could not be Registered
	if (!newUser) return res.status(500).send({ error: "Unable to Register User" });

	//Generate the JWT Token
	const token = generateToken(newUser);

	//Return Successful Login Status with a 200
	return res.status(200).send({ token: token });
}
