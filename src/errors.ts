/**
 * The OAuth2 error comes from the authorization server as query parameters when redirecting into the
 * application callback. It will have at least an `error` property which will be the error code. And possibly
 * an `error_description` property
 *
 * See: https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.6
 */

export class OAuthError extends Error {
    constructor(public error: string, public error_description?: string) {
        super(error_description || error)
    }
}
