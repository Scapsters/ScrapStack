import { getFromEnvironment } from '../utils/env.js'
import { MongoClient } from 'mongodb'
import { getSecretString } from './secrets.js'

let dbCredentialsCache: { dbUsername: string; dbPassword: string } | null = null
let dbClientCache: MongoClient | null = null

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

    console.log('Connecting to Mongo...')

    const mongoUri = getFromEnvironment("ENVIRONMENT") == "local" 
        ? "mongodb://localhost:27017/"
        : `mongodb+srv://${dbCredentialsCache.dbUsername}:${dbCredentialsCache.dbPassword}@scrapstack.skqrl5l.mongodb.net/?retryWrites=true&w=majority&appName=Scrapstack`
    const client = new MongoClient(mongoUri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        maxIdleTimeMS: 10000,
        writeConcern: { w: "majority", j: true }
    })
    await client.connect()

    console.log('Connected to Mongo. Storing client.')

    dbClientCache = client
    return client
}
