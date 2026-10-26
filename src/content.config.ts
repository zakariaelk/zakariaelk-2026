import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const facts = z.union([z.string(), z.array(z.string())]).optional();

const projectSchema = ({ image }: SchemaContext) =>
    z.object({
      title: z.string(),
      client: z.string(),
      headline: z.string(),
      // Case page top (layout sketch v4): the intro under the hero, the facts
      lede: z.array(z.string()).default([]),
      // case facts: one line, or a list (one item a line); team items can be "Name – role" or { name, role, url }
      deliverables: facts,
      summary: z.string(),
      intro: z.string(),
      // Show the intro under the title on the case study page (it still feeds the home card)
      showIntro: z.boolean().default(true),
      // Short line after the project name, e.g. "a safety alert app for humanitarian workers"
      tagline: z.string().optional(),
      projectType: z.string().optional(),
      // One-line "what I did" for the featured card on the home page (next design)
      statement: z.string().optional(),
      // Featured card label: organisation (bold) – project, e.g. "International NGO Safety Organisation – Alert mobile app"
      org: z.string().optional(),
      projectName: z.string().optional(),
      sector: z.string().optional(),
      role: facts,
      duration: facts,
      team: z.union([z.string(), z.array(z.union([z.string(), z.object({ name: z.string(), role: z.string().optional(), url: z.string().optional() })]))]).optional(),
      year: z.string(),
      link: z.string().optional(),
      cover: image(),
      order: z.number().default(99),
      featured: z.boolean().default(false),
      // Skim layer: one sentence each, shown on cards and at the top of the case study
      tier: z.enum(['case', 'earlier']).default('case'),
      // Page template for /work/<slug>/: the WordPress-port layout or the story layout
      layout: z.enum(['classic', 'story']).default('classic'),
      problem: z.string().optional(),
      did: z.string().optional(),
      result: z.string().optional(),
      hard: z.string().optional(),
      // Classic (zakariaelk.com) version: hover previews on the home list, grouped side menu
      previews: z.array(image()).default([]),
      featuredVideo: z.string().optional(),
      menu: z.array(z.object({
        group: z.string().default(''),
        items: z.array(z.object({ label: z.string(), heading: z.string() })),
      })).default([]),
    });

const projects = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/projects' }),
  schema: projectSchema,
});

// Drafts and alternative versions of case studies, not listed anywhere (e.g. /lab/inso-app/)
const lab = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/lab' }),
  schema: projectSchema,
});

const timeline = z.array(z.object({ name: z.string(), role: z.string(), years: z.string() })).default([]);

const about = defineCollection({
  loader: glob({ pattern: 'index.mdoc', base: './src/content/pages/about' }),
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    experience: timeline,
    education: timeline,
    languages: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, lab, about };
