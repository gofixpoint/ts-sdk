import { z } from "zod";

class FixpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FixpointError";
  }
}

export const errorSchema = z
  .object({
    detail: z.union([
      z.string(),
      z.array(z.unknown()),
      z
        .object({
          message: z.string().optional().default(""),
          org_id: z.string().optional(),
          workflow_id: z.string().optional(),
          run_id: z.string().optional(),
          run_attempt_id: z.string().optional(),
          trace_id: z.string().optional()
        })
        .passthrough()
    ])
  })
  .passthrough();

export class ApiError extends FixpointError {
  message: string;
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.message = message;
    this.status = status;
    this.detail = detail;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let detail: unknown = {};
    const body = await response.text();
    let message: string = "";
    try {
      const js = await JSON.parse(body);
      const parsed = errorSchema.safeParse(js);
      if (parsed.success) {
        if (typeof parsed.data.detail === "string") {
          message = parsed.data.detail;
          detail = { message: message };
        } else if (Array.isArray(parsed.data.detail)) {
          detail = parsed.data.detail;
          message = body;
        } else {
          detail = parsed.data.detail;
          message = parsed.data.detail.message;
        }
      } else {
        message = body;
      }
    } catch (error) {
      console.error("Unexpected error parsing error response");
      console.error(error);
      message = body;
    }
    return new ApiError(message, response.status, detail);
  }
}
