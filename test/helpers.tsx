import React from "react"

import { AuthProvider, AuthProviderProps } from "../src/AuthProvider"

export const createWrapper = (opts?: AuthProviderProps) => ({
    children,
}: React.PropsWithChildren<AuthProviderProps>): JSX.Element => (
    <AuthProvider
        client_id={"__test_client_id__"}
        {...opts}
    >
        {children}
    </AuthProvider>
)
