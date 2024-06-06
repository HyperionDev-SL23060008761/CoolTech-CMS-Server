//Internal Imports
import { Credentials, Organization, CredentialsModel, User, Role } from "../types/types";
import { decryptString, encryptString } from "../utils";

//Returns a List of all Credentials
export async function getAllCredentials(): Promise<Array<Credentials> | null> {
	//Get the List of Credentials
	const credentials = await CredentialsModel.find().catch(err => {
		console.error(err);
	});

	//Check if the Credentials is Invalid
	if (!credentials) return null;

	//Loop through the Credentials
	for (const currentCredentials of credentials) {
		//Decrypt the Credentials
		currentCredentials.username = decryptString(currentCredentials.username);
		currentCredentials.password = decryptString(currentCredentials.password);
	}

	//Return the Credentials
	return credentials;
}

//Returns a List of Credentials for a specific user
export async function getCredentialsForUser(user: User): Promise<Array<Credentials> | null> {
	//Check if the User is an Admin and return all Divisions
	if (user.role === Role.admin) return getAllCredentials();

	//Get the List of Credentials for the Specified User
	const credentials = await CredentialsModel.find({ division: { $in: user.divisions } }).catch(
		err => {
			console.log(err);
		}
	);

	//Check if the Credentials are Invalid
	if (!credentials) return null;

	//Return the Credentials
	return credentials;
}

//Returns specific credentials based on it's ID
export async function getCredentialsById(id: string): Promise<Credentials | null> {
	//Get the Requested Credentials
	const credentials = await CredentialsModel.findById(id).catch(err => {
		console.error(err);
	});

	//Check if the Credentials is Invalid
	if (!credentials) return null;

	//Decrypt the Credentials
	credentials.username = decryptString(credentials.username);
	credentials.password = decryptString(credentials.password);

	//Return the Credentials
	return credentials;
}

//Creates a new credentials
export async function createCredentials(
	division: string,
	name: string,
	username: string,
	password: string,
	notes?: string
): Promise<Credentials | null> {
	//Create the new Credentials Data
	const newCredentialData: Credentials = {
		division: division,
		name: name,
		username: encryptString(username),
		password: encryptString(password),
		notes: notes,
	};

	//Create the New Divison
	const newCredential = await CredentialsModel.create(newCredentialData).catch(err => {
		console.error(err);
	});

	//Check if the New Credentials is Invalid
	if (!newCredential) return null;

	//Decrypt the Credentials
	newCredential.username = decryptString(newCredential.username);
	newCredential.password = decryptString(newCredential.password);

	//Return the New Credentials
	return newCredential;
}

//Updates a credentials
export async function updateCredentials(
	id: string,
	division?: string,
	name?: string,
	username?: string,
	password?: string,
	notes?: string
): Promise<Credentials | null> {
	//Setup the Updated Credentials Data
	const updatedData: Partial<Credentials> = {
		division: division,
		name: name,
		username: username ? encryptString(username) : undefined,
		password: password ? encryptString(password) : undefined,
		notes: notes,
	};

	//Update the Credentials
	const updatedCredential = await CredentialsModel.findByIdAndUpdate(id, updatedData, {
		new: true,
	}).catch(err => {
		console.error(err);
	});

	//Check if the Updated Credentials is invalid
	if (!updatedCredential) return null;

	//Decrypt the Credentials
	updatedCredential.username = decryptString(updatedCredential.username);
	updatedCredential.password = decryptString(updatedCredential.password);

	//Return the Updated Credentials
	return updatedCredential;
}

//Deletes a credentials
export async function deleteCredentials(id: string): Promise<boolean> {
	//Delete the Credentials
	const deletionResult = await CredentialsModel.findByIdAndDelete(id).catch(err => {
		console.error(err);
	});

	//Check if the Credentials could not be Deleted
	if (!deletionResult) return false;

	//Return Successful Deletion
	return true;
}

//Get all credentials for a Division
export async function getCredentialsByDivision(
	divisionID: string
): Promise<Array<Credentials> | null> {
	//Get the Credentials List
	const credentials = await CredentialsModel.find({ division: divisionID }).catch(err => {
		console.error(err);
	});

	//Check if the Credentials List is Invalid
	if (!credentials) return null;

	//Loop through the Credentials
	for (const currentCredentials of credentials) {
		//Decrypt the Credentials
		currentCredentials.username = decryptString(currentCredentials.username);
		currentCredentials.password = decryptString(currentCredentials.password);
	}

	//Return the Credentials List
	return credentials;
}

//Returns a List of Credentials for a specific user filtered by Division
export async function getCredentialsByDivisionForUser(
	user: User,
	divisionID: string
): Promise<Array<Credentials> | null> {
	//Check if the User is an Admin and return all Credentials
	if (user.role === Role.admin) return getCredentialsByDivision(divisionID);

	//Get the List of Credentials for the Specified User Filtered by Organization
	const credentials = await CredentialsModel.find({
		$and: [{ division: { $in: user.divisions } }, { division: divisionID }],
	}).catch(err => {
		console.log(err);
	});

	//Check if the Credentials are Invalid
	if (!credentials) return null;

	//Return the Credentials
	return credentials;
}

//Checks if a Credentials Exists
export async function credentialsExists(id: string): Promise<boolean> {
	//Check if the Credentials Exists in the Dabase
	const result = await CredentialsModel.exists({ _id: id }).catch(err => {
		console.log(err);
		null;
	});

	//Return the Existence Status of the Credentials
	return !!result;
}

//Checks if a user has access to Credentials
export async function userHasAccessToCredentials(
	user: User,
	credentialsID: string
): Promise<boolean> {
	//Check if the user is an admin and return true
	if (user.role === Role.admin) return true;

	//Get the Credentials from the Database
	const credentials = await CredentialsModel.find({
		_id: credentialsID,
		division: { $in: user.divisions },
	});

	//Check if the Credentials is Invalid
	if (!credentials) return false;

	//Return true
	return true;
}
