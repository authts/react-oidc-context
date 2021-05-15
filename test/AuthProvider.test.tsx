import { UserManager, User } from "oidc-client"
import { act} from "@testing-library/react"
import { renderHook } from "@testing-library/react-hooks"
import { mocked } from "ts-jest/utils"

import { useAuth } from "../src/useAuth"
import { createWrapper } from "./helpers"

const userManagerMock = mocked(new UserManager({ client_id: "" }))
const user = { id_token: "__test_user__" } as User

describe("AuthProvider", () => {
    it("should signinRedirect when asked", async () => {
        const wrapper = createWrapper()
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()
        expect(result.current.user).toBeUndefined()

        await act(async () => {
            result.current.signinRedirect()
        })

        expect(userManagerMock.signinRedirect).toHaveBeenCalled()
        expect(userManagerMock.getUser).toHaveBeenCalled()
    })

    it("should handle signinCallback success and call onSigninCallback", async () => {
        const onSigninCallback = jest.fn()
        window.history.pushState(
            {},
            document.title,
            "/?code=__test_code__&state=__test_state__"
        )
        expect(window.location.href).toBe(
            "https://www.example.com/?code=__test_code__&state=__test_state__"
        )

        const wrapper = createWrapper({ onSigninCallback })
        const { waitForNextUpdate } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        expect(userManagerMock.signinCallback).toHaveBeenCalled()
        expect(onSigninCallback).toHaveBeenCalled()
    })

    it("should handle removeUser and call onRemoveUser", async () => {
        const onRemoveUser = jest.fn()

        const wrapper = createWrapper({ onRemoveUser })
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        await act(async () => {
            result.current.removeUser()
        })

        expect(userManagerMock.removeUser).toHaveBeenCalled()
        expect(onRemoveUser).toHaveBeenCalled()
    })

    it("should handle signoutRedirect and call onSignoutRedirect", async () => {
        const onSignoutRedirect = jest.fn()
        const wrapper = createWrapper({ onSignoutRedirect })
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        await act(async () => {
            result.current.signoutRedirect()
        })

        expect(userManagerMock.signoutRedirect).toHaveBeenCalled()
        expect(onSignoutRedirect).toHaveBeenCalled()
    })

    it("should handle signoutPopup and call onSignoutPopup", async () => {
        const onSignoutPopup = jest.fn()
        const wrapper = createWrapper({ onSignoutPopup })
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        })
        await waitForNextUpdate()

        await act(async () => {
            result.current.signoutPopup()
        })

        expect(userManagerMock.signoutPopup).toHaveBeenCalled()
        expect(onSignoutPopup).toHaveBeenCalled()
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
