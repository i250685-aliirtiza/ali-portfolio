import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { z } from "zod";

export class Store {
  constructor(readonly directory: string) {}
  async read<T>(name: string, schema: z.ZodType<T>): Promise<T | null> {
    for (const suffix of ["", ".bak"]) {
      try {
        return schema.parse(
          JSON.parse(
            await readFile(join(this.directory, name + suffix), "utf8"),
          ),
        );
      } catch {
        /* Try last-good backup; never expose errors. */
      }
    }
    return null;
  }
  async write<T>(name: string, value: T, schema: z.ZodType<T>) {
    const parsed = schema.parse(value);
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const target = join(this.directory, name);
    const old = await this.read(name, schema);
    if (old) await this.atomic(target + ".bak", JSON.stringify(old));
    await this.atomic(target, JSON.stringify(parsed));
  }
  private async atomic(path: string, content: string) {
    const temp = `${path}.${randomUUID()}.tmp`;
    const file = await open(temp, "wx", 0o600);
    try {
      await file.writeFile(content);
      await file.sync();
    } finally {
      await file.close();
    }
    try {
      await rename(temp, path);
    } finally {
      await unlink(temp).catch(() => {});
    }
    if (process.platform !== "win32") {
      const directory = await open(this.directory, "r");
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
    }
  }
}
