import { z } from "zod";

export const metadataSchema = z.record(z.string());

export type Metadata = z.infer<typeof metadataSchema>;
