import prettier from "prettier";
import { readFileSync, writeFileSync, statSync } from "fs";
import { resolve, extname } from "path";
import { glob } from "glob";
import { program } from "commander";

program
  .option("-v, --verbose", "enable verbose logging")
  .option("-f, --force", "don't ignore sui build folder")
  .argument("<path>", "target file|directory path")
  .parse(process.argv);

const [inputPath] = program.args;

const options = program.opts();

const verboseOpt = Boolean(options.verbose);
const forceOpt = Boolean(options.force);

const pluginPath = resolve(
  import.meta.dirname,
  "../node_modules/@mysten/prettier-plugin-move/out/index.js"
);

async function formatFile(filePath: string) {
  const pattern = /\/build\/.*\/sources\/|\/build\/.*\/sources\/dependencies\//;
  if (!forceOpt && pattern.test(filePath)) {
    if (verboseOpt) {
      console.warn("Ignoring:", filePath);
    }
    return;
  }

  const content = readFileSync(filePath, "utf8");
  const formatted = await prettier.format(content, {
    filepath: filePath,
    useModuleLabel: true,
    plugins: [pluginPath],
  });
  if (content !== formatted) {
    writeFileSync(filePath, formatted);
    console.log("✅", "Formatted:", filePath);
  } else {
    console.log(`Unchanged: ${filePath}`);
  }
}

async function main() {
  const absPath = resolve(inputPath);
  const stat = statSync(absPath);
  console.log("🛠️", absPath);

  if (stat.isFile()) {
    const extension = extname(absPath);
    if (extension !== ".move") {
      return console.warn("⚠️", "Not a .move file");
    }
    await formatFile(absPath);
  } else if (stat.isDirectory()) {
    const files = await glob("**/*.move", { cwd: absPath, absolute: true });
    if (files.length === 0) {
      console.warn("⚠️", "No .move files found");
      return;
    }
    await Promise.all(files.map(formatFile));
  }
}

main().catch((error) => {
  console.error("❗", "Unexpected error:", error);
  process.exit(1);
});
