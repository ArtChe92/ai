const fs = require("node:fs");
const path = require("node:path");

const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
};

const log = {
  success: (msg) => console.log(`${colors.green("✓")} ${msg}`),
  error: (msg) => console.log(`${colors.red("✗")} ${msg}`),
  info: (msg) => console.log(`${colors.yellow("→")} ${msg}`),
  step: (current, total, msg) =>
    console.log(`${colors.blue(`[${current}/${total}]`)} ${msg}`),
};

const TOP_LEVEL_FOLDERS = ["skills", "rules", "commands", "agents"];
const IGNORE_DIRS = new Set(["node_modules", ".git"]);

const PACKAGE_ROOT = path.join(__dirname, "..");
const AI_SOURCE = path.join(PACKAGE_ROOT, "ai");

function validatePath(p) {
  p = p.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");

  if (p.includes("..")) {
    throw new Error(`Invalid path (.. not allowed): ${p}`);
  }

  const top = p.split("/")[0];
  if (!TOP_LEVEL_FOLDERS.includes(top)) {
    throw new Error(
      `Invalid path: ${p}. Must start with: ${TOP_LEVEL_FOLDERS.join(", ")}`
    );
  }

  if (p.includes("scripts")) {
    throw new Error(`Cannot install 'scripts' folder`);
  }

  return p;
}

function copyDirMerge(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) {
    return { files: 0, dirs: 0 };
  }

  const stat = fs.statSync(srcDir);
  if (!stat.isDirectory()) {
    throw new Error(`Expected directory: ${srcDir}`);
  }

  fs.mkdirSync(dstDir, { recursive: true });

  let files = 0;
  let dirs = 0;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const srcPath = path.join(srcDir, entry.name);
    const dstPath = path.join(dstDir, entry.name);

    if (entry.isDirectory()) {
      const result = copyDirMerge(srcPath, dstPath);
      files += result.files;
      dirs += result.dirs + 1;
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.copyFileSync(srcPath, dstPath);
      files++;
    }
  }

  return { files, dirs };
}

function copyFile(srcFile, dstFile) {
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  fs.copyFileSync(srcFile, dstFile);
}

function copyPath(relPath, srcBase, dstBase) {
  const src = path.join(srcBase, relPath);
  const dst = path.join(dstBase, relPath);

  if (!fs.existsSync(src)) {
    throw new Error(`Source not found: ${relPath}`);
  }

  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    const result = copyDirMerge(src, dst);
    log.success(`Copied ${relPath}/ (${result.files} files)`);
    return result;
  } else {
    copyFile(src, dst);
    log.success(`Copied ${relPath}`);
    return { files: 1, dirs: 0 };
  }
}

function getAvailableCommands(destDir) {
  const commandsDir = path.join(destDir, "commands");
  if (!fs.existsSync(commandsDir)) return [];

  return fs
    .readdirSync(commandsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => "/" + f.replace(".md", ""));
}

async function install(options) {
  const { target, what } = options;

  const destDir = path.join(
    process.cwd(),
    target === "claude" ? ".claude" : ".cursor"
  );

  let items;
  if (what) {
    items = what
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    items = [...TOP_LEVEL_FOLDERS];
  }

  items = items.map(validatePath);

  if (!fs.existsSync(AI_SOURCE)) {
    throw new Error(`AI source folder not found: ${AI_SOURCE}`);
  }

  console.log("");
  log.step(1, 3, "Validating...");

  const existingItems = items.filter((item) => {
    const src = path.join(AI_SOURCE, item);
    if (!fs.existsSync(src)) {
      log.info(`Skipping (not found): ${item}`);
      return false;
    }
    return true;
  });

  if (existingItems.length === 0) {
    throw new Error("No valid paths to install");
  }

  log.step(
    2,
    3,
    `Copying to ${target === "claude" ? ".claude" : ".cursor"}/ (merge mode)...`
  );

  fs.mkdirSync(destDir, { recursive: true });

  let totalFiles = 0;
  const installed = [];

  for (const item of existingItems) {
    try {
      const result = copyPath(item, AI_SOURCE, destDir);
      totalFiles += result.files;
      installed.push(item);
    } catch (err) {
      log.error(`Failed to copy ${item}: ${err.message}`);
    }
  }

  if (installed.length === 0) {
    throw new Error("Nothing was installed");
  }

  log.step(3, 3, "Done!");

  console.log("");
  log.success(
    `AI skills installed to ${target === "claude" ? ".claude" : ".cursor"}/`
  );
  console.log("");

  console.log("Installed:");
  for (const item of installed) {
    const itemPath = path.join(destDir, item);
    if (fs.existsSync(itemPath) && fs.statSync(itemPath).isDirectory()) {
      const count = countFiles(itemPath);
      console.log(`  📁 ${item}/ (${count} files)`);
    } else {
      console.log(`  📄 ${item}`);
    }
  }

  console.log("");
  console.log("Your existing files were preserved (merge mode).");

  if (target === "claude") {
    const commands = getAvailableCommands(destDir);
    if (commands.length > 0) {
      console.log("");
      console.log("Available commands:");
      for (const cmd of commands) {
        console.log(`  ${cmd}`);
      }
    }
  }

  console.log("");
}

/**
 * Count files in directory
 */
function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

module.exports = { install };
