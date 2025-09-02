export function makeResponse(body: object | string, code: number = 200) {
    return {
        statusCode: code,
        body: JSON.stringify(body),
    }
}

export function makeGenericError(e: unknown, code: number = 500) {
    return makeResponse( 
        `Unexpected Error caught in Lambda.
        \nType: ${(e as Error).name}
        \nMessage: ${(e as Error).message}
        \nStack Trace: ${(e as Error).stack}`,
        code
    )
}