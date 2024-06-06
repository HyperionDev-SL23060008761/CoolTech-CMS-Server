//Internal Imports
import { Division, Organization, DivisionModel, User, Role } from "../types/types";

//Returns a List of all Divisions
export async function getAllDivisions(): Promise<Division[] | null> {
	//Get the List of Divisions
	const divisions = await DivisionModel.find().catch(err => {
		console.error(err);
	});

	//Check if the Divisions is Invalid
	if (!divisions) return null;

	//Return the Divisions
	return divisions;
}

//Returns a List of Divisions for a specific user
export async function getDivisionsForUser(user: User): Promise<Array<Division> | null> {
	//Check if the User is an Admin and return all Divisions
	if (user.role === Role.admin) return getAllDivisions();

	//Get the List of Divisions for the Specified User
	const divisions = await DivisionModel.find({ _id: { $in: user.divisions } }).catch(err => {
		console.log(err);
	});

	//Check if the Divisions are Invalid
	if (!divisions) return null;

	//Return the Divisions
	return divisions;
}

//Returns a specific division based on it's ID
export async function getDivisionById(id: string): Promise<Division | null> {
	//Get the Requested Division
	const division = await DivisionModel.findById(id).catch(err => {
		console.error(err);
	});

	//Check if the Division is Invalid
	if (!division) return null;

	//Return the Division
	return division;
}

//Creates a new division
export async function createDivision(
	name: string,
	organizationID: string
): Promise<Division | null> {
	//Create the new Division Data
	const newDivisionData: Division = {
		name: name,
		organization: organizationID,
	};

	//Create the New Divison
	const newDivision = await DivisionModel.create(newDivisionData).catch(err => {
		console.error(err);
	});

	//Check if the New Division is Invalid
	if (!newDivision) return null;

	//Return the New Division
	return newDivision;
}

//Updates a division
export async function updateDivision(
	id: string,
	name?: string,
	organizationID?: string
): Promise<Division | null> {
	//Setup the Updated Division Data
	const updatedData: Partial<Division> = {
		name: name,
		organization: organizationID,
	};

	//Update the Division
	const updatedDivision = await DivisionModel.findByIdAndUpdate(id, updatedData, {
		new: true,
	}).catch(err => {
		console.error(err);
	});

	//Check if the Updated Division is invalid
	if (!updatedDivision) return null;

	//Return the Updated Division
	return updatedDivision;
}

//Deletes a division
export async function deleteDivision(id: string): Promise<boolean> {
	//Delete the Division
	const deletionResult = await DivisionModel.findByIdAndDelete(id).catch(err => {
		console.error(err);
	});

	//Check if the Division could not be Deleted
	if (!deletionResult) return false;

	//Return Successful Deletion
	return true;
}

//Get all divisions for an organization
export async function getDivisionsByOrganization(
	organizationID: string
): Promise<Array<Division> | null> {
	//Get the Divisions List
	const divisions = await DivisionModel.find({ organization: organizationID }).catch(err => {
		console.error(err);
	});

	//Check if the Divisions List is Invalid
	if (!divisions) return null;

	//Return the Divisions List
	return divisions;
}

//Returns a List of Divisions for a specific user filtered by Organization
export async function getDivisionsByOrganizationForUser(
	user: User,
	organizationID: string
): Promise<Array<Division> | null> {
	//Check if the User is an Admin and return all Divisions
	if (user.role === Role.admin) return getDivisionsByOrganization(organizationID);

	//Get the List of Divisions for the Specified User Filtered by Organization
	const divisions = await DivisionModel.find({
		_id: { $in: user.divisions },
		organization: organizationID,
	}).catch(err => {
		console.log(err);
	});

	//Check if the Divisions are Invalid
	if (!divisions) return null;

	//Return the Divisions
	return divisions;
}

//Checks if a Division Exists
export async function divisionExists(id: string): Promise<boolean> {
	//Check if the Division Exists in the Dabase
	const result = await DivisionModel.exists({ _id: id }).catch(err => {
		console.log(err);
		null;
	});

	//Return the Existence Status of the Division
	return !!result;
}

//Checks if a user has access to a division
export async function userHasAccessToDivision(user: User, divisionID: string): Promise<boolean> {
	//Check if the user is an admin and return true
	if (user.role === Role.admin) return true;

	//Check if the User does not have access to the Division
	if (!user.divisions.includes(divisionID)) return false;

	//Return true
	return true;
}
