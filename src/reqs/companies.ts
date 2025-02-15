import fetch from "cross-fetch";
import { z } from "zod";

import { ApiError } from "../errors";
import { joinPaths, convertToAbortSignal } from "../utils";
import { BASE_URL, RequestOptions } from "./reqopts";

export const getCompanyDataRequestSchema = z.object({
  companyDomain: z.string(),
  fields: z.array(z.enum(["all", "news"])).default(["all"])
});

export type GetCompanyDataRequest = z.infer<typeof getCompanyDataRequestSchema>;

export const workExperienceLinkedInSchema = z.object({
  location: z.string(),
  employee_description: z.string(),
  company_description: z.string().optional().nullable()
});

export const workExperienceSchema = z.object({
  company: z.string(),
  company_domain: z.string().optional().nullable(),
  role: z.string(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  linkedin_data: workExperienceLinkedInSchema.optional().nullable()
});

export const managementTeamMemberSchema = z.object({
  name: z.string(),
  title: z.string(),
  linkedin_url: z.string().optional().nullable(),
  background: z.string().optional().nullable(),
  board_memberships: z.array(workExperienceSchema),
  work_experiences: z.array(workExperienceSchema)
});

export const productSchema = z.object({
  name: z.string(),
  description: z.string()
});

export const locationSchema = z.object({
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().optional().nullable()
});

export const competitorSchema = z.object({
  name: z.string(),
  domain: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categories: z.array(z.string()),
  location: locationSchema,
  employee_count_range: z.string().optional().nullable()
});

export const companyStatsSchema = z.object({
  employee_count_range: z.string().optional().nullable(),
  employee_count: z.number().optional().nullable(),
  founded_year: z.number().optional().nullable(),
  headquarters: locationSchema,
  total_funding_usd: z.number().optional().nullable()
});

export const fundingRoundSchema = z.object({
  name: z.string(),
  date: z.string().optional().nullable(),
  amount_raised_usd: z.number().optional().nullable(),
  num_investors: z.number().optional().nullable(),
  lead_investors: z.array(z.string())
});

export const newsArticleSchema = z.object({
  source: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  title: z.string(),
  url: z.string().optional().nullable()
});

export const companyDataSchema = z.object({
  company_name: z.string(),
  company_domain: z.string(),
  linkedin_url: z.string().optional().nullable(),
  management_team: z.array(managementTeamMemberSchema),
  description: z.string().optional().nullable(),
  products: z.array(productSchema),
  competitors: z.array(competitorSchema),
  company_stats: companyStatsSchema,
  funding_rounds: z.array(fundingRoundSchema),
  news: z.array(newsArticleSchema)
});

export type CompanyData = z.infer<typeof companyDataSchema>;

export const getCompanyData = async (
  apiKey: string,
  req: GetCompanyDataRequest,
  options?: RequestOptions
): Promise<CompanyData> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const apiUrl = joinPaths([baseUrl, "/v1/companies", req.companyDomain]);
  const queryParams = new URLSearchParams();
  for (const field of req.fields) {
    queryParams.append("fields", field);
  }
  queryParams.set("fields", req.fields.join(","));
  const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey
    },
    signal: convertToAbortSignal(options?.timeout)
  });
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  } else {
    const data = companyDataSchema.parse(await response.json());
    return data;
  }
};
