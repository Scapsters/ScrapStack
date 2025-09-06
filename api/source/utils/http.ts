import { TRPCError } from "@trpc/server"
import { APIGatewayProxyEventV2 } from "aws-lambda"

export function getFromHeaders(header: string, { event }: { event: APIGatewayProxyEventV2 }) {
    const uuid = event.headers.user_uuid
    if (!uuid)
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User identifier missing.',
        })
    return uuid
}