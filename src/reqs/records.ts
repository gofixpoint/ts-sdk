import { z } from "zod";
import { metadataSchema } from "./metadata";
import { citationSchema } from "./citations";

export const sourceTypeEnum = z.enum([
  "website_page",
  "url_crawl",
  "text_file",
  "batch_text_file"
]);

export const aiNotFoundEnum = z.enum(["not_found", "found", "not_applicable"]);

export const editableConfigSchema = z.object({
  is_editable: z.boolean().default(true),
  is_required: z.boolean().default(false),
  human_contents: z.string().nullable().optional()
});

export const researchFieldSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  ai_explanation: z.string().nullable().optional(),
  ai_not_found: aiNotFoundEnum,
  media_type: z.string().nullable().optional(),
  contents: z.any().optional(),
  editable_config: editableConfigSchema,
  citations: z.array(citationSchema)
});

export const createResearchRecordSchema = z.object({
  research_document_id: z.string(),
  source: z.string(),
  source_type: sourceTypeEnum,
  workflow_run_id: z.string(),
  workflow_source_node: z.string().optional(),
  status: z.string().optional(),
  fields: z.array(researchFieldSchema),
  metadata: metadataSchema.optional()
});

export const researchRecordSchema = createResearchRecordSchema.extend({
  id: z.string(),
  org_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  ai_model: z.string().nullable().optional(),
  cost: z.number().nullable().optional()
});

export const researchDocumentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

// Type exports
export type SourceType = z.infer<typeof sourceTypeEnum>;
export type AiNotFound = z.infer<typeof aiNotFoundEnum>;
export type EditableConfig = z.infer<typeof editableConfigSchema>;
export type ResearchField = z.infer<typeof researchFieldSchema>;
export type CreateResearchRecord = z.infer<typeof createResearchRecordSchema>;
export type ResearchRecord = z.infer<typeof researchRecordSchema>;
export type ResearchDocument = z.infer<typeof researchDocumentSchema>;
