import React from "react";
import { UserManagerSettings, User, SessionStatus } from "oidc-client";

import { AuthState } from "./AuthState";

export interface AuthContextProps extends AuthState {
    /**
     * UserManager functions. See [UserManager](https://github.com/IdentityModel/oidc-client-js/wiki#usermanager) for more details.
     */
     readonly settings: UserManagerSettings;
     clearStaleState(): Promise<void>;
     removeUser(): Promise<void>;
     signinPopup(args?: any): Promise<User>;
     signinSilent(args?: any): Promise<User>;
     signinRedirect(args?: any): Promise<void>;
     signoutRedirect(args?: any): Promise<void>;
     signoutPopup(args?: any): Promise<void>;
     querySessionStatus(args?: any): Promise<SessionStatus>;
     revokeAccessToken(): Promise<void>;
     startSilentRenew(): void;
     stopSilentRenew(): void;
}

export const AuthContext = React.createContext<AuthContextProps>(undefined as any);
AuthContext.displayName = "AuthContext";
