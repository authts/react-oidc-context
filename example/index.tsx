import * as React from "react";
import * as ReactDOM from "react-dom";

import { AuthProvider, useAuth } from "../.";

const oidcConfig = {
    authority: "<your authority>",
    client_id: "<your client id>",
    redirect_uri: "<your redirect uri>",
};

function App() {
    const auth = useAuth();

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <div>
                Hello {auth.user?.profile.sub}{" "}
                <button onClick={() => auth.removeUser()}>
                    Log out
                </button>
            </div>
        );
    }

    return <button onClick={() => auth.signinRedirect()}>Log in</button>;
}

ReactDOM.render(
    <AuthProvider {...oidcConfig}>
        <App />
    </AuthProvider>,
    document.getElementById("root")
);
