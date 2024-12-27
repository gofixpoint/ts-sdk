/**
 * Run via:
 *
 * ```bash
 * FIXPOINT_API_KEY=$(cat ../../.env | grep FIXPOINT_API_KEY | cut -d= -f2) \
 *     pnpm tsx scripts/patent-extraction.ts
 * ```
 */

import { ApiError } from "../dist/errors";
import { reqs } from "../dist/index";

const LOCAL_BASE_URL = "http://localhost:8000";

const main = async (): Promise<void> => {
  const apiKey: string = process.env.FIXPOINT_API_KEY;
  if (!apiKey) {
    throw new Error("FIXPOINT_API_KEY is not set");
  }
  const opts = { timeout: 200 * 1000, baseUrl: LOCAL_BASE_URL };

  let resp: reqs.CreatePatentExtractionResponse;
  try {
    resp = await reqs.createPatentExtraction(
      apiKey,
      {
        filters: {
          keywords: ["natural language"],
          after_date: "20240101",
          assignees: ["Google"]
        }
      },
      opts
    );
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(error.message);
      console.log(error.detail);
    } else {
      console.log(error);
    }
    process.exit(1);
  }

  console.log(JSON.stringify(resp, null, 2));
};

main();
