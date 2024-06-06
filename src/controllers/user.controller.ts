//External Improrts
import { hash, compare, genSalt } from "bcrypt";

//Internal Imports
import { UserModel, User, Role, Division } from "../types/types";

//Generates an Encrypted Password using a Provided Private Key
async function generateEncryptedPassword(password: string): Promise<string> {
	//Setup the Salt
	const salt = await genSalt(10);

	//Encrypt the Password
	const encryptedPassword = await hash(password, salt);

	//Return the Encrypted Password
	return encryptedPassword;
}

//Validates the Provided Password against the Encrypted Password
async function validatePassword(password: string, encryptedPassword: string): Promise<boolean> {
	//Compare the Passwords
	const result = await compare(password, encryptedPassword);

	//Return the Result
	return result;
}

//Logs a User in and Returns a User (Username and Password is Required for Authentication)
export async function loginUser(username: string, password: string): Promise<User | null> {
	//Get the User from the Database
	const user = await UserModel.findOne({ username: username }).catch(err => {
		console.log(err);
		null;
	});

	//Check if the User is not Found
	if (!user) return null;

	//Validate the Password
	const validPassword = await validatePassword(password, user.password);

	//Check if the Password is not Valid
	if (!validPassword) return null;

	//Return the User's Data
	return user;
}

//Returns the List of Users
export async function getUsers(): Promise<Array<User> | null> {
	//Get the Users from the Database
	const users = await UserModel.find().catch(err => {
		console.log(err);
		null;
	});

	//Check if the Users are not Found
	if (!users) return null;

	//Return the Users
	return users;
}

//Returns a User by their ID
export async function getUserByID(userID: string): Promise<User | null> {
	//Get the User from the Database
	const user = await UserModel.findById(userID).catch(err => {
		console.log(err);
		null;
	});

	//Check if the User is not Found
	if (!user) return null;

	//Return the User
	return user;
}

//Returns a list of users under a division
export async function getUsersByDivision(divisionID: string): Promise<Array<User> | null> {
	//Get the Users from the Database
	const users = await UserModel.find({ division: divisionID }).catch(err => {
		console.log(err);
		null;
	});

	//Check if the Users are not Found
	if (!users) return null;

	//Return the Users
	return users;
}

//Creates a New User
export async function createUser(
	username: string,
	password: string,
	role: Role,
	divisions: Array<string>
): Promise<User | null> {
	//Generate the Encrypted Password
	const encryptedPassword = await generateEncryptedPassword(password);

	//Setup the User's Data
	const userData: User = {
		username: username,
		password: encryptedPassword,
		role: role,
		divisions: divisions,
	};

	//Create the User
	const newUser = await UserModel.create(userData).catch(err => {
		console.log(err);
		return null;
	});

	//Return the Newly Created User
	return newUser;
}

//Updates a credentials
export async function updateUser(id: string, username?: string, role?: Role): Promise<User | null> {
	//Setup the Updated User Data
	const updatedData: Partial<User> = {
		username: username,
		role: role,
	};

	//Update the User
	const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, {
		new: true,
	}).catch(err => {
		console.error(err);
	});

	//Check if the Updated User is invalid
	if (!updatedUser) return null;

	//Return the Updated User
	return updatedUser;
}

//Adds a Division to a User
export async function addRemoveUserDivision(
	userID: string,
	divisionID: string,
	remove: boolean
): Promise<User | null> {
	//Get the User
	const user = await UserModel.findById(userID).catch(err => {
		console.log(err);
		return null;
	});

	//Check if the User is invalid
	if (!user) return null;

	//Remove the Division
	if (remove) user.divisions = user.divisions.filter(id => id !== divisionID);

	//Add the Division
	if (!remove) user.divisions.push(divisionID);

	//Save the User
	await user.save().catch(err => {
		console.log(err);
		return null;
	});

	//Return the User
	return user;
}

//Deletes a User
export async function deleteUser(id: string): Promise<boolean> {
	//Delete the User
	const deletionResult = await UserModel.findByIdAndDelete(id).catch(err => {
		console.error(err);
	});

	//Check if the User could not be Deleted
	if (!deletionResult) return false;

	//Return Successful Deletion
	return true;
}

//Checks if a User Exists by their Username
export async function userExistsByUsername(username: string): Promise<boolean> {
	//Check if the User Exists in the Dabase
	const userExists = await UserModel.exists({ username: username }).catch(err => {
		console.log(err);
		null;
	});

	//Return the Existence Status of the User
	return !!userExists;
}

//Checks if a User Exists by their ID
export async function userExists(id: string): Promise<boolean> {
	//Check if the User Exists in the Dabase
	const userExists = await UserModel.exists({ _id: id }).catch(err => {
		console.log(err);
		null;
	});

	//Return the Existence Status of the User
	return !!userExists;
}
