//Internal Imports
import { Endpoint } from "../types";

//Setup the Endpoint List Interface
export interface EndpointList {
	get: Array<Endpoint>;
	post: Array<Endpoint>;
	put: Array<Endpoint>;
	delete: Array<Endpoint>;
}
