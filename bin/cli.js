#!/usr/bin/env node

const { install } = require("../src/install.js");

const args = process.argv.slice(2);

const options = {
  target: null,
  what: null,
  help: false,
};

for (const arg of args) {
  if (arg === "--help" || arg === "-h") {
    options.help = true;
  } else if (arg.startsWith("--target=")) {
    options.target = arg.slice("--target=".length);
  } else if (arg.startsWith("--what=")) {
    options.what = arg.slice("--what=".length);
  } else if (arg === "claude" || arg === "cursor") {
    options.target = arg;
  }
}

if (options.help) {
  console.log(`
AI Skills Installer

Usage:
  npx @artche/ai <target> [options]
  ai <target> [options]

Targets:
  claude    Install to .claude/
  cursor    Install to .cursor/

Options:
  --what=<path>    Install specific folders (comma-separated)
  --help, -h       Show this help

Examples:
  npx @artche/ai claude                      # Install everything
  npx @artche/ai cursor                      # Install for Cursor
  npx @artche/ai claude --what=skills        # Only skills/
  npx @artche/ai claude --what=skills,rules  # skills/ and rules/

Available paths for --what:
  skills            All skills
  skills/<name>     Specific skill
  commands          All commands
  commands/<name>   Specific command
  rules             All rules
  rules/<name>      Specific rule
  agents            All agents
  agents/<name>     Specific agent
`);
  process.exit(0);
}

if (options.target !== "claude" && options.target !== "cursor") {
  console.error(`❌ Invalid target: ${options.target}`);
  console.error("Available targets: claude, cursor");
  process.exit(1);
}

install(options).catch((err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
