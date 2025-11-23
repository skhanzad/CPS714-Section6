const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom", // keep this since you're testing React + TS
  transform: {
    ...tsJestTransformCfg,
  },
};
