import { Db, Collection } from 'mongodb'
import { AWSError, ConfigNotSetError } from './utils/errors'
import { dbClient } from './db'
import { makeGenericError, makeResponse } from './utils/http'
import { Meow } from './router'



// Handler
export async function handle_request(event: any, context: any): Promise<any> {
    try {
        const db: Db = dbClient.db('test')
        const collection: Collection<Meow> = db.collection<Meow>('test')

        const inserted = await collection.insertOne({ name: 'meowwww', value: 4 })
        const result = await collection.findOne({ name: 'meowwww', value: 4 })

        if (!result)
            throw new Error('Document not found')

        return makeResponse({
            message: 'Successfully connected to DocumentDB',
            server_info: await dbClient.db().admin().serverInfo(),
            test_operation: {
                inserted_id: inserted.insertedId.toHexString(),
                result_id: result._id?.toHexString(),
                document: result,
            },
        })
    } catch (e) {
        if (e instanceof ConfigNotSetError)
            return makeResponse(e.message, 400)
        if (e instanceof AWSError)
            return makeResponse(`AWS Error encountered: ${e.message}`)
        return makeGenericError(e)
    }
}
