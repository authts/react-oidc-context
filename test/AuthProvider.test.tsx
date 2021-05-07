import { UserManager, User } from "oidc-client"
import { act} from "@testing-library/react"
import { renderHook } from "@testing-library/react-hooks"
import { mocked } from "ts-jest/utils"

import { useAuth } from "../src/useAuth"
import { createWrapper } from "./helpers"

const userManagerMock = mocked(new UserManager({ client_id: "" }))
const user = { id_token: "__test_user__" } as User

describe("AuthProvider", () => {
    it("should signInRedirect when asked", async () => {
        const wrapper = createWrapper()
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()
        expect(result.current.user).toBeUndefined()

        await act(async () => {
            result.current.signInRedirect()
        })

        expect(userManagerMock.signinRedirect).toHaveBeenCalled()
        expect(userManagerMock.getUser).toHaveBeenCalled()
    })

    it("should handle signinCallback success and clear the url", async () => {
        window.history.pushState(
            {},
            document.title,
            "/?code=__test_code__&state=__test_state__"
        )
        expect(window.location.href).toBe(
            "https://www.example.com/?code=__test_code__&state=__test_state__"
        )

        const wrapper = createWrapper()
        const { waitForNextUpdate } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        expect(userManagerMock.signinCallback).toHaveBeenCalled()
        expect(window.location.href).toBe("https://www.example.com/")
    })

    it("should handle signOut", async () => {
        const onSignOut = jest.fn()

        const wrapper = createWrapper({ onSignOut })
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        await act(async () => {
            result.current.signOut()
        })

        expect(userManagerMock.removeUser).toHaveBeenCalled()
        expect(onSignOut).toHaveBeenCalled()
    })

    it("should handle signoutRedirect", async () => {
        const onSignOut = jest.fn()
        const wrapper = createWrapper({ onSignOut })
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        await act(async () => {
            result.current.signOutRedirect()
        })

        expect(userManagerMock.signoutRedirect).toHaveBeenCalled()
        expect(onSignOut).toHaveBeenCalled()
    })

    it("should get the user", async () => {
        userManagerMock.getUser.mockResolvedValue(user)
        const wrapper = createWrapper()
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        expect(result.current.user).toBe(user)
      })
})
