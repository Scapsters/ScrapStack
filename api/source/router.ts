import { initTRPC } from "@trpc/server";
import { dbClient } from "./db"
import { z } from 'zod'
import { ObjectId } from "mongodb"

const t = initTRPC.create()
const publicProcedure = t.procedure

const DBObject = z.object({
    _id: z.undefined().transform(() => new ObjectId())
})

const Meow = DBObject.extend({
    name: z.string(),
    value: z.number(),
})

const appRouter = t.router({
    meowList: publicProcedure
        .query(async () => {
            const meows = await dbClient.db("test").collection("meow").find({ name: "meowwww" }).toArray()
            return meows
        }),
    createMeow: publicProcedure
        .input(Meow)
        .mutation(async (opts) => {
            const { input } = opts
            const result = await dbClient.db("test").collection("meow").insertOne(input)
            return result.acknowledged
        })
})

appRouter.

type MeowIn = z.input<typeof Meow>
type MeowOut = z.output<typeof Meow>

export type AppRouter = typeof appRouter
