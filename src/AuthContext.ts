import React from "react"
import { UserManager } from "oidc-client"

import { AuthState } from "./AuthState"

export interface AuthContextProps extends AuthState {
    /**
     * See [UserManager](https://github.com/IdentityModel/oidc-client-js/wiki#usermanager) for more details.
     */
    userManager: UserManager

    /**
     * Alias for userManager.signInRedirect
     */
    signInRedirect: (args?: any) => Promise<void>

    /**
     * Alias for userManager.removeUser
     */
    removeUser: () => Promise<void>

    /**
     * Alias for userManager.signoutRedirect
     */
    signOutRedirect: (args?: any) => Promise<void>
}

export const AuthContext = React.createContext<AuthContextProps>(undefined as any)
AuthContext.displayName = "AuthContext"
