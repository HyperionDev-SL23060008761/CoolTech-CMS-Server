//External Imports
import { readdirSync, statSync } from "fs";
import { red, green, blue } from "picocolors";

//Internal Imports
import { Endpoint, EndpointList, EndpointHandler, RequestMethod, EndpointMeta } from "../types";

//Setup the Endpoint Manager Class
export class EndpointManager {
	//Setup the Private Properties
	private endpoints: EndpointList;

	//Setup the Constructor
	constructor(routesPath?: string) {
		//Initialize the Endpoint List
		this.endpoints = {
			get: new Array(),
			post: new Array(),
			put: new Array(),
			delete: new Array(),
		};

		//Check if the Routes Path was Provided and Import Endpoints using the Routes Path
		if (routesPath) this.importRoutes(routesPath);
	}

	//Adds a new Endpoint to the Endpoint Map
	public addEndpoint(
		method: RequestMethod,
		path: string,
		meta: EndpointMeta,
		handler: EndpointHandler
	): void {
		//Setup the Endpoint
		const endpoint: Endpoint = {
			method: method,
			path: path,
			meta: meta,
			handler: handler,
		};

		//Add the Endpoint to the Endpoint List
		this.endpoints[method].push(endpoint);

		//Log the Successful Adding of the Endpoint
		console.log(green(`Added ${blue(method.toUpperCase())} Endpoint: ${blue(path)}`));
	}

	//Retrieves an Endpoint using the Method and Path
	public getEndpoint(method: RequestMethod, path: string): Endpoint | undefined {
		//Find the Endpoint in the List of Endpoints
		const requestedEnpoint = this.endpoints[method].find(endpoint => endpoint.path === path);

		//Return the Requested Endpoint
		return requestedEnpoint;
	}

	//Import Endpoints from a Routes Folder
	private async importRoutes(routesPath: string) {
		//Get the Method Folders (GET, POST, PUT, DELETE, etc)
		const methodFolderList = readdirSync(routesPath);

		//Loop through the Method Folders
		for (const methodFolder of methodFolderList) {
			//Get the Full Path
			const fullPath = `${routesPath}/${methodFolder}`;

			//Check if the Method Folder is not a Directory and continue to the next method folder
			if (!statSync(fullPath).isDirectory()) continue;

			//Get the Request Method from the Folder Name
			const method = methodFolder.toLowerCase() as RequestMethod;

			//Check the the Method is not a Proper Method
			if (!(method in RequestMethod)) {
				console.log(red(`Invalid method folder: ${blue(methodFolder)}`));
				continue;
			}

			//Get the List of Endpoints in this Method's Folder
			await this.loadEndpointsFromFolder(routesPath, method, fullPath);
		}
	}

	//Gets the List of Endpoints in a Path (using recursion to get the full path to the endpoint)
	private async loadEndpointsFromFolder(routesPath: string, method: RequestMethod, path: string) {
		//Get the List of Files in the Current Path
		const fileList = readdirSync(path);

		//Loop through the Files
		for (const file of fileList) {
			//Get the Full Path to the File
			const fullPath = `${path}/${file}`;

			//Check if the File Path is a Directory
			if (statSync(fullPath).isDirectory()) {
				//Get the Endpoints in the Directory and add them to the Endpoint List
				this.loadEndpointsFromFolder(routesPath, method, fullPath);

				//Continue to the Next File
				continue;
			}

			//Create the Endpoint from it's full path
			const newEndpoint = await this.createEndpointFromFile(routesPath, method, fullPath);

			//Check if the New Endpoint is invalid and continue to the Next File
			if (!newEndpoint) {
				//Log the Failure to Load the Endpoint
				console.log(red(`Failed to load ${blue(method)} endpoint: ${blue(file)}`));

				//Continue to the Next File
				continue;
			}

			//Add the New Endpoint
			this.addEndpoint(newEndpoint.method, newEndpoint.path, newEndpoint.meta, newEndpoint.handler);
		}
	}

	private async createEndpointFromFile(
		routesPath: string,
		method: RequestMethod,
		fullPath: string
	): Promise<null | Endpoint> {
		//Check if the Endpoint File is not a valid file and end the Creation
		if (!fullPath.endsWith(".js") && !fullPath.endsWith(".ts")) return null;

		//Get the Endpoint's Raw Path
		const rawEndpointPath = fullPath.replace(routesPath, "");

		//Get the Path as an Array (Splitting at each / or \)
		const pathArray = rawEndpointPath.split(/\/|\\/g);

		//Remove the Method from the Path (First 2 Items in the Array, first item is empty, second is the method)
		pathArray.shift();
		pathArray.shift();

		//Setup the Final Path for the Endpoint
		const endpointPath = pathArray.join("/").replace(/\..*/g, "");

		//Get the Endpoint Handler
		const endpointHandler = await import(`file://${fullPath}`);

		//Check if the Endpoint Handler is not Valid and end the Creation
		if (!endpointHandler || !endpointHandler.default) return null;

		//Get the Endpoint Meta
		const meta: EndpointMeta = endpointHandler.default.meta || endpointHandler.meta;

		//Check if the Endpoint Meta is not Valid and end the Creation
		if (!meta) return null;

		//Setup the Final Handler Function
		const handlerFunction: EndpointHandler =
			endpointHandler.default.default || endpointHandler.default;

		//Setup the New Endpoint
		const newEndpoint: Endpoint = {
			method: method,
			path: `/${endpointPath}`,
			meta: meta,
			handler: handlerFunction,
		};

		//Return the Endpoint
		return newEndpoint;
	}
}
