export const hasAuthParams = (locationSearch = window.location.search): boolean => {
    const searchParams = new URLSearchParams(locationSearch)

    return Boolean(
        (searchParams.get("code") && searchParams.get("state")) ||
        searchParams.get("error")
    )
}
