import React from "react";

import { AuthContext, AuthContextProps } from "./AuthContext";

export const useAuth = (): AuthContextProps => {
    const context = React.useContext<AuthContextProps>(AuthContext);

    if (!context) {
        throw new Error("AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component.");
    }

    return context;
};
