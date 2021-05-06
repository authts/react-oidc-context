import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { AuthProvider, useAuth } from "../."

const oidcConfig = {
    authority: "<your authority>",
    client_id: "<your client id>",
    redirect_uri: "<your redirect uri>",

    // authorization code flow with proof key for code exchange (PKCE)
    response_type: "code",
    scope: "openid",

    // additional
    automaticSilentRenew: true,
}

function App() {
    const auth = useAuth()

    if (auth.isLoading) {
        return <div>Loading...</div>
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>
    }

    if (auth.isAuthenticated) {
        return (
            <div>
                Hello {auth.user?.profile.sub}{" "}
                <button onClick={auth.signOut}>
                    Log out
                </button>
            </div>
        )
    }

    return <button onClick={auth.signInRedirect}>Log in</button>
}

ReactDOM.render(
    <AuthProvider {...oidcConfig}>
        <App />
    </AuthProvider>,
    document.getElementById("root")
)
