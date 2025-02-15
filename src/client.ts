import fetch from "cross-fetch";

import { joinPaths, convertToAbortSignal } from "./utils";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number | AbortSignal;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

type ApiVersion = "v1";

export class HttpClient {
  baseURL: string;
  apiVersion: ApiVersion;

  constructor(
    baseURL: string = "https://api.fixpoint.com",
    apiVersion: ApiVersion = "v1"
  ) {
    this.baseURL = baseURL;
    this.apiVersion = apiVersion;
  }

  #handleRequest = async (
    url: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<unknown>> => {
    const fullURL = joinPaths([this.baseURL, this.apiVersion, url]);

    let body: string | undefined = undefined;
    const reqHeaders: Record<string, string> = options.headers ?? {};
    try {
      if (options.body) {
        body = JSON.stringify(options.body);
        reqHeaders["Content-Type"] = "application/json";
      }
    } catch (error) {
      throw this.#handleError(error);
    }

    const signal = convertToAbortSignal(options.timeout);

    try {
      // Browser-side request using fetch API
      const response = await fetch(fullURL, {
        method: options.method || "GET",
        headers: reqHeaders,
        body,
        signal: signal
      });

      const data = await response.json();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        data,
        status: response.status,
        headers
      };
    } catch (error) {
      throw this.#handleError(error);
    }
  };

  #handleError = (error: unknown): Error => {
    if (!(error instanceof Error)) {
      return new Error("Unknown error");
    } else if (error.name === "AbortError") {
      return new Error("Request timeout");
    }
    return error;
  };

  get = async (
    url: string,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<HttpResponse> => {
    return this.#handleRequest(url, { ...options, method: "GET" });
  };

  post = async (
    url: string,
    data: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<HttpResponse> => {
    return this.#handleRequest(url, { ...options, method: "POST", body: data });
  };

  put = async (
    url: string,
    data: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<HttpResponse> => {
    return this.#handleRequest(url, { ...options, method: "PUT", body: data });
  };

  delete = async (
    url: string,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<HttpResponse> => {
    return this.#handleRequest(url, { ...options, method: "DELETE" });
  };

  patch = async (
    url: string,
    data: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<HttpResponse> => {
    return this.#handleRequest(url, {
      ...options,
      method: "PATCH",
      body: data
    });
  };
}
