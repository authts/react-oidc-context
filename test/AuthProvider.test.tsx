/* eslint-disable @typescript-eslint/unbound-method */
import { UserManager, User } from "oidc-client";
import { renderHook } from "@testing-library/react-hooks";
import { mocked } from "ts-jest/utils";

import { useAuth } from "../src/useAuth";
import { createWrapper } from "./helpers";

const user = { id_token: "__test_user__" } as User;

describe("AuthProvider", () => {
    it("should signinRedirect when asked", async () => {
        // arrange
        const wrapper = createWrapper();
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();
        expect(result.current.user).toBeUndefined();

        // act
        await result.current.signinRedirect();

        // assert
        expect(UserManager.prototype.signinRedirect).toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

    it("should handle signinCallback success and call onSigninCallback", async () => {
        // arrange
        const onSigninCallback = jest.fn();
        window.history.pushState(
            {},
            document.title,
            "/?code=__test_code__&state=__test_state__"
        );
        expect(window.location.href).toBe(
            "https://www.example.com/?code=__test_code__&state=__test_state__"
        );

        const wrapper = createWrapper({ onSigninCallback });

        // act
        const { waitForNextUpdate } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();

        // assert
        expect(UserManager.prototype.signinCallback).toHaveBeenCalled();
        expect(onSigninCallback).toHaveBeenCalled();
    });

    it("should handle signinCallback errors and call onSigninCallback", async () => {
        // arrange
        const onSigninCallback = jest.fn();
        window.history.pushState(
            {},
            document.title,
            "/?error=__test_error__&state=__test_state__"
        );
        expect(window.location.href).toBe(
            "https://www.example.com/?error=__test_error__&state=__test_state__"
        );

        const wrapper = createWrapper({ onSigninCallback });

        // act
        const { waitForNextUpdate } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();

        // assert
        expect(UserManager.prototype.signinCallback).toHaveBeenCalled();
        expect(onSigninCallback).toHaveBeenCalled();
    });

    it("should handle removeUser and call onRemoveUser", async () => {
        // arrange
        const onRemoveUser = jest.fn();

        const wrapper = createWrapper({ onRemoveUser });
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();

        // act
        await result.current.removeUser();

        // assert
        expect(UserManager.prototype.removeUser).toHaveBeenCalled();
        expect(onRemoveUser).toHaveBeenCalled();
    });

    it("should handle signoutRedirect and call onSignoutRedirect", async () => {
        // arrange
        const onSignoutRedirect = jest.fn();
        const wrapper = createWrapper({ onSignoutRedirect });
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();

        // act
        await result.current.signoutRedirect();

        // assert
        expect(UserManager.prototype.signoutRedirect).toHaveBeenCalled();
        expect(onSignoutRedirect).toHaveBeenCalled();
    });

    it("should handle signoutPopup and call onSignoutPopup", async () => {
        // arrange
        const onSignoutPopup = jest.fn();
        const wrapper = createWrapper({ onSignoutPopup });
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();

        // act
        await result.current.signoutPopup();

        // assert
        expect(UserManager.prototype.signoutPopup).toHaveBeenCalled();
        expect(onSignoutPopup).toHaveBeenCalled();
    });

    it("should get the user", async () => {
        // arrange
        mocked(UserManager.prototype).getUser.mockResolvedValueOnce(user);
        const wrapper = createWrapper();

        // act
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();

        // assert
        expect(result.current.user).toBe(user);
    });

    it("should use a custom UserManager implementation", async () => {
        // arrange
        class CustomUserManager extends UserManager { }
        mocked(CustomUserManager.prototype).signinRedirect = jest.fn();

        const wrapper = createWrapper({ implementation: CustomUserManager });
        const { waitForNextUpdate, result } = renderHook(() => useAuth(), {
            wrapper,
        });
        await waitForNextUpdate();
        expect(result.current.user).toBeUndefined();

        // act
        await result.current.signinRedirect();

        // assert
        expect(UserManager.prototype.signinRedirect).not.toHaveBeenCalled();
        expect(CustomUserManager.prototype.signinRedirect).toHaveBeenCalled();
    });

    it("should should throw when no UserManager implementation exists", async () => {
        // arrange
        const wrapper = createWrapper({ implementation: null });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        // act
        try {
            await result.current.signinRedirect();
            fail("should not come here");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
        }

        // assert
        expect(UserManager.prototype.signinRedirect).not.toHaveBeenCalled();
    });
});
