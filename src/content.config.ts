import { defineCollection, z } from 'astro:content'
import { glob } from "astro/loaders";

const postSchema = z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean().optional().default(false),
    description: z.string().optional().default(''),
    image: z.string().optional().default(''),
    slugId: z.string(),
    category: z.string().optional(),
    pinTop: z.number().optional().default(0),
});

const blogCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/blog" }),
    schema: postSchema,
})

const notesCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/notes" }),
    schema: postSchema,
})

const specCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/spec" }),
})
export const collections = {
    blog: blogCollection,
    notes: notesCollection,
    spec: specCollection,
}
