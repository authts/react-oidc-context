import React, { Component } from "react"
import { render, act, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"

import { AuthContextProps, AuthProvider, withAuth } from "../"

describe("withAuth", () => {
    it("should wrap a class component", async () => {
        await act(async () => {
            class MyComponent extends Component<AuthContextProps> {
                render(): JSX.Element {
                    return <>hasAuth: {`${!!this.props.signInRedirect}`}</>
                }
            }
            const WrappedComponent = withAuth(MyComponent);
            render(
                <AuthProvider>
                    <WrappedComponent />
                </AuthProvider>
            )
            await waitFor(() => expect(screen.getByText("hasAuth: true")).toBeInTheDocument())
        })
    })
})
