import React from "react";
import { UserManager, type UserManagerSettings, User } from "oidc-client-ts";
import type {
    SignoutRedirectArgs,
    SignoutPopupArgs,
    SignoutSilentArgs,
    ProcessResourceOwnerPasswordCredentialsArgs,
    SignoutResponse,
} from "oidc-client-ts";

import { AuthContext } from "./AuthContext";
import { initialAuthState } from "./AuthState";
import { reducer } from "./reducer";
import { hasAuthParams, loginError, signoutError } from "./utils";

/**
 * @public
 */
export interface AuthProviderPropsBase extends UserManagerSettings {
    /**
     * The child nodes your Provider has wrapped
     */
    children?: React.ReactNode;

    /**
     * On sign in callback hook. Can be a async function.
     * Here you can remove the code and state parameters from the url when you are redirected from the authorize page.
     *
     * ```jsx
     * const onSigninCallback = (_user: User | void): void => {
     *     window.history.replaceState(
     *         {},
     *         document.title,
     *         window.location.pathname
     *     )
     * }
     * ```
     */
    onSigninCallback?: (user: User | void) => Promise<void> | void;

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
      * Match the redirect uri used for logout (e.g. `post_logout_redirect_uri`)
      * This provider will then call automatically the `userManager.signoutCallback`.
      *
      * HINT:
      * Do not call `userManager.signoutRedirect()` within a `React.useEffect`, otherwise the
      * logout might be unsuccessful.
      *
      * ```jsx
      * <AuthProvider
      *   matchSignoutCallback={(args) => {
      *     window &&
      *     (window.location.href === args.post_logout_redirect_uri);
      *   }}
      * ```
      */
    matchSignoutCallback?: (args: UserManagerSettings) => boolean;

    /**
     * On sign out callback hook. Can be a async function.
     * Here you can change the url after the user is signed out.
     * When using this, specifying `matchSignoutCallback` is required.
     *
     * ```jsx
     * const onSignoutCallback = (resp: SignoutResponse | void): void => {
     *     // go to home after logout
     *     window.location.pathname = ""
     * }
     * ```
     */
    onSignoutCallback?: (resp: SignoutResponse | void) => Promise<void> | void;

    /**
     * On remove user hook. Can be a async function.
     * Here you can change the url after the user is removed.
     *
     * ```jsx
     * const onRemoveUser = (): void => {
     *     // go to home after logout
     *     window.location.pathname = ""
     * }
     * ```
     */
    onRemoveUser?: () => Promise<void> | void;

    /**
     * @deprecated On sign out redirect hook. Can be a async function.
     */
    onSignoutRedirect?: () => Promise<void> | void;

    /**
     * @deprecated On sign out popup hook. Can be a async function.
     */
    onSignoutPopup?: () => Promise<void> | void;

    /**
     * Allow passing a custom UserManager.
     */
    userManager?: UserManager;

    /**
     * @deprecated Allow passing a custom UserManager implementation
     */
    implementation?: typeof UserManager | null;
}

/**
 * @public
 */
export interface AuthProviderUserManagerProps extends Omit<AuthProviderPropsBase, "redirect_uri" | "client_id" | "authority"> {
    redirect_uri?: never;
    client_id?: never;
    authority?: never;
}

/**
 * @public
 */
export interface AuthProviderNoUserManagerProps extends AuthProviderPropsBase {
    userManager?: never;
}

/**
 * @public
 */
export type AuthProviderProps = AuthProviderNoUserManagerProps | AuthProviderUserManagerProps;

const userManagerContextKeys = [
    "clearStaleState",
    "querySessionStatus",
    "revokeTokens",
    "startSilentRenew",
    "stopSilentRenew",
] as const;
const navigatorKeys = [
    "signinPopup",
    "signinSilent",
    "signinRedirect",
    "signinResourceOwnerCredentials",
    "signoutPopup",
    "signoutRedirect",
    "signoutSilent",
] as const;
const unsupportedEnvironment = (fnName: string) => () => {
    throw new Error(
        `UserManager#${fnName} was called from an unsupported context. If this is a server-rendered page, defer this call with useEffect() or pass a custom UserManager implementation.`,
    );
};
const defaultUserManagerImpl =
    typeof window === "undefined" ? null : UserManager;

/**
 * Provides the AuthContext to its child components.
 * @public
 */
