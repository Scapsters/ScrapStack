import type { APIGatewayProxyEventV2 } from "aws-lambda"
import { getFromHeaders } from "./http"
import { Collection } from "mongodb"
import type { UserSchema } from "../schemas"
import { TRPCError } from "@trpc/server"

export async function getSessionUser({ event, User }: { event: APIGatewayProxyEventV2, User: Collection<UserSchema> }) {
    const uuid = getFromHeaders('user_uuid', { event })
    const user = await User.findOne({ uuid })
    if (!user)
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User not found for uuid: ${uuid}`
        })
    return user
}
