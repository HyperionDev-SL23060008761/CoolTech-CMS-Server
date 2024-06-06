//Internal Imports
import mongoose, { ConnectOptions } from "mongoose";

//Connects to the Database
export async function connect() {
	//check if the Mongo Host is Invalid
	if (!process.env.MongoHost) throw new Error("Invalid Mongo Host environment variable");

	//Setup the Connection String
	let mongoUri = `${process.env.MongoProtocol}://${process.env.MongoHost}`;

	//Add a Port if it is not a srv and has a port
	if (process.env.MongoProtocol !== "mongodb+srv" && process.env.MongoPort)
		mongoUri += `:${process.env.MongoPort}`;

	//Setup the Connection Data
	const connectionOptions: ConnectOptions = {
		authSource: "admin",
		dbName: process.env.MongoDatabase,
		auth: {
			username: process.env.MongoUser,
			password: process.env.MongoPassword,
		},
	};

	//Connect to the Database
	mongoose
		.connect(mongoUri, connectionOptions)
		.then(() => console.log("Connected to MongoDB"))
		.catch(err => console.error("Error connecting to MongoDB", err));
}
