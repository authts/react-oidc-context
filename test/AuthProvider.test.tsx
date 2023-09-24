import { renderHook, waitFor, act } from "@testing-library/react";
import { mocked } from "jest-mock";
import { UserManager, User } from "oidc-client-ts";
import { useAuth } from "../src/useAuth";
import { createWrapper } from "./helpers";

const settingsStub = {
    authority: "authority",
    client_id: "client",
    redirect_uri: "redirect",
};
const user = { id_token: "__test_user__" } as User;

describe("AuthProvider", () => {
    it("should signinRedirect when asked", async () => {
        // arrange
        const wrapper = createWrapper({ ...settingsStub });

        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        await waitFor(() => expect(result.current.user).toBeUndefined());

        //act
        await act(() => result.current.signinRedirect());

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
            "/?code=__test_code__&state=__test_state__",
        );
        expect(window.location.href).toBe(
            "https://www.example.com/?code=__test_code__&state=__test_state__",
        );

        const wrapper = createWrapper({ ...settingsStub, onSigninCallback });

        renderHook(() => useAuth(), {
            wrapper,
        });

        // assert
        expect(UserManager.prototype.signinCallback).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(onSigninCallback).toHaveBeenCalledTimes(1));
    });

    it("should run onSigninCallback only once in StrictMode", async () => {
        // arrange
        const onSigninCallback = jest.fn();
        window.history.pushState(
            {},
            document.title,
            "/?code=__test_code__&state=__test_state__",
        );
        expect(window.location.href).toBe(
            "https://www.example.com/?code=__test_code__&state=__test_state__",
        );

        const wrapper = createWrapper({ ...settingsStub, onSigninCallback });

        // act
        renderHook(() => useAuth(), {
            wrapper,
        });

        // assert
        await waitFor(() => expect(onSigninCallback).toBeCalledTimes(1));
        await waitFor(() =>
            expect(UserManager.prototype.signinCallback).toHaveBeenCalledTimes(
                1,
            ),
        );
    });

    it("should handle signinCallback errors and call onSigninCallback", async () => {
        // arrange
        const onSigninCallback = jest.fn();
        window.history.pushState(
            {},
            document.title,
            "/?error=__test_error__&state=__test_state__",
        );
        expect(window.location.href).toBe(
            "https://www.example.com/?error=__test_error__&state=__test_state__",
        );

        const wrapper = createWrapper({ ...settingsStub, onSigninCallback });

        // act
        renderHook(() => useAuth(), {
            wrapper,
        });

        // assert
        expect(UserManager.prototype.signinCallback).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(onSigninCallback).toHaveBeenCalledTimes(1));
    });

    it("should signinResourceOwnerCredentials when asked", async () => {
        // arrange
        const wrapper = createWrapper({ ...settingsStub });

        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        await waitFor(() => expect(result.current.user).toBeUndefined());

        //act
        await act(() => result.current.signinResourceOwnerCredentials({
            username: "username",
            password: "password",
            skipUserInfo: false,
        }));

        // assert
        expect(UserManager.prototype.signinResourceOwnerCredentials).toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

    it("should handle removeUser and call onRemoveUser", async () => {
        // arrange
        const onRemoveUser = jest.fn();

        const wrapper = createWrapper({ ...settingsStub, onRemoveUser });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        // act
        await act(() => result.current.removeUser());

        // assert
        expect(UserManager.prototype.removeUser).toHaveBeenCalled();

        await waitFor(() => expect(onRemoveUser).toHaveBeenCalled());
    });

    it("should handle signoutRedirect and call onSignoutRedirect", async () => {
        // arrange
        const onSignoutRedirect = jest.fn();
        const wrapper = createWrapper({ ...settingsStub, onSignoutRedirect });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        // act
        await act(() => result.current.signoutRedirect());

        // assert
        expect(UserManager.prototype.signoutRedirect).toHaveBeenCalled();

        await waitFor(() => expect(onSignoutRedirect).toHaveBeenCalled());
    });

    it("should handle signoutPopup and call onSignoutPopup", async () => {
        // arrange
        const onSignoutPopup = jest.fn();
        const wrapper = createWrapper({ ...settingsStub, onSignoutPopup });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        // act
        await act(() => result.current.signoutPopup());

        // assert
        expect(UserManager.prototype.signoutPopup).toHaveBeenCalled();

        await waitFor(() => expect(onSignoutPopup).toHaveBeenCalled());
    });

    it("should handle signoutSilent", async () => {
        // arrange
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        // act
        await act(() => result.current.signoutSilent());

        // assert
        expect(UserManager.prototype.signoutSilent).toHaveBeenCalled();
    });

    it("should get the user", async () => {
        const mockGetUser = mocked(
            UserManager.prototype,
        ).getUser.mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(user);
            });
        });

        // arrange
        const wrapper = createWrapper({ ...settingsStub });

        // act
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        // assert
        await waitFor(() =>
            expect(UserManager.prototype.getUser).toHaveBeenCalled(),
        );

        await waitFor(() => expect(result.current.user).toBe(user));

        mockGetUser.mockRestore();
    });

    it("should use a custom UserManager implementation", async () => {
        // arrange
        class CustomUserManager extends UserManager {}
        CustomUserManager.prototype.signinRedirect = jest
            .fn()
            .mockResolvedValue(undefined);

        const wrapper = createWrapper({
            ...settingsStub,
            implementation: CustomUserManager,
        });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        await act(async () => {
            await waitFor(() => {
                expect(result.current.user).toBeUndefined();
            });
        });

        // act
        await act(async () => {
            await result.current.signinRedirect();
        });

        // assert
        expect(UserManager.prototype.signinRedirect).not.toHaveBeenCalled();
        expect(CustomUserManager.prototype.signinRedirect).toHaveBeenCalled();
    });

    it("should allow passing a custom UserManager", async () => {
        // arrange
        const customUserManager = new UserManager({ ...settingsStub });
        customUserManager.signinRedirect = jest
            .fn()
            .mockResolvedValue(undefined);

        const wrapper = createWrapper({
            userManager: customUserManager,
        });

        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        await act(async () => {
            await waitFor(() => {
                expect(result.current.user).toBeUndefined();
            });
        });

        // act
        await act(async () => {
            await result.current.signinRedirect();
        });

        // assert
        expect(UserManager.prototype.signinRedirect).not.toHaveBeenCalled();
        expect(customUserManager.signinRedirect).toHaveBeenCalled();
    });

    it("should throw an error if user manager and custom settings are passed in", async () => {
        // arrange
        const customUserManager = new UserManager({ ...settingsStub });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const wrapper = createWrapper({
            ...settingsStub,
            userManager: customUserManager,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        expect(wrapper).toThrow(TypeError);
    });

    it("should throw when no UserManager implementation exists", async () => {
        // arrange
        const wrapper = createWrapper({
            ...settingsStub,
            implementation: null,
        });

        try {
            renderHook(() => useAuth(), {
                wrapper,
            });
        } catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
    });

    it("should set isLoading to false after initializing", async () => {
        // arrange
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });
        expect(result.current.isLoading).toBe(true);

        // act & assert
        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it("should set isLoading to true during a navigation", async () => {
        // arrange
        let resolve: (value: User) => void;
        const mockSigninPopup = mocked(
            UserManager.prototype,
        ).signinPopup.mockReturnValue(
            new Promise((_resolve) => {
                resolve = _resolve;
            }),
        );
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // act
        void act(() => void result.current.signinPopup());

        // assert
        await waitFor(() => expect(result.current.isLoading).toBe(true));

        // act
        void act(() => resolve({} as User));

        // assert
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        mockSigninPopup.mockRestore();
    });

    it("should set activeNavigator based on the most recent navigation", async () => {
        // arrange
        let resolve: (value: User) => void;
        const mockSigninPopup = mocked(
            UserManager.prototype,
        ).signinPopup.mockReturnValue(
            new Promise((_resolve) => {
                resolve = _resolve;
            }),
        );
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAuth(), {
            wrapper,
        });

        await act(async () => {
            await waitFor(() =>
                expect(result.current.activeNavigator).toBe(undefined),
            );
        });

        // act
        void act(() => void result.current.signinPopup());

        // assert
        await waitFor(() =>
            expect(result.current.activeNavigator).toBe("signinPopup"),
        );

        // act
        void act(() => resolve({} as User));

        // assert
        await waitFor(() =>
            expect(result.current.activeNavigator).toBe(undefined),
        );

        mockSigninPopup.mockRestore();
    });

});
