import { type TweetSchema } from '../../api/source/api/schemas'

export const defaultSearchValues = {
	content: '',
	handle: '',
}

export function getFilterFromParams(params: URLSearchParams): Partial<TweetSchema> {
	const result: Partial<TweetSchema> = {}

	const content = params.get('content')
    if (content) result.content = content

    const handle = params.get('handle')
    if (handle) result.handle = handle

	return result
}

export function getSorterFromParams(params: URLSearchParams): [keyof TweetSchema, 1 | -1] | undefined {
	const sortByParam = params.get('sort_by')
	if (!sortByParam || sortByParam === 'Default') return
	const sortBy = sortByParam as keyof TweetSchema

	const sortDirectionParam = parseInt(params.get('sort_direction') ?? '')
	if (!sortDirectionParam) return
    const sortDirection = sortDirectionParam as 1 | -1

	return [sortBy, sortDirection]
}
