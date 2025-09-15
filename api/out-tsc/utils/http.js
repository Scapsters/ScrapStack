import { TRPCError } from "@trpc/server";
export function getFromHeaders(headerName, _a) {
    var headers = _a.headers;
    var value = headers[headerName];
    if (!value) {
        console.log("".concat(headerName, " header not found"));
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "Header: \"".concat(headerName, "\" missing."),
        });
    }
    return typeof value == "object" ? value.join(" ") : value;
}
