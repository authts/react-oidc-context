import yn from "yn";

const collectCoverage = yn(process.env.CI);

export default {
    preset: "ts-jest",
    clearMocks: true,
    testMatch: ["**/test/**/*.test.tsx"],
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
        url: "https://www.example.com/",
    },
    collectCoverage,
    coverageReporters: collectCoverage ? ["lcov"] : ["lcov", "text"],
};
