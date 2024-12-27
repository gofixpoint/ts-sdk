export const BASE_URL = "https://api.fixpoint.com";

export interface RequestOptions {
  baseUrl?: string;
  timeout?: number | AbortSignal;
}
