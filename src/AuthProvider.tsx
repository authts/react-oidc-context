import React from "react";
import { UserManager, UserManagerSettings, User } from "oidc-client";

import { AuthContext } from "./AuthContext";
import { initialAuthState } from "./AuthState";
import { reducer } from "./reducer";
import { hasAuthParams, loginError } from "./utils";

export interface AuthProviderProps extends UserManagerSettings {
    /**
     * The child nodes your Provider has wrapped
     */
    children?: React.ReactNode;

    /**
     * On sign in callback hook. Can be a async function.
     * Here you can remove the code and state parameters from the url when you are redirected from the authorize page.
     *
     * ```jsx
     * const onSigninCallback = (_user: User | null): void => {
     *     window.history.replaceState(
     *         {},
     *         document.title,
     *         window.location.pathname
     *     )
     * }
     * ```
     */
    onSigninCallback?: (user: User | null) => Promise<void> | void;

    /**
     * By default, if the page url has code/state params, this provider will call automatically the userManager.signinCallback.
     * In some cases the code might be for something else (another OAuth SDK perhaps). In these
     * instances you can instruct the client to ignore them.
     *
     * ```jsx
     * <AuthProvider
     *   skipSigninCallback={window.location.pathname === '/stripe-oauth-callback'}
     * >
     * ```
     */
    skipSigninCallback?: boolean;

    /**
     * On remove user hook. Can be a async function.
     */
    onRemoveUser?: () => Promise<void> | void;

    /**
     * On sign out redirect hook. Can be a async function.
     * Here you can change the url after the logout.
     * ```jsx
     * const onSignOutRedirect = (): void => {
     *     // go to home after logout
     *     window.location.pathname = ""
     * }
     * ```
     */
    onSignoutRedirect?: () => Promise<void> | void;

    /**
     * On sign out popup hook. Can be a async function.
     */
    onSignoutPopup?: () => Promise<void> | void;
}

/**
 * Provides the AuthContext to its child components.
 */
export const AuthProvider = (props: AuthProviderProps): JSX.Element => {
    const {
        children,

        onSigninCallback,
        skipSigninCallback,

        onRemoveUser,
        onSignoutRedirect,
        onSignoutPopup,

        ...userManagerProps
    } = props;

    const [userManager] = React.useState<UserManager>(() => new UserManager(userManagerProps));
    const [state, dispatch] = React.useReducer(reducer, initialAuthState);

    React.useEffect(() => {
        void (async (): Promise<void> => {
            try {
                // check if returning back from authority server
                if (hasAuthParams() && !skipSigninCallback) {
                    const user = await userManager.signinCallback();
                    onSigninCallback && onSigninCallback(user);
                }
                const user = await userManager.getUser();
                dispatch({ type: "INITIALISED", user });
            } catch (error) {
                dispatch({ type: "ERROR", error: loginError(error) });
            }
        }
        )();
    }, [userManager, skipSigninCallback, onSigninCallback]);

    // register to userManager events
    React.useEffect(() => {
        // event UserLoaded (e.g. initial load, silent renew success)
        const handleUserLoaded = (user: User) => {
            dispatch({ type: "USER_LOADED", user });
        };
        userManager.events.addUserLoaded(handleUserLoaded);

        // event UserUnloaded (e.g. userManager.removeUser)
        const handleUserUnloaded = () => {
            dispatch({ type: "USER_UNLOADED" });
        };
        userManager.events.addUserUnloaded(handleUserUnloaded);

        // event SilentRenewError (silent renew error)
        const handleSilentRenewError = (error: Error) => {
            dispatch({ type: "ERROR", error });
        };
        userManager.events.addSilentRenewError(handleSilentRenewError);

        return () => {
            userManager.events.removeUserLoaded(handleUserLoaded);
            userManager.events.removeUserUnloaded(handleUserUnloaded);
            userManager.events.removeSilentRenewError(handleSilentRenewError);
        };
    }, [userManager]);

    const removeUser = React.useCallback(
        async (): Promise<void> => {
            await userManager.removeUser();
            onRemoveUser && onRemoveUser();
        },
        [userManager, onRemoveUser]
    );

    const signoutRedirect = React.useCallback(
        async (args?: any): Promise<void> => {
            await userManager.signoutRedirect(args);
            onSignoutRedirect && onSignoutRedirect();
        },
        [userManager, onSignoutRedirect]
    );

    const signoutPopup = React.useCallback(
        async (args?: any): Promise<void> => {
            await userManager.signoutPopup(args);
            onSignoutPopup && onSignoutPopup();
        },
        [userManager, onSignoutPopup]
    );

    return (
        <AuthContext.Provider
            value={{
                ...state,
                settings: userManager.settings,
                clearStaleState: userManager.clearStaleState.bind(userManager),
                removeUser,
                signinPopup: userManager.signinPopup.bind(userManager),
                signinSilent: userManager.signinSilent.bind(userManager),
                signinRedirect: userManager.signinRedirect.bind(userManager),
                signoutRedirect,
                signoutPopup,
                querySessionStatus: userManager.querySessionStatus.bind(userManager),
                revokeAccessToken: userManager.revokeAccessToken.bind(userManager),
                startSilentRenew: userManager.startSilentRenew.bind(userManager),
                stopSilentRenew: userManager.stopSilentRenew.bind(userManager),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
