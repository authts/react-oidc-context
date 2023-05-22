import React from "react";

import { AuthProvider, type AuthProviderProps } from "../src/AuthProvider";

export const createWrapper =
    (opts: AuthProviderProps, strictMode = true) =>
        ({ children }: React.PropsWithChildren): JSX.Element => {
            const provider = <AuthProvider {...opts}>{children}</AuthProvider>;
            if (!strictMode) {
                return provider;
            }

            return <React.StrictMode>{provider}</React.StrictMode>;
        };

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
        replace: jest.fn(),
    };
    return location;
};
