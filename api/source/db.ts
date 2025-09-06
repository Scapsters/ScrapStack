import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { getFromEnvironment } from './utils/env'
import { AWSError } from './utils/errors'
import { MongoClient } from 'mongodb'

let dbCredentialsCache: { dbUsername: string; dbPassword: string } | null = null
let dbClientCache: MongoClient | null = null

async function getSecretValues() {
    if (dbCredentialsCache) return dbCredentialsCache

    console.log('Fetching DB credentials...')
    const secretId = getFromEnvironment('SECRET_ID')
    const secretClient = new SecretsManagerClient({ region: 'us-east-1' })
    const secretValueCommand = new GetSecretValueCommand({ SecretId: secretId })
    const secretValueResponse = await secretClient.send(secretValueCommand)
    if (!secretValueResponse.SecretString) throw new AWSError()
    const secretValue = JSON.parse(secretValueResponse.SecretString)
    console.log('Fetched DB credentials.')
    return {
        dbUsername: secretValue.username as string,
        dbPassword: secretValue.password as string,
    }
}

export async function getDBClient(): Promise<MongoClient> {
    if (dbClientCache) return dbClientCache

    if (!dbCredentialsCache) dbCredentialsCache = await getSecretValues()

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
