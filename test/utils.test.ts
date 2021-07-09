import { hasAuthParams, loginError } from "../src/utils"
import { OAuthError } from "../src/errors"

describe("utils hasAuthParams", () => {
    it("should not recognise only the code param", async () => {
        [
            "?code=1",
            "?foo=1&code=2",
            "?code=1&foo=2"
        ].forEach((search) => expect(hasAuthParams(search)).toBeFalsy())
    })

    it("should recognise the code and state param", async () => {
        [
            "?code=1&state=2",
            "?foo=1&state=2&code=3",
            "?code=1&foo=2&state=3",
            "?state=1&code=2&foo=3",
        ].forEach((search) => expect(hasAuthParams(search)).toBeTruthy())
    })

    it("should recognise the error and state param", async () => {
        [
            "?error=1&state=2",
            "?foo=1&state=2&error=3",
            "?error=1&foo=2&state=3",
            "?state=1&error=2&foo=3",
        ].forEach((search) => expect(hasAuthParams(search)).toBeTruthy())
    })

    it("should ignore the error param without state param", async () => {
        [
            "?error=1",
            "?foo=1&error=2",
            "?error=1&foo=2"
        ].forEach((search) => expect(hasAuthParams(search)).toBeFalsy())
    })

    it("should ignore invalid params", async () => {
        [
            "",
            "?",
            "?foo=1",
            "?code=&foo=2",
            "?error="
        ].forEach((search) => expect(hasAuthParams(search)).toBeFalsy())
    })
})

describe("utils normalizeErrorFn", () => {
    it("should return the original error", async () => {
        const error = new Error("__test_error__")
        expect(loginError(error)).toBe(error)
    })

    it("should convert OAuth error data to an OAuth JS error", async () => {
        // ErrorResponse from "oidc-client"
        const error = {
            error: "__test_error__",
            error_description: "__test_error_description__",
        }
        expect(() => {
            throw loginError(error)
        }).toThrow(new OAuthError(error.error, error.error_description))
    })

    it("should convert a none JS error to a JS error", async () => {
        const error = new ProgressEvent("error")
        expect(() => {
            throw loginError(error as unknown as Error);
        }).toThrowError("Login failed");
    })
})
