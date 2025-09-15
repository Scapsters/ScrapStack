import { TRPCError } from "@trpc/server"
import { type IncomingHttpHeaders } from "http"

export function getFromHeaders(headerName: string, { headers }: { headers: IncomingHttpHeaders }) {
    const value = headers[headerName]
    if (!value) {
        console.log(`${headerName} header not found`)
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Header: "${headerName}" missing.`,
        })
    }
    return typeof value == "object" ? value.join(" ") : value
}