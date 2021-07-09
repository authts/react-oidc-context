import { OAuthError } from "./errors"

export const hasAuthParams = (locationSearch = window.location.search): boolean => {
    const searchParams = new URLSearchParams(locationSearch)
    return Boolean(
        (searchParams.get("code") || searchParams.get("error")) &&
        searchParams.get("state")
    )
}

const normalizeErrorFn = (fallbackMessage: string) => (
    error: Error | { error: string, error_description?: string }
): Error => {

    // map class ErrorResponse from "oidc-client", as it is not accessible from tytepscript
    if ("error" in error) {
        return new OAuthError(error.error, error.error_description)
    }

    if (error instanceof Error) {
        return error
    }

    return new Error(fallbackMessage)
}

export const loginError = normalizeErrorFn("Login failed")
