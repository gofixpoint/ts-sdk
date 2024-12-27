import { z } from "zod";

export const webpageSourceSchema = z.object({
  kind: z.literal("web_page").default("web_page"),
  url: z.string()
});

export type WebpageSource = z.infer<typeof webpageSourceSchema>;

export const batchWebpageSourceSchema = z.object({
  kind: z.literal("batch_web_page").optional(),
  urls: z.array(z.string())
});

export type BatchWebpageSource = z.infer<typeof batchWebpageSourceSchema>;
