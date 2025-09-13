import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { getFromEnvironment } from './utils/env.js'
import { AWSError } from './utils/errors.js'
import { MongoClient } from 'mongodb'

let dbCredentialsCache: { dbUsername: string; dbPassword: string } | null = null
let dbClientCache: MongoClient | null = null

export async function getSecretString(secretEnviornmentName: string) {
    const secretId = getFromEnvironment(secretEnviornmentName)
    const secretClient = new SecretsManagerClient({ region: 'us-east-1' })
    const secretValueCommand = new GetSecretValueCommand({ SecretId: secretId })
    const secretValueResponse = await secretClient.send(secretValueCommand)
    if (!secretValueResponse?.SecretString) throw new AWSError()
    return secretValueResponse.SecretString
}

async function getDBCredentials() {
    if (dbCredentialsCache) return dbCredentialsCache

    console.log('Fetching DB credentials...')
    const environment = getFromEnvironment("ENVIRONMENT")
    if (environment == "local") {
        dbCredentialsCache = {
            dbUsername: getFromEnvironment("DB_USERNAME"),
            dbPassword: getFromEnvironment("DB_PASSWORD"),
        }
    } else {
        const secretValue = JSON.parse(await getSecretString("DB_CREDENTIALS"))
        dbCredentialsCache = {
            dbUsername: secretValue.username as string,
            dbPassword: secretValue.password as string,
        }
    }
    console.log('Fetched DB credentials.')
    return dbCredentialsCache
}

export async function getDBClient(): Promise<MongoClient> {
    if (dbClientCache) return dbClientCache

    dbCredentialsCache ??= await getDBCredentials()
    console.log(dbCredentialsCache)

    console.log('Connecting to Mongo...')
    const mongoUri = `mongodb+srv://${dbCredentialsCache.dbUsername}:${dbCredentialsCache.dbPassword}@scrapstack.skqrl5l.mongodb.net/?retryWrites=true&w=majority&appName=Scrapstack`
    const client = new MongoClient(mongoUri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        maxIdleTimeMS: 10000,
    })
    await client.connect()
    console.log('Connected to Mongo. Storing client.')
    return client
}
