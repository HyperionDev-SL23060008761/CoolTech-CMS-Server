//Internal Imports
import { EndpointHandler, EndpointMeta, RequestMethod } from "../types";

//Setup the Endpoint Interface
export interface Endpoint {
	method: RequestMethod;
	path: string;
	meta: EndpointMeta;
	handler: EndpointHandler;
}
