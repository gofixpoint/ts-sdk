import { z } from "zod";

export const webPageCitationSchema = z.object({
  kind: z.literal("web_page_citation"),
  url: z.string()
});

export type WebPageCitation = z.infer<typeof webPageCitationSchema>;

export const textCitationSchema = z.object({
  kind: z.literal("text_citation"),
  text_id: z.string(),
  text_start: z.number(),
  text_end: z.number()
});

export type TextCitation = z.infer<typeof textCitationSchema>;

export const citationSchema = z.union([
  webPageCitationSchema,
  textCitationSchema
]);
export type Citation = z.infer<typeof citationSchema>;
