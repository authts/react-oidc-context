import type {
    SigninPopupArgs,
    SigninRedirectArgs,
    SigninResourceOwnerCredentialsArgs,
    SigninSilentArgs,
    SignoutPopupArgs,
    SignoutRedirectArgs,
    SignoutSilentArgs,
    User,
} from "oidc-client-ts";

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

    /**
     * If there is an error, in which context does it happen?
     */
    errorContext?: ErrorContext;
}

/**
 * Represents the context in which an error happens.
 *
 * @public
 */
export type ErrorContext =
    | { kind: "signinCallback" }
    | { kind: "signoutCallback" }
    | { kind: "renewSilent" }

    | { kind: "signinPopup"; args: SigninPopupArgs | undefined }
    | { kind: "signinSilent"; args: SigninSilentArgs | undefined }
    | { kind: "signinRedirect"; args: SigninRedirectArgs | undefined }
    | { kind: "signinResourceOwnerCredentials"; args: SigninResourceOwnerCredentialsArgs | undefined }
    | { kind: "signoutPopup"; args: SignoutPopupArgs | undefined }
    | { kind: "signoutRedirect"; args: SignoutRedirectArgs | undefined }
    | { kind: "signoutSilent"; args: SignoutSilentArgs | undefined }

    | { kind: "unknown" };

/**
 * The initial auth state.
 */
export const initialAuthState: AuthState = {
    isLoading: true,
    isAuthenticated: false,
};
