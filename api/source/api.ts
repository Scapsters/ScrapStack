import { MongoClient, Db, Collection, ObjectId, MongoClientOptions } from 'mongodb'
import * as dotenv from "dotenv";

interface TestCollection {
    _id?: ObjectId
    name: string
    value: number
}

class ConfigNotSetError extends Error {}

function getFromEnvironment(variableName: string): string {
    const variable = process.env[variableName]
    if (!variable) {
        throw new ConfigNotSetError(`${variableName} environment variable not set`)
    }
    return variable
}

function makeResponse(code: number, body: object | string) {
    return {
        statusCode: code,
        body: JSON.stringify(body),
    }
}

function makeGenericError(e: unknown) {
    return makeResponse(500, `Unexpected Error: ${(e as Error).message}`)
}

// --- Globals ---
let client: MongoClient | null = null

// --- Handler ---
export async function handle_request(event: any, context: any): Promise<any> {
    dotenv.config()

    const certPath = '/opt/global-bundle.pem'
    // TODO: in TS/Node, you'd load cert via fs if needed
    // e.g. const cert = fs.readFileSync(certPath);

    try {
        const documentdbEndpoint = getFromEnvironment('DOCUMENTDB_ENDPOINT')
        const documentdbUsername = getFromEnvironment('DOCUMENTDB_USERNAME')
        const documentdbPassword = getFromEnvironment('DOCUMENTDB_PASSWORD')

        const uri = `mongodb+srv://${documentdbUsername}:${documentdbPassword}@${documentdbEndpoint}/?retryWrites=true&w=majority&appName=Scrapstack`
        client = new MongoClient(uri, {
            tls: true,
            tlsCAFile: certPath, // or cert string
            retryWrites: false,
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        })
        
        await client.connect()

        const db: Db = client.db('test')
        const collection: Collection<TestCollection> = db.collection<TestCollection>('test')

        const inserted = await collection.insertOne({ name: 'meowwww', value: 4 })
        const result = await collection.findOne({ name: 'meowwww', value: 4 })

        if (!result)
            throw new Error('Document not found')

        return makeResponse(200, {
            message: 'Successfully connected to DocumentDB',
            server_info: await client.db().admin().serverInfo(),
            test_operation: {
                inserted_id: inserted.insertedId.toHexString(),
                result_id: result._id?.toHexString(),
                document: result,
            },
        })
    } catch (e) {
        if (e instanceof ConfigNotSetError)
            return makeResponse(400, e.message)
        return makeGenericError(e)
    } finally {
        if (client) {
            try {
                await client.close()
            } catch (e) {
                return makeGenericError(e)
            }
        }
    }
}
