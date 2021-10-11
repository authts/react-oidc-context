/**
 * @public
 */
export const hasAuthParams = (location = window.location): boolean => {
    // response_mode: query
    let searchParams = new URLSearchParams(location.search);
    if ((searchParams.get("code") || searchParams.get("error")) &&
        searchParams.get("state")) {
        return true;
    }

    // response_mode: fragment
    searchParams = new URLSearchParams(location.hash.replace("#", "?"));
    if ((searchParams.get("code") || searchParams.get("error")) &&
        searchParams.get("state")) {
        return true;
    }

    return false;
};

const normalizeErrorFn = (fallbackMessage: string) => (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }
    return new Error(fallbackMessage);
};

export const loginError = normalizeErrorFn("Login failed");