export const AuthProvider = (props: AuthProviderProps): JSX.Element => {
    const {
        children,

        onSigninCallback,
        skipSigninCallback,

        matchSignoutCallback,
        onSignoutCallback,

        onRemoveUser,
        onSignoutRedirect,
        onSignoutPopup,

        implementation: UserManagerImpl = defaultUserManagerImpl,
        userManager: userManagerProp,
        ...userManagerSettings
    } = props;

    const [userManager] = React.useState(() => {
        return userManagerProp ??
            (UserManagerImpl
                ? new UserManagerImpl(userManagerSettings as UserManagerSettings)
                : ({ settings: userManagerSettings } as UserManager));
    });

    const [state, dispatch] = React.useReducer(reducer, initialAuthState);
    const userManagerContext = React.useMemo(
        () =>
            Object.assign(
                {
                    settings: userManager.settings,
                    events: userManager.events,
                },
                Object.fromEntries(
                    userManagerContextKeys.map((key) => [
                        key,
                        userManager[key]?.bind(userManager) ??
                            unsupportedEnvironment(key),
                    ]),
                ) as Pick<UserManager, typeof userManagerContextKeys[number]>,
                Object.fromEntries(
                    navigatorKeys.map((key) => [
                        key,
                        userManager[key]
                            ? async (args: ProcessResourceOwnerPasswordCredentialsArgs & never[]) => {
                                dispatch({
                                    type: "NAVIGATOR_INIT",
                                    method: key,
                                });
                                try {
                                    return await userManager[key](args);
                                } catch (error) {
                                    dispatch({ type: "ERROR", error: error as Error });
                                    return null;
                                } finally {
                                    dispatch({ type: "NAVIGATOR_CLOSE" });
                                }
                            }
                            : unsupportedEnvironment(key),
                    ]),
                ) as Pick<UserManager, typeof navigatorKeys[number]>,
            ),
        [userManager],
    );
    const didInitialize = React.useRef(false);

    React.useEffect(() => {
        if (!userManager || didInitialize.current) {
            return;
        }
        didInitialize.current = true;

        void (async (): Promise<void> => {
            // sign-in
            let user: User | void | null = null;
            try {
                // check if returning back from authority server
                if (hasAuthParams() && !skipSigninCallback) {
                    user = await userManager.signinCallback();
                    onSigninCallback && await onSigninCallback(user);
                }
                user = !user ? await userManager.getUser() : user;
                dispatch({ type: "INITIALISED", user });
            } catch (error) {
                dispatch({ type: "ERROR", error: loginError(error) });
            }

            // sign-out
            try {
                if (matchSignoutCallback && matchSignoutCallback(userManager.settings)) {
                    const resp = await userManager.signoutCallback();
                    onSignoutCallback && await onSignoutCallback(resp);
                }
            } catch (error) {
                dispatch({ type: "ERROR", error: signoutError(error) });
            }
        })();
    }, [userManager, skipSigninCallback, onSigninCallback, onSignoutCallback, matchSignoutCallback]);

    // register to userManager events
    React.useEffect(() => {
        if (!userManager) return undefined;
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

        // event UserSignedOut (e.g. user was signed out in background (checkSessionIFrame option))
        const handleUserSignedOut = () => {
            dispatch({ type: "USER_SIGNED_OUT" });
        };
        userManager.events.addUserSignedOut(handleUserSignedOut);

        // event SilentRenewError (silent renew error)
        const handleSilentRenewError = (error: Error) => {
            dispatch({ type: "ERROR", error });
        };
        userManager.events.addSilentRenewError(handleSilentRenewError);

        return () => {
            userManager.events.removeUserLoaded(handleUserLoaded);
            userManager.events.removeUserUnloaded(handleUserUnloaded);
            userManager.events.removeUserSignedOut(handleUserSignedOut);
            userManager.events.removeSilentRenewError(handleSilentRenewError);
        };
    }, [userManager]);

    const removeUser = React.useCallback(
        userManager
            ? () => userManager.removeUser().then(onRemoveUser)
            : unsupportedEnvironment("removeUser"),
        [userManager, onRemoveUser],
    );

    const signoutRedirect = React.useCallback(
        (args?: SignoutRedirectArgs) =>
            userManagerContext.signoutRedirect(args).then(onSignoutRedirect),
        [userManagerContext.signoutRedirect, onSignoutRedirect],
    );

    const signoutPopup = React.useCallback(
        (args?: SignoutPopupArgs) =>
            userManagerContext.signoutPopup(args).then(onSignoutPopup),
        [userManagerContext.signoutPopup, onSignoutPopup],
    );

    const signoutSilent = React.useCallback(
        (args?: SignoutSilentArgs) =>
            userManagerContext.signoutSilent(args),
        [userManagerContext.signoutSilent],
    );

    const contextValue = React.useMemo(() => {
        return {
            ...state,
            ...userManagerContext,
            removeUser,
            signoutRedirect,
            signoutPopup,
            signoutSilent,
        };
    }, [state, userManagerContext, removeUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
