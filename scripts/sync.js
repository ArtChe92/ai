import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const SRC_BASE = path.join(ROOT, 'ai');
const TOP_LEVEL = new Set(['agents', 'rules', 'skills', 'commands']);
const IGNORE_DIR_NAMES = new Set(['scripts']);

const TARGET_BASE = {
    claude: path.join(ROOT, '.claude'),
    cursor: path.join(ROOT, '.cursor')
};

function getArgValue(name) {
    const argv = process.argv.slice(2);
    const arg = argv.find((a) => a.startsWith(`--${name}=`));
    if (!arg) return null;
    return arg.slice(`--${name}=`.length);
}

function parseTargetArg() {
    const target = getArgValue('target');
    if (Object.keys(TARGET_BASE).some((el) => el === target)) return target;
    return null;
}

function parseWhatArg() {
    const raw = getArgValue('what');
    if (!raw) return null;

    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((p) => p.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+$/, ''));
}

async function statSafe(p) {
    try {
        return await fs.stat(p);
    } catch {
        return null;
    }
}

async function ensureDir(p) {
    await fs.mkdir(p, {recursive: true});
}

async function copyFileOverwrite(srcFile, dstFile) {
    await ensureDir(path.dirname(dstFile));
    await fs.copyFile(srcFile, dstFile);
}

async function copyDirMerge(srcDir, dstDir) {
    const st = await statSafe(srcDir);
    if (!st) return;
    if (!st.isDirectory()) throw new Error(`Expected directory: ${srcDir}`);

    await ensureDir(dstDir);

    const entries = await fs.readdir(srcDir, {withFileTypes: true});
    for (const entry of entries) {
        if (entry.isDirectory() && IGNORE_DIR_NAMES.has(entry.name)) continue;

        const srcPath = path.join(srcDir, entry.name);
        const dstPath = path.join(dstDir, entry.name);

        if (entry.isDirectory()) {
            await copyDirMerge(srcPath, dstPath);
        } else if (entry.isFile()) {
            await copyFileOverwrite(srcPath, dstPath);
        }
    }
}

function validateWhatPath(rel) {
    if (rel.includes('..')) {
        throw new Error(`Invalid --what path (.. is not allowed): ${rel}`);
    }

    const parts = rel.split('/').filter(Boolean);

    if (parts.some((p) => IGNORE_DIR_NAMES.has(p))) {
        throw new Error(`"--what" cannot include ignored dir "scripts": ${rel}`);
    }

    const top = parts[0];
    if (!TOP_LEVEL.has(top)) {
        throw new Error(
            `Invalid --what="${rel}". Must start with one of: agents, rules, skills, commands`
        );
    }

    return {top, parts};
}

async function syncOne(rel, dstBase) {
    const {top, parts} = validateWhatPath(rel);

    const srcPath = path.join(SRC_BASE, ...parts);
    const dstPath = path.join(dstBase, ...parts);

    const st = await statSafe(srcPath);
    if (!st) {
        throw new Error(`Source does not exist: ${path.relative(ROOT, srcPath)}`);
    }

    await ensureDir(path.join(dstBase, top));

    if (st.isDirectory()) {
        await copyDirMerge(srcPath, dstPath);
        console.log(`✅ Copied dir:  ${rel}`);
    } else if (st.isFile()) {
        await copyFileOverwrite(srcPath, dstPath);
        console.log(`✅ Copied file: ${rel}`);
    } else {
        console.log(`⚠️ Skipped (not file/dir): ${rel}`);
    }
}

async function main() {
    const target = parseTargetArg();
    if (!target) {
        console.error('❌ Не указан или неверный target.\n' + 'Используйте claude|cursor');
        process.exit(1);
    }

    const dstBase = TARGET_BASE[target];
    await ensureDir(dstBase);

    const what = parseWhatArg();

    const items = what ?? ['agents', 'rules', 'skills', 'commands'];

    for (const rel of items) {
        await syncOne(rel, dstBase);
    }

    console.log(`🎉 AI sync done -> ${path.relative(ROOT, dstBase)}`);
}

main().catch((e) => {
    console.error('❌ Ошибка:', e?.message ?? e);
    process.exit(1);
});
