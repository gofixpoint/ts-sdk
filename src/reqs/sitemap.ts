import fetch from "cross-fetch";
import { z } from "zod";

import { ApiError } from "../errors";
import { joinPaths, convertToAbortSignal } from "../utils";
import { webpageSourceSchema, WebpageSource } from "./sources";
import { BASE_URL, RequestOptions } from "./reqopts";

export interface CreateSitemapRequest {
  source: WebpageSource;
}

export const siteMapSchema = z.object({
  source: webpageSourceSchema,
  urls: z.array(z.string())
});

export type Sitemap = z.infer<typeof siteMapSchema>;

export const createSitemap = async (
  url: string,
  apiKey: string,
  options?: RequestOptions
): Promise<Sitemap> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const apiUrl = joinPaths([baseUrl, "/v1/sitemaps"]);
  const req = {
    source: { url }
  };
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey
    },
    body: JSON.stringify(req),
    signal: convertToAbortSignal(options?.timeout)
  });
  // If we get an error status, raise it
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  } else {
    const data = siteMapSchema.parse(await response.json());
    return data;
  }
};
