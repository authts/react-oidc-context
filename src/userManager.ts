import type { UserManager } from "oidc-client-ts";

let userManager: UserManager | undefined;

export const setUserManager = (userManagerToSet: UserManager) => {
    userManager = userManagerToSet;
};

export const getUserManager = () => userManager;