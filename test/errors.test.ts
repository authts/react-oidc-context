import { OAuthError } from "../src"

describe("OAuthError", () => {
    it("should produce an OAuth JS error with error_description properties", async () => {
        const error = new OAuthError(
            "__test_error__",
            "__test_error_description__"
        )
        expect(error.error).toBe("__test_error__")
        expect(error.error_description).toBe("__test_error_description__")
        expect(error.message).toBe("__test_error_description__")
    })

    it("should produce an OAuth JS error with error properties", async () => {
        const error = new OAuthError("__test_error__")
        expect(error.error).toBe("__test_error__")
        expect(error.message).toBe("__test_error__")
    })
})
