import { getDBClient } from "./source/db.js"
import { StackDB, TweetDB, UserDB } from "./source/schemas.js"

const db = await getDBClient()
const user = db.db("Scrapstack").collection<UserDB>("user")
const tweet = db.db("Scrapstack").collection<TweetDB>("tweet")
const stack = db.db("Scrapstack").collection<StackDB>("stack")

tweet.createIndex( { stackId: 1 } )