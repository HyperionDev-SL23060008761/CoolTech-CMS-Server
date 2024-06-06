//External Imports
import { Request, Response, NextFunction } from "express";

//Internal Imports
import { User } from "../types";

//Setup the Endpoint Handler Type
export type EndpointHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
	user?: User
) => void;
