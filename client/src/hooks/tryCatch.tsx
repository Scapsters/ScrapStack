// Taken from https://gist.github.com/t3dotgg/a486c4ae66d32bf17c09c73609dacc5b

// Types for the result object with discriminated union
type Success<T> = {
    data: T
    error: null
}

type Failure<E> = {
    data: null
    error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Conveniently try a promise and capture any errors. Also provides type deduction for less verbose type checking
 * @param promise Any promise that might error
 * @returns A promise for either a success or failure. Upon checking for result.data, Typescript will deduct which of the types it was, and the type will persist past the check.
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
        const data = await promise
        return { data, error: null }
    } catch (error) {
        return { data: null, error: error as E }
    }
}
