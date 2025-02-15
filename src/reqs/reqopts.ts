export const BASE_URL = "https://api.fixpoint.co";

export interface RequestOptions {
  baseUrl?: string;
  timeout?: number | AbortSignal;
}
