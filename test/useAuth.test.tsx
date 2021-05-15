import { renderHook } from "@testing-library/react-hooks"

import { useAuth } from "../src/useAuth"
import { createWrapper } from "./helpers"

describe("useAuth", () => {
    it("should provide the auth context", async () => {
        const wrapper = createWrapper()
        const { result, waitForNextUpdate } = renderHook(useAuth, { wrapper })
        await waitForNextUpdate()
        expect(result.current).toBeDefined()
    })

    it("should throw with no provider", () => {
        const { result } = renderHook(useAuth)
        expect(() => { result.current.signinRedirect() }).toThrowError(
            "AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component."
        )
    })
})
