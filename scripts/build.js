#!/usr/bin/env node
const { buildSync } = require("esbuild");
const { join } = require("path");

const { dependencies, peerDependencies } = require("../package.json");

const opts = {
    entryPoints: ["src/index.ts"],
    absWorkingDir: join(__dirname, ".."),
    bundle: true,
    external: Object.keys({ ...dependencies, ...peerDependencies }),
};

try {
    buildSync({
        ...opts,
        platform: "neutral",
        outfile: "dist/react-oidc-context.mjs",
    });
    buildSync({
        ...opts,
        platform: "node",
        outfile: "dist/react-oidc-context.cjs",
    });
} catch (err) {
    // esbuild handles error reporting
    process.exitCode = 1;
}
