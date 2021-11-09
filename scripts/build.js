#!/usr/bin/env node
const { buildSync } = require("esbuild");
const { join } = require("path");

const { dependencies, peerDependencies } = require("../package.json");

const opts = {
    entryPoints: ["src/index.ts"],
    absWorkingDir: join(__dirname, ".."),
    bundle: true,
    sourcemap: true,
    external: Object.keys({ ...dependencies, ...peerDependencies }),
};

try {
    // esm
    buildSync({
        ...opts,
        platform: "neutral",
        outfile: "dist/react-oidc-context.esm.js",
    }); 
    // node
    buildSync({
        ...opts,
        platform: "node",
        outfile: "dist/react-oidc-context.cjs",
    });
} catch (err) {
    // esbuild handles error reporting
    process.exitCode = 1;
}
