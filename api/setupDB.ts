import { getDBClient } from "./source/db"

const db = await getDBClient()
db.db("Scrapstack").collection("user")
db.db("Scrapstack").collection("tweet")
db.db("Scrapstack").collection("stack")