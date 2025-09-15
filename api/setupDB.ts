import { getDBClient } from "./source/api/db.js"
import { StackDB, TweetDB, UserDB } from "./source/api/schemas.js"

const db = await getDBClient()
const user = db.db("Scrapstack").collection<UserDB>("user")
const tweet = db.db("Scrapstack").collection<TweetDB>("tweet")
const stack = db.db("Scrapstack").collection<StackDB>("stack")

tweet.createIndex( { stackId: 1 } )