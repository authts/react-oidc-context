import React, { Component } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { AuthProvider, withAuth } from "../src";

const settingsStub = { authority: "authority", client_id: "client", redirect_uri: "redirect" };

describe("withAuth", () => {
    it("should wrap a class component, adding AuthContextProps to the component's `auth` prop", async () => {
        // arrange
        class MyComponent extends Component {
            render(): JSX.Element {
                for (const [k, v] of Object.entries(this.props)) {
                    if (k === "auth") {
                        return <>{k}: {Object.keys(v as Map<string, unknown>)}</>;
                    }
                }
                return <></>;
            }
        }

        // act
        const WrappedComponent = withAuth(MyComponent);
        render(
            <AuthProvider {...settingsStub}>
                <WrappedComponent />
            </AuthProvider>,
        );
        await expect(screen.findByText(/auth/)).resolves.toBeInTheDocument();
        await expect(screen.findByText(/signinRedirect/)).resolves.toBeInTheDocument();
    });

    it("should pass through wrapped component props", async () => {
        // arrange
        class MyPropsComponent extends Component<{ originalProp: string }> {
            render(): JSX.Element {
                return <>originalPropValue: {this.props.originalProp}</>;
            }
        }

        // act
        const WrappedComponent = withAuth(MyPropsComponent);
        render(
            <AuthProvider {...settingsStub}>
                <WrappedComponent originalProp="myvalue" />
            </AuthProvider>,
        );
        await expect(screen.findByText("originalPropValue: myvalue")).resolves.toBeInTheDocument();
    });
});
