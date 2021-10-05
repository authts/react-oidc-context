# react-oidc-context

[![Stable Release](https://img.shields.io/npm/v/react-oidc-context.svg)](https://npm.im/react-oidc-context)
![Pipeline](https://github.com/authts/oidc-client-react/workflows/Release/badge.svg)


Lightweight auth library using the [oidc-client](https://github.com/IdentityModel/oidc-client-js) library for React single page applications (SPA).
Support for [hooks](https://reactjs.org/docs/hooks-intro.html) and [higher-order components (HOC)](https://reactjs.org/docs/higher-order-components.html).


## Table of Contents
- [Documentation](#documentation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Influences](#influences)
- [License](#license)


## Documentation
This library implements an auth context provider by making use of the `oidc-client` library. Its configuration is
tight coupled to that library.

- [oidc-client](https://github.com/IdentityModel/oidc-client-js/wiki)

The User and UserManager is hold in this context, which is accessible from the React application. Additionally it intercepts
the auth redirects by looking at the query/fragment parameters and acts accordingly. You still need to setup a redirect uri,
which must point to your application, but you do not need to create that route.


## Installation

Using [npm](https://npmjs.org/)

```bash
npm install react-oidc-context
```


## Getting Started

Configure the library by wrapping your application in `AuthProvider`:

```jsx
// src/index.jsx
import React from "react"
import ReactDOM from "react-dom"
import { AuthProvider } from "react-oidc-context"
import App from "./App"

const oidcConfig = {
    authority: <your authority>,
    client_id: <your client id>,
    redirect_uri: <your redirect uri>,
    ...
}

ReactDOM.render(
    <AuthProvider {...oidcConfig}>
        <App />
    </AuthProvider>,
    document.getElementById("app")
)
```

Use the `useAuth` hook in your components to access authentication state (`isLoading`, `isAuthenticated` and `user`) and
authentication methods (`signinRedirect`, `removeUser` and `signOutRedirect`):

```jsx
// src/App.jsx
import React from "react"
import { useAuth } from "react-oidc-context"

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
                <button onClick={auth.removeUser}>
                    Log out
                </button>
            </div>
        )
    }

    return <button onClick={auth.signinRedirect}>Log in</button>
}

export default App
```


### Use with a Class Component

Use the `withAuth` higher-order component to add the `auth` property to class components:

```jsx
// src/Profile.jsx
import React from "react"
import { withAuth } from "react-oidc-context"

class Profile extends React.Component {
    render() {
        // `this.props.auth` has all the same properties as the `useAuth` hook
        const auth = this.props.auth
        return <div>Hello {auth.user?.profile.sub}</div>
    }
}

export default withAuth(Profile)
```


### Call a protected API

As a child of `AuthProvider` with a user containing an access token:

```jsx
// src/Posts.jsx
import React from "react"
import { useAuth } from "react-oidc-context"

const Posts = () => {
    const auth = useAuth()
    const [posts, setPosts] = useState(null)

    React.useEffect(() => {
        (async () => {
            try {
                const token = auth.user?.access_token
                const response = await fetch("https://api.example.com/posts", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                setPosts(await response.json())
            } catch (e) {
                console.error(e)
            }
        })()
    }, [auth])

    if (!posts) {
        return <div>Loading...</div>
    }

    return (
        <ul>
            {posts.map((post, index) => {
                return <li key={index}>{post}</li>
            })}
        </ul>
    )
}

export default Posts
```

As **not** a child of `AuthProvider` (e.g. redux slice) when using local storage (`WebStorageStateStore`) for the user
containing an access token:
```jsx
// src/slice.js
import { User } from "oidc-client"

function getUser() {
    const oidcStorage = localStorage.getItem(`oidc.user:<your authority>:<your client id>`)
    if (!oidcStorage) {
        return null
    }

    return User.fromStorageString(oidcStorage)
}

export const getPosts = createAsyncThunk(
    "store/getPosts",
    async () => {
        const user = getUser()
        const token = user?.access_token
        return fetch("https://api.example.com/posts", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    },
    ...
)
```


## Contributing
We appreciate feedback and contribution to this repo!


## Influences
This library is inspired by [oidc-react](https://github.com/bjerkio/oidc-react), which lacks error handling and [auth0-react](https://github.com/auth0/auth0-react), which is focused on auth0.


## License
This project is licensed under the MIT license. See the [LICENSE](https://github.com/authts/oidc-client-react/blob/main/LICENSE) file for more info.
