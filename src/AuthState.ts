import type { User } from "oidc-client";

/**
 * The auth state which, when combined with the auth methods, make up the return object of the `useAuth` hook.
 */
export interface AuthState {
    /**
     * See [User](https://github.com/IdentityModel/oidc-client-js/wiki#user) for more details.
     */
    user?: User | null;

    /**
     * True until the library has been initialized.
     */
    isLoading: boolean;

    /**
     * True, if we have a valid access token.
     */
    isAuthenticated: boolean;

    /**
     * Was there a sigIn or silent renew error?
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
