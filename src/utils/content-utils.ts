import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { i18n } from "astro:config/client";

/**
 * 获取排序后的博客条目
 * @param filter 过滤函数，可选，默认过滤掉生产环境中的草稿文章
 * @param sort 排序函数，可选，默认按发布日期降序排列
 * @returns 排序后的博客条目数组
 */
type LocalizedCollection = 'blog' | 'notes';

export type EntryWithLocaleStatus<C extends LocalizedCollection> = CollectionEntry<C> & {
  isFallback?: boolean;
};

async function hasMarkdownFiles(collectionName: LocalizedCollection): Promise<boolean> {
  const basePath = join(process.cwd(), 'src', 'content', collectionName);

  async function walk(dir: string): Promise<boolean> {
    let entries;

    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return false;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (await walk(join(dir, entry.name))) {
          return true;
        }
      } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
        return true;
      }
    }

    return false;
  }

  return walk(basePath);
}

async function getLocalizedEntrySort<C extends LocalizedCollection>(
  collectionName: C,
  lang?: string,
  filter?: (entry: CollectionEntry<C>) => boolean | undefined,
  sort?: (a: CollectionEntry<C>, b: CollectionEntry<C>) => number
): Promise<EntryWithLocaleStatus<C>[]> {
  if (!(await hasMarkdownFiles(collectionName))) {
    return [];
  }

  const defaultFilter = ({ data }: CollectionEntry<C>) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  };

  const defaultSort = (a: CollectionEntry<C>, b: CollectionEntry<C>) => {
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  };

  const entries = await getCollection(collectionName, filter || defaultFilter);

  const grouped = new Map<string, Record<string, CollectionEntry<C>>>();
  const defaultLanguage = i18n.defaultLocale;

  for (const post of entries) {
    const parts = post.id.split('/');
    const fileName = parts[parts.length - 1];
    const id = parts.slice(0, -1).join('/');
    const language: string = fileName.replace('.md', '');

    if (!grouped.has(id)) {
      grouped.set(id, {});
    }
    grouped.get(id)![language] = post;
  }

  const selectedEntries: EntryWithLocaleStatus<C>[] = [];
  
  for (const [id, translations] of grouped.entries()) {
    let selectedPost: CollectionEntry<C> | undefined;
    let isFallback = false; // 默认为 false
    
    if (lang && lang !== defaultLanguage) {
      if (translations[lang]) {
        selectedPost = translations[lang];
      } else if (translations[defaultLanguage]) {
        // --- 关键修改点：触发回退逻辑 ---
        selectedPost = translations[defaultLanguage];
        isFallback = true; 
      }
    } else {
      if (translations[defaultLanguage]) {
        selectedPost = translations[defaultLanguage];
      }
    }
    
    if (selectedPost) {
      selectedEntries.push({
        ...selectedPost,
        id: id,
        isFallback: isFallback // 将状态注入对象
      });
    }
  }

  return selectedEntries.sort(sort || defaultSort);
}

export type BlogEntryWithLocaleStatus = EntryWithLocaleStatus<'blog'>;
export type NotesEntryWithLocaleStatus = EntryWithLocaleStatus<'notes'>;

export async function getBlogEntrySort(
  lang?: string,
  filter?: (entry: CollectionEntry<'blog'>) => boolean | undefined,
  sort?: (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => number
): Promise<BlogEntryWithLocaleStatus[]> {
  return getLocalizedEntrySort('blog', lang, filter, sort);
}

export async function getNotesEntrySort(
  lang?: string,
  filter?: (entry: CollectionEntry<'notes'>) => boolean | undefined,
  sort?: (a: CollectionEntry<'notes'>, b: CollectionEntry<'notes'>) => number
): Promise<NotesEntryWithLocaleStatus[]> {
  return getLocalizedEntrySort('notes', lang, filter, sort);
}

export async function getSpec(
    lang: string,
    spec: string
) {
    const defaultLanguage = i18n.defaultLocale;
    let collection = await getEntry('spec', `${spec}/${lang}`)
    if(!collection) collection = await getEntry('spec', `${spec}/${defaultLanguage}`);
    return collection;
}
