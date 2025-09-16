import { router } from "./api/router.js"
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import cors from 'cors'
import { getDBClient } from "./api/db.js"
import type { StackSchema, TweetSchema, UserSchema } from "./api/schemas.js"
import { type CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'

export async function createLocalContext(opts: CreateHTTPContextOptions) {
	console.log(opts.req.url)
	const dbClient = await getDBClient()
	
	return {
		headers: opts.req.headers,
		dbClient,
		User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
		Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
		Stack: dbClient.db('Scrapstack').collection<StackSchema>('stack'),
		userToken: null,
		user: null,
		isAdmin: false,
	}
}

createHTTPServer({
	middleware: cors(),
	router: router,
	createContext: createLocalContext
}).listen(3003)