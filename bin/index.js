#!/usr/bin/env node
const { execSync } = require("child_process");
const { resolve } = require("path");
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Error: Provide a file or directory path");
  process.exit(1);
}
const absPath = resolve(process.cwd(), inputPath);
const projPath = resolve(__dirname, "..");
execSync(`npm --prefix ${projPath} run fmt -- "${absPath}"`, {
  stdio: "inherit",
});
