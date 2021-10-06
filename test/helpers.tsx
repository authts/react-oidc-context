import React from "react";

import { AuthProvider, AuthProviderProps } from "../src/AuthProvider";

export const createWrapper = (opts?: AuthProviderProps) => ({
    children,
}: React.PropsWithChildren<AuthProviderProps>): JSX.Element => (
    <AuthProvider
        client_id={"__test_client_id__"}
        {...opts}
    >
        {children}
    </AuthProvider>
);

export const createLocation = (search: string, hash: string): Location => {
    const location: Location = {
        search,
        hash,

        host: "www.example.com",
        protocol: "https:",
        ancestorOrigins: {} as DOMStringList,
        href: "",
        hostname: "",
        origin: "",
        pathname: "",
        port: "80",
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn()
    };
    return location;
};
