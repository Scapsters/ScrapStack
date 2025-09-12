import express from 'express'
import serverless from 'serverless-http'
import { os } from '@orpc/server'
import { type APIGatewayProxyEventV2 } from 'aws-lambda'
import { Collection, type Filter, ObjectId } from 'mongodb'
import { createHash } from 'node:crypto'
import z from 'zod'
import { getDBClient, getSecretString } from './db.js'
import { type StackSchema, type TweetSchema, type UserSchema, zStackSchema, zTweetSchema } from './schemas.js'
import { getFromHeaders } from './utils/http.js'
import { ORPCError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/aws-lambda'

const base = os.$context<{ headers: Headers, env: { DB_URL: string } }>()

const requireAuth = base.middleware(async ({ context, next }) => {

  if (user) {
    return next({ context: { user: "string " } })
  }

  throw new ORPCError('UNAUTHORIZED')
})

const dbProvider = base.middleware(async ({ context, next }) => {

  try {
    await client.connect()
    return next({ context: { db: "string" } })
  }
  finally {
    await client.disconnect()
  }
})

const getting = base
  .use(dbProvider)
  .use(requireAuth)
  .handler(async ({ context }) => {
    console.log(context.db)
    console.log(context.user)
  })

