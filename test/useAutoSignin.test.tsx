import { createWrapper } from "./helpers";
import { renderHook, waitFor } from "@testing-library/react";
import { UserManager } from "oidc-client-ts";
import { useAutoSignin } from "../src/useAutoSignin";
import type { AuthProviderProps } from "../src";

const settingsStub: AuthProviderProps = {
    authority: "authority",
    client_id: "client",
    redirect_uri: "redirect",
};

describe("useAutoSignin", () => {

    it("should auto sign in using default signinRedirect", async () => {
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAutoSignin(), { wrapper });

        await waitFor(() => expect(result.current).toBeDefined());

        expect(UserManager.prototype.signinRedirect).toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

    it("should auto sign in using provided method signinRedirect", async () => {
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAutoSignin({ signinMethod: "signinRedirect" }), { wrapper });

        await waitFor(() => expect(result.current).toBeDefined());

        expect(UserManager.prototype.signinRedirect).toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

    it("should auto sign in using provided method signinSilent", async () => {
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAutoSignin({ signinMethod: "signinSilent" }), { wrapper });

        await waitFor(() => expect(result.current).toBeDefined());

        expect(UserManager.prototype.signinSilent).toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

    it("should auto sign in using provided method signinPopup", async () => {
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAutoSignin({ signinMethod: "signinPopup" }), { wrapper });

        await waitFor(() => expect(result.current).toBeDefined());

        expect(UserManager.prototype.signinPopup).toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

    it("should auto sign and not call signinRedirect if other method provided", async () => {
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAutoSignin({ signinMethod: "signinPopup" }), { wrapper });

        await waitFor(() => expect(result.current).toBeDefined());

        expect(UserManager.prototype.signinRedirect).not.toHaveBeenCalled();
        expect(UserManager.prototype.getUser).toHaveBeenCalled();
    });

});
