
import { useState } from 'react'
import { API_ROOT } from '../App'
import { tryCatch } from './tryCatch'

/**
 * Makes a request and returns the generic type given. Does not perform type checking whatsoever.
 * @param resourcePath API Endpoint starting with "/"
 * @param defaultValue Default value for data. Otherwise null
 * @returns [isLoading: boolean, data: T | null]
 */
export function useAsync<T>(resourcePath: string, defaultValue: T | null = null): [boolean, T | null] {
    const [data, setData] = useState<T | null>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)

    tryCatch<Response>(fetch(API_ROOT + resourcePath)).then((response) => {
        if (response.error) {
            console.error(response.error)
            return
        }
        if (!response.data.ok) {
            console.error('Response not OK on' + resourcePath + '. Setting loading to false')
            setIsLoading(false)
            return
        }
        response.data.json().then((json) => {
            console.log('Response OK on' + resourcePath + '. Data:')
            console.log(json)
            setData(json)
        })
    })

    return [isLoading, data]
}
