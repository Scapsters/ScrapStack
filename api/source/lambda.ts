import { awsLambdaRequestHandler, CreateAWSLambdaContextOptions } from "@trpc/server/adapters/aws-lambda"
import { getDBClient } from "./api/db.js"
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { StackSchema, TweetSchema, UserSchema } from "./api/schemas.js"
import { router } from './api/router.js';

export const createLambdaContext = async (opts: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => {
	const dbClient = await getDBClient()
	
	return {
		headers: opts.event.headers,
		dbClient,
		User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
		Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
		Stack: dbClient.db('Scrapstack').collection<StackSchema>('stack'),
		userToken: null,
		user: null,
		isAdmin: false,
	}
}

export const handle_request = awsLambdaRequestHandler({
	router,
	createContext: createLambdaContext,
})