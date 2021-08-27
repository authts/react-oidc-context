export const hasAuthParams = (locationSearch = window.location.search): boolean => {
    const searchParams = new URLSearchParams(locationSearch);
    return Boolean(
        (searchParams.get("code") || searchParams.get("error")) &&
        searchParams.get("state")
    );
};

const normalizeErrorFn = (fallbackMessage: string) => (error: Error | any): Error => {
    if (error instanceof Error) {
        return error;
    }
    return new Error(fallbackMessage);
};

export const loginError = normalizeErrorFn("Login failed");
