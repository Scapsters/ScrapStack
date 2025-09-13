import { handle_request, router } from "./api.js"
import http from "http"

import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { createContext } from './api.js';
import { getDBClient } from "./db.js"
import { StackSchema, TweetSchema, UserSchema } from "./schemas.js"
createHTTPServer({
  middleware: cors(),
  router: router,
  createContext: async function createContext() {
    const dbClient = await getDBClient()
	
	return {
		dbClient,
		User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
		Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
		Stack: dbClient.db('Scrapstack').collection<StackSchema>('stack'),
		userToken: null,
		user: null,
		isAdmin: false,
	}
  },
}).listen(3003);