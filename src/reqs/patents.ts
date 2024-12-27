import fetch from "cross-fetch";
import { z } from "zod";

import { ApiError } from "../errors";
import { joinPaths, convertToAbortSignal } from "../utils";
import { BASE_URL, RequestOptions } from "./reqopts";
import { citationSchema } from "./citations";
import { researchRecordSchema } from "./records";

export const patentExtractionFilterSchema = z.object({
  keywords: z.array(z.string()).optional(),
  after_date: z.string().optional(),
  assignees: z.array(z.string()).optional()
});

export const createPatentExtractionRequestSchema = z.object({
  run_id: z.string().nullable().optional(),
  questions: z.array(z.string()).optional(),
  filters: patentExtractionFilterSchema.optional()
});

export type CreatePatentExtractionRequest = z.infer<
  typeof createPatentExtractionRequestSchema
>;

export type PatentExtractionFilter = z.infer<
  typeof patentExtractionFilterSchema
>;

export const patentInfoSchema = z.object({
  patent_number: z.string(),
  inventors: z.string(),
  assignees: z.string(),
  filing_date: z.string(),
  publication_date: z.string(),
  title: z.string(),
  summary: z.string()
});

export const patentExtractionSchema = z.object({
  patent_info: patentInfoSchema,
  result_record: researchRecordSchema.nullable().optional(),
  citations: z.array(citationSchema)
});

export type PatentExtraction = z.infer<typeof patentExtractionSchema>;

export const createPatentExtractionResponseSchema = z.object({
  patent_extractions: z.array(patentExtractionSchema)
});

export type CreatePatentExtractionResponse = z.infer<
  typeof createPatentExtractionResponseSchema
>;

export const createPatentExtraction = async (
  apiKey: string,
  req: CreatePatentExtractionRequest,
  options?: RequestOptions
): Promise<CreatePatentExtractionResponse> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const apiUrl = joinPaths([baseUrl, "/v1/extractions/patent_extractions"]);
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
    const data = createPatentExtractionResponseSchema.parse(
      await response.json()
    );
    return data;
  }
};
