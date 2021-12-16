import type { User } from "oidc-client-ts";

import type { AuthState } from "./AuthState";

type Action =
    | { type: "INITIALISED" | "USER_LOADED"; user: User | null }
    | { type: "USER_UNLOADED" }
    | { type: "NAVIGATOR_INIT"; method: NonNullable<AuthState["activeNavigator"]> }
    | { type: "NAVIGATOR_CLOSE" }
    | { type: "ERROR"; error: Error };

/**
 * Handles how that state changes in the `useAuth` hook.
 */
export const reducer = (state: AuthState, action: Action): AuthState => {
    switch (action.type) {
        case "INITIALISED":
        case "USER_LOADED":
            return {
                ...state,
                user: action.user,
                isLoading: false,
                isAuthenticated: action.user ? !action.user.expired : false,
                error: undefined,
            };
        case "USER_UNLOADED":
            return {
                ...state,
                user: undefined,
                isAuthenticated: false,
            };
        case "NAVIGATOR_INIT":
            return {
                ...state,
                isLoading: true,
                activeNavigator: action.method,
            };
        case "NAVIGATOR_CLOSE":
            // we intentionally don't handle cases where multiple concurrent navigators are open
            return {
                ...state,
                isLoading: false,
                activeNavigator: undefined,
            };
        case "ERROR":
            return {
                ...state,
                isLoading: false,
                error: action.error,
            };
        default:
            return {
                ...state,
                isLoading: false,
                error: new Error(`unknown type ${action["type"] as string}`),
            };
    }
};
