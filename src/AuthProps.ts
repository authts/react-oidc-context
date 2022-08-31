import type { User, UserManager, UserManagerSettings } from "oidc-client-ts";

interface AuthProviderPropsBase extends UserManagerSettings {
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
     * Allow passing a custom UserManager
     */
    userManager?: UserManager;

    /**
     * @deprecated Allow passing a custom UserManager implementation
     */
    implementation?: typeof UserManager | null;
}

interface AuthProviderUserManagerProps extends Omit<AuthProviderPropsBase, "redirect_uri" | "client_id" | "authority"> {
    redirect_uri?: never;
    client_id?: never;
    authority?: never;
}

interface AuthProviderNoUserManagerProps extends AuthProviderPropsBase {
    userManager?: never;
}

/**
 * @public
 */
export type AuthProviderProps = AuthProviderNoUserManagerProps | AuthProviderUserManagerProps;