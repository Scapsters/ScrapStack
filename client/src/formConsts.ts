import { type TweetSchema } from "../../api/source/api/schemas"

export const defaultSearchValues = {
    content: "",
    handle: "",
}

export function getFilterFromParams(params: URLSearchParams) {
    const keys = Object.keys(defaultSearchValues)
    return Object.fromEntries(
        keys.map(key => [key, params.get(key)])
    )
}

export function getSorterFromParams(params: URLSearchParams) {
    const sortByParam = params.get("sort_by")
    if (!sortByParam || sortByParam === "Default")
        return

    const sortBy = sortByParam as keyof TweetSchema

    const sortDirectionParam = parseInt(params.get("sort_direction") ?? "")
    if (!sortDirectionParam)
        return

    return { [sortBy]: sortDirectionParam }
}