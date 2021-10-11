import type { User } from "oidc-client";

import type { AuthState } from "./AuthState";

type Action =
  | { type: | "INITIALISED" | "USER_LOADED"; user: User | null }
  | { type: "USER_UNLOADED" }
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
