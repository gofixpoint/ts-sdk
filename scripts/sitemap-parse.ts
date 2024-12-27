/**
 * Run via:
 *
 * ```bash
 * FIXPOINT_API_KEY=$(cat ../../.env | grep FIXPOINT_API_KEY | cut -d= -f2) \
 *     pnpm tsx scripts/sitemap-parse.ts
 * ```
 */

import fs from "fs";
import { ApiError } from "../dist/errors";
import { reqs } from "../dist/index";

const LOCAL_BASE_URL = "http://localhost:8000";

const main = async (): Promise<void> => {
  const apiKey: string = process.env.FIXPOINT_API_KEY;
  if (!apiKey) {
    throw new Error("FIXPOINT_API_KEY is not set");
  }
  const opts = { timeout: 200 * 1000, baseUrl: LOCAL_BASE_URL };
  let sitemap: reqs.Sitemap;
  try {
    sitemap = await reqs.createSitemap(apiKey, "https://mintlify.com/", opts);
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(error.message);
      console.log(error.detail);
    } else {
      console.log(error);
    }
    process.exit(1);
  }

  const urls = sitemap.urls.filter(filterUrl);
  writeToFile("urls.json", urls);
  const batchParseReq: reqs.CreateBatchWebpageParseRequest = {
    source: {
      urls: urls
    },
    output_formats: ["markdown", "chunked_markdown"]
  };
  const batchParseRes = await reqs.createBatchWebpageParse(
    apiKey,
    batchParseReq,
    opts
  );
  writeToFile("batch-parse-output.json", batchParseRes);
};

const filterUrl = (url: string): boolean => {
  if (!url.startsWith("https://mintlify.com")) {
    return false;
  }
  if (url.includes("mintlify.com/docs/")) {
    return false;
  }
  // if (url.includes("mintlify.com/customers/")) {
  //   return false;
  // }
  if (url.includes("mintlify.com/blog/")) {
    return false;
  }
  return true;
};

const writeToFile = (filename: string, result: unknown): void => {
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
};

main();
