import React from "react"

import { AuthProvider, AuthProviderProps } from "../src/AuthProvider"

export const createWrapper = (opts: AuthProviderProps = {client_id: "__test_client_id__" }) => ({
    children,
}: React.PropsWithChildren<AuthProviderProps>): JSX.Element => (
    <AuthProvider {...opts}>
        {children}
    </AuthProvider>
)
