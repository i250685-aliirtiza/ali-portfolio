import { z } from "zod";

export const owner = "i250685-aliirtiza";
export const stamp = z.string().datetime();
const label = z.string().trim().min(1).max(180);
export const courseSchema = z.object({
  code: label,
  title: label,
  grade: z
    .string()
    .regex(/^(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|W|I|S|U|P|NP|IP|NG|-|N\/A)$/),
  credits: z.number().min(0).max(30).optional(),
});
export const semesterSchema = z.object({
  label,
  order: z.number().int().nonnegative(),
  sgpa: z.number().min(0).max(4).nullable(),
  cgpa: z.number().min(0).max(4).optional(),
  status: z.enum(["completed", "in-progress"]).optional(),
  courses: z.array(courseSchema).min(1).max(50),
});
export const transcriptSchema = z
  .object({
    cgpa: z.number().min(0).max(4),
    semesters: z.array(semesterSchema).min(1).max(30),
  })
  .superRefine((v, c) => {
    if (
      new Set(v.semesters.map((s) => s.order)).size !== v.semesters.length ||
      new Set(v.semesters.map((s) => s.label)).size !== v.semesters.length
    )
      c.addIssue({ code: "custom", message: "Duplicate semesters" });
    for (const s of v.semesters)
      if (new Set(s.courses.map((c) => c.code)).size !== s.courses.length)
        c.addIssue({ code: "custom", message: "Duplicate courses" });
  });
export const transcriptCacheSchema = z.object({
  data: transcriptSchema,
  lastSuccessfulSync: stamp,
  source: z.enum(["flex", "owner-capture"]).optional(),
});
export const projectSchema = z.object({
  name: label,
  description: z.string().max(500).nullable(),
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith(`https://github.com/${owner}/`)),
  language: label.nullable(),
  updatedAt: stamp,
});
export const projectsSchema = z.object({
  projects: z.array(projectSchema),
  lastUpdated: stamp.nullable(),
  stale: z.boolean(),
});
export const academicFields = [
  "cgpa",
  "semesterLabel",
  "sgpa",
  "courseCode",
  "courseTitle",
  "grade",
  "credits",
] as const;
export type AcademicField = (typeof academicFields)[number];
export const publicSemesterSchema = z.object({
  key: z.string(),
  label: label.optional(),
  sgpa: z.number().min(0).max(4).nullable().optional(),
  cgpa: z.number().min(0).max(4).optional(),
  status: z.enum(["completed", "in-progress"]).optional(),
  courses: z.array(
    z.object({
      code: label.optional(),
      title: label.optional(),
      grade: label.optional(),
      credits: z.number().optional(),
    }),
  ),
});
export const academicsSchema = z.object({
  cgpa: z.number().min(0).max(4),
  provenance: z.enum(["self-reported", "verified", "owner-provided"]),
  semesters: z.array(publicSemesterSchema),
  lastSuccessfulSync: stamp.nullable(),
  recordImportedAt: stamp.optional(),
  stale: z.boolean(),
});
export type Academics = z.infer<typeof academicsSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type Transcript = z.infer<typeof transcriptSchema>;
export const emptyAcademics: Academics = {
  cgpa: 2.43,
  provenance: "self-reported",
  semesters: [],
  lastSuccessfulSync: null,
  stale: true,
};
