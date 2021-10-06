import React, { Component } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { AuthContextProps, AuthProvider, withAuth } from "../src";

describe("withAuth", () => {
    it("should wrap a class component", async () => {
        // arrange
        class MyComponent extends Component<AuthContextProps> {
            render(): JSX.Element {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return <>hasAuth: {`${!!this.props.signinRedirect}`}</>;
            }
        }

        // act
        const WrappedComponent = withAuth(MyComponent);
        render(
            <AuthProvider>
                <WrappedComponent />
            </AuthProvider>
        );
        await waitFor(() => expect(screen.getByText("hasAuth: true")).toBeInTheDocument());
    });
});
