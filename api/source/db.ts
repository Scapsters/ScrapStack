import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager"
import { getFromEnvironment } from "./utils/env"
import { AWSError } from "./utils/errors"
import { MongoClient } from "mongodb"

export const dbCredentials: { dbUsername: string, dbPassword: string} = await getSecretValues()
export const dbClient = await getDBClient()

export async function getSecretValues() {
    if (dbCredentials) 
        return dbCredentials

    console.log("Fetching DB credentials...")
    const secretId = getFromEnvironment('SECRET_ID')
    const secretClient = new SecretsManagerClient({ region: 'us-east-1' })
    const secretValueCommand = new GetSecretValueCommand({ SecretId: secretId })
    const secretValueResponse = await secretClient.send(secretValueCommand)
    if (!secretValueResponse.SecretString) 
        throw new AWSError()
    const secretValue = JSON.parse(secretValueResponse.SecretString)
    console.log("Fetched DB credentials.")
    return {
        dbUsername: secretValue.username as string,
        dbPassword: secretValue.password as string,
    }
}

export async function getDBClient(): Promise<MongoClient> {
    if (dbClient)
        return dbClient

    console.log("Connecting to Mongo...")
    const mongoUri = `mongodb+srv://${dbCredentials.dbUsername}:${dbCredentials.dbPassword}@scrapstack.skqrl5l.mongodb.net/?retryWrites=true&w=majority&appName=Scrapstack`
    const client = new MongoClient(mongoUri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        maxIdleTimeMS: 10000
    })
    await client.connect()
    console.log("Connected to Mongo. Storing client.")
    return client
}