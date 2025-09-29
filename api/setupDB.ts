import { getDBClient } from "./source/utils/db.js"
import { Stack, Tweet, User } from "./source/api/schemas.js"

const db = await getDBClient()
const user = db.db("Scrapstack").collection<User>("user")
const tweet = db.db("Scrapstack").collection<Tweet>("tweet")
const stack = db.db("Scrapstack").collection<Stack>("stack")

tweet.createIndex( { stackId: 1 } )