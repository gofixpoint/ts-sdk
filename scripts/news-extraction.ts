/**
 * Run with pnpm via:
 *
 * ```bash
 * FIXPOINT_API_KEY=$(cat .env | grep FIXPOINT_API_KEY | cut -d= -f2) \
 *     pnpm tsx scripts/news-extraction.ts
 * ```
 */

import fs from "fs";
import { ApiError } from "../dist/errors";
import { reqs } from "../dist/index";

const main = async (): Promise<void> => {
  const apiKey: string = process.env.FIXPOINT_API_KEY;
  if (!apiKey) {
    throw new Error("FIXPOINT_API_KEY is not set");
  }

  ////
  // Get news for a company
  ////

  let companyData: reqs.CompanyData;
  try {
    companyData = await reqs.getCompanyData(apiKey, {
      companyDomain: "anthropic.com",
      fields: ["news"]
    });
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(error.message);
      console.log(error.detail);
    } else {
      console.log(error);
    }
    process.exit(1);
  }

  ////
  // Batch parse the news articles to extract markdown
  ////

  const filteredNews = companyData.news.filter((news) => {
    // Only include news with a truthy URL
    return !!news.url;
  });
  const newsUrls = filteredNews
    .map((news) => news.url)
    .filter((url): url is string => url !== undefined);

  const batchParseReq: reqs.CreateBatchWebpageParseJobRequest = {
    source: {
      urls: newsUrls
    }
  };

  const batchParseRes = await reqs.createBatchWebpageParseJob(
    apiKey,
    batchParseReq
  );

  console.log(batchParseRes);

  let isDone = false;
  let jobStatus: reqs.BatchWebpageParseJobStatus;
  while (!isDone) {
    jobStatus = await reqs.getBatchWebpageParseJobStatus(
      apiKey,
      batchParseRes.id
    );
    console.log(jobStatus.status);
    console.log(`Number of news articles parsed: ${jobStatus.completed}`);
    console.log(`Number of news articles pending: ${jobStatus.pending}`);
    console.log(`Number of news articles failed: ${jobStatus.failed}`);
    if (jobStatus.status === "completed" || jobStatus.status === "failed") {
      isDone = true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  writeToFile("/tmp/batch-parse-job.json", jobStatus);
};

const writeToFile = (filename: string, result: unknown): void => {
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
};

main();
