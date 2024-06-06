//Internal Imports
import { sign, verify } from "jsonwebtoken";
import { User, TokenPayload } from "./types/types";
import {
	KeyObject,
	createCipheriv,
	createDecipheriv,
	createPrivateKey,
	privateDecrypt,
	privateEncrypt,
	publicEncrypt,
	randomBytes,
} from "crypto";
import { getUserByID } from "./controllers/user.controller";

//Generates a JWT Token
export function generateToken(user: User): string {
	//Check if the User ID is Invalid
	if (!user._id) throw new Error("User ID is invalid");

	//Setup the Payload
	const payload: TokenPayload = {
		userID: user._id,
	};

	//Get the JWT Secret
	const JWTSecret = process.env.PrivateKey;

	//Check if an Invalid JWT Secret was provided
	if (!JWTSecret) throw new Error("Invalid Private Key environment variable");

	//Generate the Token
	const token = sign(payload, JWTSecret, { algorithm: "RS256" });

	//return the token
	return token;
}

//Decode the JWT Token
export async function decodeToken(token: string): Promise<User | null> {
	//Get the JWT Secret
	const JWTSecret = process.env.PrivateKey;

	//Check if an Invalid JWT Secret was provided
	if (!JWTSecret) throw new Error("Invalid Private Key environment variable");

	//Attempt to Decode the Token
	try {
		//Decode the Token
		const decoded = verify(token, JWTSecret) as TokenPayload;

		//Get the User from the Database
		const user = await getUserByID(decoded.userID);

		//Check if the User is not Found
		if (!user) return null;

		//Return the User
		return user;
	} catch (error) {
		//Return null
		return null;
	}
}

//Encrypts a String
export function encryptString(text: string): string {
	//Get the Private Key
	const PrivateKey = getPrivateKey();

	//Get the Public Key
	const publicKey = generatePublicKey(PrivateKey);

	//Generate a random AES key
	const aesKey = randomBytes(32); // 256-bit key for AES-256

	//Setup the IV
	const iv = randomBytes(16);

	//Setup the Cipher
	const cipher = createCipheriv("aes-256-gcm", aesKey, iv);

	//Encrypt the Data
	const encryptedData = cipher.update(text, "utf8", "base64") + cipher.final("base64");

	//Get the Auth Tag
	const authTag = cipher.getAuthTag().toString("base64");

	// Encrypt the AES key
	const encryptedAESKey = publicEncrypt(publicKey, aesKey).toString("base64");

	//Setup the Encrypted String
	const encryptedString = `${encryptedAESKey}.${iv.toString("base64")}.${authTag}.${encryptedData}`;

	//Setup the Encrypted Hex String
	const encryptedHexString = Buffer.from(encryptedString).toString("hex");

	//Return the Encrypted Hex String
	return encryptedHexString;
}

//Decrypts a String
export function decryptString(text: string): string {
	//Setup the Private Key
	const privateKey = getPrivateKey();

	//Get the Encrypted String
	const encryptedString = Buffer.from(text, "hex");

	//Get the Headers from the Encrypted String
	const [base64AESKey, base64IV, base64AuthTag, encryptedData] = encryptedString
		.toString()
		.split(".");

	//Get the AES Key
	const aesKey = privateDecrypt(privateKey, Buffer.from(base64AESKey, "base64"));

	//Get the IV
	const iv = Buffer.from(base64IV, "base64");

	//Get the Auth Tag
	const authTag = Buffer.from(base64AuthTag, "base64");

	//Decipher the Data
	const decipher = createDecipheriv("aes-256-gcm", aesKey, iv);

	//Set the Auth Tag
	decipher.setAuthTag(authTag);

	//Decrypt the Data
	const decryptedString = decipher.update(encryptedData, "base64", "utf8") + decipher.final("utf8");

	//Return the Decrypted String
	return decryptedString;
}

//Generates a Public Key using a Private Key
function generatePublicKey(privateKey: KeyObject): string {
	//Generate the Public Key
	const publicKey = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

	//Return the Public Key
	return publicKey;
}

//Returns the Private Key
export function getPrivateKey(): KeyObject {
	//Get the Raw Private Key
	const rawPrivateKey = process.env.PrivateKey;

	//Check if an Invalid Private Key was provided
	if (!rawPrivateKey) throw new Error("Invalid Private Key environment variable");

	//Setup the Private Key
	const privateKey = createPrivateKey({
		key: rawPrivateKey,
		format: "pem",
	});

	//Return the Private Key
	return privateKey;
}
