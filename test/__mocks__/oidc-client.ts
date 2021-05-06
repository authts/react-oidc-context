const clearStaleState = jest.fn()
const getUser = jest.fn()
const storeUser = jest.fn()
const removeUser = jest.fn()
const signinPopup = jest.fn()
const signinPopupCallback = jest.fn()
const signinSilent = jest.fn()
const signinSilentCallback = jest.fn()
const signinRedirect = jest.fn()
const signinRedirectCallback = jest.fn()
const signoutRedirect = jest.fn()
const signoutRedirectCallback = jest.fn()
const signoutPopup = jest.fn()
const signoutPopupCallback = jest.fn()
const signinCallback = jest.fn()
const signoutCallback = jest.fn()
const querySessionStatus = jest.fn()
const revokeAccessToken = jest.fn()
const startSilentRenew = jest.fn()
const stopSilentRenew = jest.fn()

const events = {
    load: jest.fn(),
    unload: jest.fn(),

    addUserLoaded: jest.fn(),
    removeUserLoaded: jest.fn(),

    addUserUnloaded: jest.fn(),
    removeUserUnloaded: jest.fn(),

    addSilentRenewError: jest.fn(),
    removeSilentRenewError: jest.fn(),

    addUserSignedIn: jest.fn(),
    removeUserSignedIn: jest.fn(),

    addUserSignedOut: jest.fn(),
    removeUserSignedOut: jest.fn(),

    addUserSessionChanged: jest.fn(),
    removeUserSessionChanged: jest.fn(),
}

export const UserManager = jest.fn(() => {
    return {
        clearStaleState,
        getUser,
        storeUser,
        removeUser,
        signinPopup,
        signinPopupCallback,
        signinSilent,
        signinSilentCallback,
        signinRedirect,
        signinRedirectCallback,
        signoutRedirect,
        signoutRedirectCallback,
        signoutPopup,
        signoutPopupCallback,
        signinCallback,
        signoutCallback,
        querySessionStatus,
        revokeAccessToken,
        startSilentRenew,
        stopSilentRenew,

        events,
    }
})
