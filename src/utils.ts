import type { ErrorContext } from "./AuthState";

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

const normalizeErrorFn = (source: "signoutCallback" | "signinCallback" | "renewSilent", fallbackMessage: string) => (error: unknown): ErrorContext => {
    return {
        message: messageOf(error, fallbackMessage),
        cause: error,
        stack: stackOf(error, true),
        source: source,
    };
};

export const signinError = normalizeErrorFn("signinCallback", "Sign-in failed");
export const signoutError = normalizeErrorFn("signoutCallback", "Sign-out failed");
export const renewSilentError = normalizeErrorFn("renewSilent", "Renew silent failed");

export const messageOf = (error: unknown, fallback: string): string => {
    if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
            return error.message;
        }
    }
    return fallback;
};

export const stackOf = (error: unknown, generateIfAbsent: boolean): string | undefined => {
    if (error && typeof error === "object") {
        if ("stack" in error && typeof error.stack === "string") {
            return error.stack;
        }
    }
    return generateIfAbsent ? new Error().stack : undefined;
};
