import React, { Component } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { AuthContextProps, AuthProvider, withAuth } from "../src";

const settingsStub = { authority: "authority", client_id: "client", redirect_uri: "redirect" };

describe("withAuth", () => {
    it("should wrap a class component", async () => {
        // arrange
        class MyComponent extends Component<AuthContextProps> {
            render(): JSX.Element {
                return <>hasAuth: {(!!this.props.signinRedirect).toString()}</>;
            }
        }

        // act
        const WrappedComponent = withAuth(MyComponent);
        render(
            <AuthProvider {...settingsStub}>
                <WrappedComponent />
            </AuthProvider>,
        );
        await expect(screen.findByText("hasAuth: true")).resolves.toBeInTheDocument();
    });
});
