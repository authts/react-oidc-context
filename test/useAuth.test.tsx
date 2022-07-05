import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../src/useAuth";
import { createWrapper } from "./helpers";

const settingsStub = {
    authority: "authority",
    client_id: "client",
    redirect_uri: "redirect",
};

describe("useAuth", () => {
    it("should provide the auth context", async () => {
        // arrange
        const wrapper = createWrapper({ ...settingsStub });
        const { result } = renderHook(() => useAuth(), { wrapper });

        // assert
        await waitFor(() => expect(result.current).toBeDefined());
    });

    it("should throw with no provider", async () => {
        // act
        try {
            renderHook(() => useAuth());
        } catch (err) {
            //assert
            expect(err).toBeInstanceOf(Error);
            expect((err as Error).message).toContain(
                "AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component.",
            );
        }
    });
});
