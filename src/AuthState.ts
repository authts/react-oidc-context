import type { User } from "oidc-client-ts";

/**
 * The auth state which, when combined with the auth methods, make up the return object of the `useAuth` hook.
 *
 * @public
 */
export interface AuthState {
    /**
     * See [User](https://authts.github.io/oidc-client-ts/classes/User.html) for more details.
     */
    user?: User | null;

    /**
     * True when the library has been initialized and no navigator request is in progress.
     */
    isLoading: boolean;

    /**
     * True while the user has a valid access token.
     */
    isAuthenticated: boolean;

    /**
     * Tracks the status of most recent signin/signout request method.
     */
    activeNavigator?: "signinRedirect" | "signinResourceOwnerCredentials" | "signinPopup" | "signinSilent" | "signoutRedirect" | "signoutPopup" | "signoutSilent";

    /**
     * Was there a signin or silent renew error?
     */
    error?: Error;
}

/**
 * The initial auth state.
 */
export const initialAuthState: AuthState = {
    isLoading: true,
    isAuthenticated: false,
};
