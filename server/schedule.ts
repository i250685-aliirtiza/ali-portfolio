import { z } from "zod";
export const workerStatusSchema = z.object({
  failures: z.number().int().nonnegative(),
  nextAttempt: z.number().nonnegative(),
  result: z.enum(["ok", "failed", "pending-configuration"]),
});
export function retryStatus(
  kind: "github" | "transcript",
  failures: number,
  now: number,
) {
  const base = kind === "github" ? 3600000 : 43200000;
  return workerStatusSchema.parse({
    failures,
    nextAttempt:
      now + Math.min(base * 2 ** Math.min(failures - 1, 6), 172800000),
    result: "failed",
  });
}
