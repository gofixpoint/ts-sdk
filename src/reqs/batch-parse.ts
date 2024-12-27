import fetch from "cross-fetch";
import { z } from "zod";

import { ApiError } from "../errors";
import { batchWebpageSourceSchema, webpageSourceSchema } from "./sources";
import { joinPaths, convertToAbortSignal } from "../utils";
import { BASE_URL, RequestOptions } from "./reqopts";

export const createBatchWebpageParseRequestSchema = z.object({
  source: batchWebpageSourceSchema,
  output_formats: z
    .array(z.enum(["markdown", "chunked_markdown"]))
    .default(["markdown"])
});

export type CreateBatchWebpageParseRequest = z.infer<
  typeof createBatchWebpageParseRequestSchema
>;

export const webpageParseResultSchema = z.object({
  source: webpageSourceSchema,
  content: z.string().optional().nullable(),
  content_media_type: z.string().optional().nullable(),
  chunks: z
    .array(
      z.object({
        media_type: z.string(),
        content: z.string()
      })
    )
    .optional()
    .nullable()
});

export const batchWebpageParseResultSchema = z.object({
  results: z.array(webpageParseResultSchema)
});

export type BatchWebpageParseResult = z.infer<
  typeof batchWebpageParseResultSchema
>;

export const createBatchWebpageParse = async (
  req: CreateBatchWebpageParseRequest,
  apiKey: string,
  options?: RequestOptions
): Promise<BatchWebpageParseResult> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const apiUrl = joinPaths([baseUrl, "/v1/parses/batch_webpage_parses"]);
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey
    },
    body: JSON.stringify(req),
    signal: convertToAbortSignal(options?.timeout)
  });
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  } else {
    const data = batchWebpageParseResultSchema.parse(await response.json());
    return data;
  }
};
