import React from "react";

import { createRoot } from "react-dom/client";

import { AuthProvider, useAuth } from "../src";

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
        return <div>Oops... {auth.error.source} caused {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <div>
                Hello {auth.user?.profile.sub}{" "}
                <button onClick={() => void auth.removeUser()}>
                    Log out
                </button>
            </div>
        );
    }

    return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

root.render(
    <AuthProvider {...oidcConfig}>
        <App />
    </AuthProvider>,
);
