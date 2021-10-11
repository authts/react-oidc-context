module.exports = {
    preset: "ts-jest",
    clearMocks: true,
    testMatch: ["**/test/**/*.test.tsx"],
    testEnvironment: "jsdom",
    testURL: "https://www.example.com/",
    globals: {
        "ts-jest": {
            // skip ts-jest type checking, incremental compilation with tsc is much faster
            isolatedModules: true
        },
    },
};
