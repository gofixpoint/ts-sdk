import fetch from "cross-fetch";
import { z } from "zod";

import { ApiError } from "../errors";
import { joinPaths, convertToAbortSignal } from "../utils";
import { batchWebpageSourceSchema } from "./sources";
import { BASE_URL, RequestOptions } from "./reqopts";
import { webpageParseResultSchema } from "./batch-parse";

export const createBatchWebpageParseJobRequestSchema = z.object({
  source: batchWebpageSourceSchema
});

export type CreateBatchWebpageParseJobRequest = z.infer<
  typeof createBatchWebpageParseJobRequestSchema
>;

export const batchWebpageParseJobSchema = z.object({
  id: z.string()
});

export type BatchWebpageParseJob = z.infer<typeof batchWebpageParseJobSchema>;

export const batchWebpageParseJobStatusSchema = z.object({
  job_id: z.string(),
  results: z.array(webpageParseResultSchema),
  status: z.enum(["running", "completed", "failed"]),
  completed: z.number(),
  failed: z.number(),
  pending: z.number()
});

export type BatchWebpageParseJobStatus = z.infer<
  typeof batchWebpageParseJobStatusSchema
>;

export const createBatchWebpageParseJob = async (
  apiKey: string,
  req: CreateBatchWebpageParseJobRequest,
  options?: RequestOptions
): Promise<BatchWebpageParseJob> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const apiUrl = joinPaths([baseUrl, "/v1/parses/batch_webpage_parse_jobs"]);
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
    const data = batchWebpageParseJobSchema.parse(await response.json());
    return data;
  }
};

export const getBatchWebpageParseJobStatus = async (
  apiKey: string,
  jobId: string,
  options?: RequestOptions
): Promise<BatchWebpageParseJobStatus> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const apiUrl = joinPaths([
    baseUrl,
    `/v1/parses/batch_webpage_parse_jobs/${jobId}/status`
  ]);
  const response = await fetch(apiUrl, {
    headers: {
      "X-API-Key": apiKey
    },
    signal: convertToAbortSignal(options?.timeout)
  });
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  } else {
    const data = batchWebpageParseJobStatusSchema.parse(await response.json());
    return data;
  }
};
