export function getUserToken() {
    const isBrowser = typeof window !== "undefined"
    if (!isBrowser) return ""

    const currentUserToken = localStorage.getItem("userToken")
    if (currentUserToken) return currentUserToken

    const newUserToken = crypto.randomUUID()
    localStorage.setItem("userToken", newUserToken)
    return newUserToken
}