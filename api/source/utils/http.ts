import { TRPCError } from "@trpc/server"
import type { APIGatewayProxyEventV2 } from "aws-lambda"

export function getFromHeaders(headerName: string, { event }: { event: APIGatewayProxyEventV2 }) {
    const headerValue = event.headers[headerName]
    if (!headerValue)
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Header: "${headerName}" missing.`,
        })
    return headerValue
}