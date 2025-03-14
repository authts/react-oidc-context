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
        name: nameOf(error),
        message: messageOf(error, fallbackMessage),
        innerError: error,
        stack: stackOf(error, true),
        source: source,
    };
};

export const signinError = normalizeErrorFn("signinCallback", "Sign-in failed");
export const signoutError = normalizeErrorFn("signoutCallback", "Sign-out failed");
export const renewSilentError = normalizeErrorFn("renewSilent", "Renew silent failed");

export const nameOf = (element: unknown, fallback?: string): string => {
    return stringFieldOf(element, "name", () => fallback || "Error");
};

export const messageOf = (element: unknown, fallback: string): string => {
    return stringFieldOf(element, "message", () => fallback);
};

export const stackOf = (element: unknown, generateIfAbsent: boolean): string | undefined => {
    return stringFieldOf(element, "stack", () => generateIfAbsent ? new Error().stack : undefined);
};

function stringFieldOf(element: unknown, fieldName: string, or: () => string): string;
function stringFieldOf(element: unknown, fieldName: string, or: () => string | undefined): string | undefined;
function stringFieldOf(element: unknown, fieldName: string, or: () => string | undefined): string | undefined {
    if (element && typeof element === "object") {
        const value = (element as Record<string, unknown>)[fieldName];
        if (typeof value === "string") {
            return value;
        }
    }
    return or();
}
