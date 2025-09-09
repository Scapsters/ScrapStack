import { TRPCError } from "@trpc/server"
import type { APIGatewayProxyEventV2 } from "aws-lambda"

export function getFromHeaders(header: string, { event }: { event: APIGatewayProxyEventV2 }) {
    const uuid = event.headers[header]
    if (!uuid)
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User identifier missing.',
        })
    return uuid
}