//Internal Imports
import { DivisionModel, Organization, OrganizationModel, Role, User } from "../types/types";

//Returns a List of all Organizations
export async function getAllOrganizations(): Promise<Array<Organization> | null> {
	//Get all organizations
	const organizations = await OrganizationModel.find().catch(err => {
		console.log(err);
	});

	//Check if the Organizations are Invalid
	if (!organizations) return null;

	//Return the Organizations
	return organizations;
}

//Returns a List of Organizations for a specific user
export async function getOrganizationsForUser(user: User): Promise<Array<Organization> | null> {
	//Check if the User is an Admin and return all Organizations
	if (user.role === Role.admin) return getAllOrganizations();

	//Get the List of Organization ID's that fall under the logged in user
	const organizationIDs = await DivisionModel.distinct("organization", {
		_id: { $in: user.divisions },
	});

	//Check if the Organization IDs are Invalid
	if (!organizationIDs) return null;

	//Get the List of Organizations for the List of Organization ID's
	const organizations = await OrganizationModel.find({ _id: { $in: organizationIDs } }).catch(
		err => {
			console.log(err);
		}
	);

	//Check if the Organizations are Invalid
	if (!organizations) return null;

	//Return the Organizations
	return organizations;
}

//Returns a specific organization based on it's ID
export async function getOrganizationById(id: string): Promise<Organization | null> {
	//Get the organization
	const organization = await OrganizationModel.findById(id).catch(err => {
		console.log(err);
	});

	//Check if the Organization is Invalid
	if (!organization) return null;

	//Return the Organization
	return organization;
}

//Creates an Organization
export async function createOrganization(name: string): Promise<Organization | null> {
	//Setup the New Organization Data
	const newOrganizationData: Organization = {
		name: name,
	};

	//Create the New Organization
	const newOrganization = await OrganizationModel.create(newOrganizationData).catch(err => {
		console.log(err);
	});

	//Check if the New Organization is Invalid
	if (!newOrganization) return null;

	//Return the New Organization
	return newOrganization;
}

//Updates an organization by its ID
export async function updateOrganization(id: string, name: string): Promise<Organization | null> {
	//Setup the Updated Organization Data
	const updatedData: Partial<Organization> = { name };

	//Update the Organization
	const updatedOrganization = await OrganizationModel.findByIdAndUpdate(id, updatedData, {
		new: true,
	}).catch(err => {
		console.log(err);
	});

	//Check if the Updated Organization is Invalid
	if (!updatedOrganization) return null;

	//Return the Updated Organization
	return updatedOrganization;
}

//Deletes an organization by its ID
export async function deleteOrganization(id: string): Promise<boolean> {
	//Delete the Organization
	const deletionResult = await OrganizationModel.findByIdAndDelete(id).catch(err => {
		console.log(err);
	});

	//Check if the Organization could not be deleted
	if (!deletionResult) return false;

	//Return the deletion result
	return true;
}

//Checks if an Organization Exists
export async function organizationExists(id: string): Promise<boolean> {
	//Check if the Organization Exists in the Dabase
	const result = await OrganizationModel.exists({ _id: id }).catch(err => {
		console.log(err);
		null;
	});

	//Return the Existence Status of the Organization
	return !!result;
}

//Checks if a user has access to an organization
export async function userHasAccessToOrganization(
	user: User,
	organizationID: string
): Promise<boolean> {
	//Check if the user is an admin and return true
	if (user.role === Role.admin) return true;

	//Get the List of Organization ID's for the Specified User
	const organizationIDs = await DivisionModel.distinct("organization", {
		_id: { $in: user.divisions },
		organization: organizationID,
	});

	//Check if the Organizations is Invalid
	if (!organizationIDs) return false;

	//Return true
	return true;
}
