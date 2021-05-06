# oidc-client-react

![Release](https://github.com/pamapa/oidc-client-react/workflows/Release/badge.svg)


Lightweight auth library based on oidc-client for React Single Page Applications (SPA) 


## Table of Contents
- [Documentation](#documentation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Influences](#influences)
- [License](#license)


## Documentation
This library acts as a context provider arround the `oidc-client` library.
- [oidc-client](https://github.com/IdentityModel/oidc-client-js/wiki)


## Installation

Using [npm](https://npmjs.org/)

```bash
npm install @pamapa/oidc-client-react
```


## Getting Started

Configure the library by wrapping your application in `AuthProvider`:

```jsx
// src/index.js
import React from "react"
import ReactDOM from "react-dom"
import { AuthProvider } from "@pamapa/oidc-client-react"
import App from "./App"

const oidcConfig = {
  authority: <your authority>,
  client_id: <your client id>,
  redirect_uri: <your redirect uri>,
}

ReactDOM.render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>,
  document.getElementById("app")
)
```

Use the `useAuth` hook in your components to access authentication state (`isLoading`, `isAuthenticated` and `user`) and authentication methods (`signInRedirect`, `signIn` and `signOut`):

```jsx
// src/App.js
import React from "react"
import { useAuth } from "@pamapa/oidc-client-react"

function App() {
  const auth = useAuth()

  if (auth.isLoading) {
    return <div>Loading...</div>
  }
  if (auth.error) {
    return <div>Oops... {error.message}</div>
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        Hello {user.name}{" "}
        <button onClick={auth.signOut}>
          Log out
        </button>
      </div>
    )
  } else {
    return <button onClick={auth.signInRedirect}>Log in</button>
  }
}

export default App
```


### Use with a Class Component

Use the `withAuth` higher order component to add the `auth` property to class components:

```jsx
import React from "react"
import { withAuth } from "@pamapa/oidc-client-react"

class Profile extends React.Component {
  render() {
    // `this.props.auth` has all the same properties as the `useAuth` hook
    const auth = this.props.auth
    return <div>Hello {auth.user.name}</div>
  }
}

export default withAuth(Profile)
```


### Call a protected API

As a child of `AuthProvider` with an access token:

```jsx
import React from "react"
import { useAuth } from "@pamapa/oidc-client-react"

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

As **not** a child of `AuthProvider` (e.g. redux slice) with an access token in `WebStorageStateStore`:
```jsx
import { User } from "oidc-client"

function getOidcUser() {
  const oidcStorage = localStorage.getItem(`oidc.user:<your authority>:<your client id>`)
  if (!oidcStorage) {
    return null
  }

  return User.fromStorageString(oidcStorage)
}

const user = getOidcUser()
const token = user?.access_token
const response = await fetch("https://api.example.com/posts", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```


## Contributing
We appreciate feedback and contribution to this repo!


## Influences
This library is inspired by [oidc-react](https://github.com/bjerkio/oidc-react), which lacks error handling and [auth0-react](https://github.com/auth0/auth0-react), which is focued on auth0.


## License
This project is licensed under the MIT license. See the [LICENSE](https://github.com/pamapa/oidc-client-react/blob/main/LICENSE) file for more info.
