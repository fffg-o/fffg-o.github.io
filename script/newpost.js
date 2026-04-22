import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const VALID_COLLECTIONS = ['blog', 'notes'];
const DEFAULT_CATEGORY = {
    blog: {
        zh: '未分类',
        en: 'Uncategorized',
    },
    notes: {
        zh: '随笔',
        en: 'Notes',
    },
};

function printUsage() {
    console.error('Usage:');
    console.error('  node script/newpost.js <blog|notes> <name>');
    console.error('  node script/newpost.js <name>         # defaults to blog');
}

function normalizeInput(args) {
    if (args.length < 1) {
        printUsage();
        process.exit(1);
    }

    if (VALID_COLLECTIONS.includes(args[0])) {
        const collection = args[0];
        const folderPath = args[1];

        if (!folderPath) {
            printUsage();
            process.exit(1);
        }

        return { collection, folderPath };
    }

    return {
        collection: 'blog',
        folderPath: args[0],
    };
}

function ensureSafeFolderPath(folderPath) {
    const normalized = folderPath.trim().replace(/^\/+|\/+$/g, '');

    if (!normalized) {
        console.error('Name cannot be empty.');
        process.exit(1);
    }

    if (normalized.includes('..')) {
        console.error('Name cannot contain "..".');
        process.exit(1);
    }

    return normalized;
}

function buildFrontmatter({ title, pubDate, description, category, slugId }) {
    return `---
title: ${title}
pubDate: ${pubDate}
description: ${description}
category: ${category}
image: ""
draft: true
slugId: ${slugId}
pinTop: 0
---
`;
}

function buildMarkdownContent({ lang, name, collection }) {
    const pubDate = new Date().toISOString().split('T')[0];
    const slugId = `momo/${collection}/${name}`;
    const title = name;
    const description = lang === 'zh-cn' ? '请填写简介' : 'Please add a short description';
    const category = lang === 'zh-cn'
        ? DEFAULT_CATEGORY[collection].zh
        : DEFAULT_CATEGORY[collection].en;
    const heading = lang === 'zh-cn' ? '## 开始写作' : '## Start Writing';
    const body = lang === 'zh-cn'
        ? '在这里编写内容。'
        : 'Write your content here.';

    return `${buildFrontmatter({
        title,
        pubDate,
        description,
        category,
        slugId,
    })}

${heading}

${body}
`;
}

// 定义基础路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const args = process.argv.slice(2);
const input = normalizeInput(args);
const collection = input.collection;
const folderPath = ensureSafeFolderPath(input.folderPath);
const basePath = join(__dirname, '..', 'src', 'content', collection);

// 创建完整路径
const fullPath = join(basePath, folderPath);

// 创建文件夹（如果不存在）
try {
    await mkdir(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
} catch (error) {
    console.error(`Error creating directory: ${error.message}`);
    process.exit(1);
}

const languages = ['zh-cn', 'en'];
const createdFiles = [];
const skippedFiles = [];

for (const lang of languages) {
    const filePath = join(fullPath, `${lang}.md`);
    const content = buildMarkdownContent({
        lang,
        name: folderPath,
        collection,
    });

    try {
        if (existsSync(filePath)) {
            skippedFiles.push(filePath);
        } else {
            await writeFile(filePath, content, 'utf8');
            createdFiles.push(filePath);
        }
    } catch (error) {
        console.error(`Error creating file: ${error.message}`);
        process.exit(1);
    }
}

for (const file of createdFiles) {
    console.log(`Created file: ${file}`);
}

for (const file of skippedFiles) {
    console.warn(`File already exists: ${file}`);
}

console.log(`Successfully initialized ${collection} content at: ${fullPath}`);
