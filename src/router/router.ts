//Internal Importws
import { NextFunction, Request, Response } from "express";
import { EndpointManager, RequestMethod, Role } from "../types/types";
import { decodeToken } from "../utils";

//Setup the Endpoint Manager
const endpointManager = new EndpointManager(`${__dirname}/routes`);

//Setup the Router
export async function router(req: Request, res: Response, next: NextFunction) {
	//Get the Request Method
	const requestMethod = req.method.toLowerCase() as RequestMethod;

	//Check if this is not a Supported Request Method and Return with a 405
	if (!(requestMethod in RequestMethod)) return res.sendStatus(405);

	//Get the Ruquest Path
	const requestPath = req.path;

	//Get the Requested Endpoint from the Endpoint Manager
	const requestedEndpoint = endpointManager.getEndpoint(requestMethod, requestPath);

	//Check if the Requested Endpoint does not exist and return a 404
	if (!requestedEndpoint) return res.sendStatus(404);

	//Get the Auth Token
	const authToken = req.headers.authorization?.split(" ")[1] || "NULL";

	//Decode the Auth Token and get the User
	const user = (await decodeToken(authToken)) || undefined;

	//Check if the Requested Endpoint does not Require Authentication and Run the Requested Endpoint's Handler
	if (requestedEndpoint.meta.authentication.includes(Role.all))
		return requestedEndpoint.handler(req, res, next, user);

	//Check if the Decoded Token is not Valid
	if (!user) return res.sendStatus(401);

	//Check if the Token does not have Access to the Endpoint
	if (!requestedEndpoint.meta.authentication.includes(user.role)) return res.sendStatus(403);

	//Run the Requested Endpoint's Handler
	return requestedEndpoint.handler(req, res, next, user);
}
