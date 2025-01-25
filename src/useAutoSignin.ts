import React from "react";
import { useAuth } from "./useAuth";
import { hasAuthParams } from "./utils";
import type { AuthContextProps } from "./AuthContext";

type UseAutoSignInProps = {
    signinMethod?: keyof Pick<AuthContextProps, "signinSilent" | "signinRedirect" | "signinPopup">;
}

type UseAutoSignInReturn = {
    isLoading: boolean;
    isAuthenticated: boolean;
    isError: boolean;
}

/**
 * @public
 *
 * Automatically attempts to sign in a user based on the provided sign-in method and authentication state.
 *
 * This hook manages automatic sign-in behavior for a user. It uses the specified sign-in
 * method, the current authentication state, and ensures the sign-in attempt is made only once
 * in the application context.
 *
 * Does not support the signinResourceOwnerCredentials method!
 *
 * @param {UseAutoSignInProps} [options='{signinMethod: "signinRedirect"}'] - Configuration object for the sign-in method.
 * @param {string} [options.signinMethod="signinRedirect"] - The sign-in method to use for auto sign-in.
 *        Possible values are:
 *        - "signinRedirect": Redirects the user to the sign-in page (default).
 *        - "signinSilent": Signs in the user silently in the background.
 *        - "signinPopup": Signs in the user through a popup.
 *
 * @returns {UseAutoSignInReturn} - The current status of the authentication process.
 * @returns {boolean} isLoading - Indicates whether the authentication process is currently in progress.
 * @returns {boolean} isAuthenticated - Indicates whether the user is currently signed in.
 * @returns {boolean} isError - Indicates whether there was an error during the sign-in or silent renew process.
 */

export const useAutoSignin = ({ signinMethod = "signinRedirect" }: UseAutoSignInProps = {}): UseAutoSignInReturn => {
    const auth = useAuth();
    const [hasTriedSignin, setHasTriedSignin] = React.useState(false);

    const shouldAttemptSignin = React.useMemo(() => !hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading &&
        !hasTriedSignin, [auth.activeNavigator, auth.isAuthenticated, auth.isLoading, hasTriedSignin]);

    React.useEffect(() => {
        if (shouldAttemptSignin) {
            switch (signinMethod) {
                case "signinSilent":
                    void auth.signinSilent();
                    break;
                case "signinPopup":
                    void auth.signinPopup();
                    break;
                case "signinRedirect":
                default:
                    void auth.signinRedirect();
                    break;
            }

            setHasTriedSignin(true);
        }
    }, [auth, hasTriedSignin, shouldAttemptSignin, signinMethod]);

    return {
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        isError: !!auth.error,
    };
};
