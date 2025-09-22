import { Collection } from "mongodb"
import { getFromHeaders } from "./http.js"
import { UserSchema } from "../api/schemas.js"
import { IncomingHttpHeaders } from "http"
import { TRPCError } from "@trpc/server"
import { getSecretString } from "./secrets.js"
import { createHash } from "crypto"

export async function getUser(ctx: { User: Collection<UserSchema>, headers: IncomingHttpHeaders }) {
	const userToken = getFromHeaders('usertoken', ctx)
	let user = await ctx.User.findOne({ userToken: userToken })
	// If user doesn't exist, create it and check again
	if (!user) {
		console.log("Creating user...")
		const addedUser = (await ctx.User.insertOne({ userToken, viewedPosts: [], sentPosts: [] })).acknowledged
		if (!addedUser) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JIT user creation not acknowledged' })
		user = await ctx.User.findOne({ userToken })
		if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JIT user creation acknowledged but not found' })
	}
    return user
}

export async function checkIsAdmin(ctx: { headers: IncomingHttpHeaders }) {
    const adminPassword = getFromHeaders('authorization', ctx).split(' ')[1]
	console.log(adminPassword)
    const adminSecret = await getSecretString('ADMIN_SECRET')
    return !!adminPassword && createHash('sha256').update(adminPassword).digest('hex') == adminSecret
}