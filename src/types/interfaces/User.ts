//Internal Imports
import { Role } from "../types";

//Setup the User Interface
export interface User {
	_id?: string;
	username: string;
	password: string;
	role: Role;
	divisions: Array<string>;
}
