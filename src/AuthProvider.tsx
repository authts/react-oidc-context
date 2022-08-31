import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { UserManager, UserManagerSettings, User } from "oidc-client-ts";
import type { SignoutRedirectArgs, SignoutPopupArgs } from "oidc-client-ts";

import { AuthContext } from "./AuthContext";
import { initialAuthState } from "./AuthState";
import { reducer } from "./reducer";
import { hasAuthParams, loginError } from "./utils";
import type { AuthProviderProps } from "./AuthProps";

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
    "signoutPopup",
    "signoutRedirect",
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

        onRemoveUser,
        onSignoutRedirect,
        onSignoutPopup,

        implementation: UserManagerImpl = defaultUserManagerImpl,
        userManager: userManagerProp,
        ...userManagerSettings
    } = props;

    const [userManager] = useState(() => {
        if (userManagerProp) {
            return userManagerProp;
        }

        return UserManagerImpl
            ? new UserManagerImpl(userManagerSettings as UserManagerSettings)
            : ({ settings: userManagerSettings } as UserManager);
    });

    const [state, dispatch] = useReducer(reducer, initialAuthState);
    const userManagerContext = useMemo(
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
                            ? async (...args: never[]) => {
                                dispatch({
                                    type: "NAVIGATOR_INIT",
                                    method: key,
                                });
                                try {
                                    return await userManager[key](...args);
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
    const didInitialize = useRef(false);

    useEffect(() => {
        if (!userManager || didInitialize.current) {
            return;
        }
        didInitialize.current = true;

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
        })();
    }, [userManager, skipSigninCallback, onSigninCallback]);

    // register to userManager events
    useEffect(() => {
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

    const removeUser = useCallback(
        userManager
            ? () => userManager.removeUser().then(onRemoveUser)
            : unsupportedEnvironment("removeUser"),
        [userManager, onRemoveUser],
    );

    const signoutRedirect = useCallback(
        (args?: SignoutRedirectArgs) =>
            userManagerContext.signoutRedirect(args).then(onSignoutRedirect),
        [userManagerContext.signoutRedirect, onSignoutRedirect],
    );

    const signoutPopup = useCallback(
        (args?: SignoutPopupArgs) =>
            userManagerContext.signoutPopup(args).then(onSignoutPopup),
        [userManagerContext.signoutPopup, onSignoutPopup],
    );

    return (
        <AuthContext.Provider
            value={{
                ...state,
                ...userManagerContext,
                removeUser,
                signoutRedirect,
                signoutPopup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
