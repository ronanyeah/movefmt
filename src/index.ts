import prettier from "prettier";
import { readFileSync, writeFileSync, statSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";

async function formatFile(filePath: string) {
  const content = readFileSync(filePath, "utf8");
  const formatted = await prettier.format(content, {
    filepath: filePath,
    useModuleLabel: true,
    plugins: ["@mysten/prettier-plugin-move"],
  });
  if (content !== formatted) {
    writeFileSync(filePath, formatted);
    console.log(`✅ Formatted: ${filePath}`);
  } else {
    console.log(`Unchanged: ${filePath}`);
  }
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: movefmt <file|directory>");
    process.exit(1);
  }

  const absPath = resolve(inputPath);
  const stat = statSync(absPath);

  if (stat.isFile()) {
    await formatFile(absPath);
  } else if (stat.isDirectory()) {
    const files = await glob("**/*.move", { cwd: absPath, absolute: true });
    if (files.length === 0) {
      console.log("No .move files found");
      return;
    }
    await Promise.all(files.map(formatFile));
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
