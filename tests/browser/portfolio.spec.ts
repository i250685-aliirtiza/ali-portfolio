import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { emptyAcademics } from "../../shared/contracts";
import { readFileSync } from "node:fs";
import { parseFlexTranscript } from "../../server/flex-parser";

for (const width of [375, 1440])
  test(`populated transcript and in-progress term at ${width}px`, async ({
    page,
  }) => {
    const record = parseFlexTranscript(
      readFileSync(
        new URL("../fixtures/flex-synthetic.html", import.meta.url),
        "utf8",
      ),
    );
    await page.setViewportSize({ width, height: 1000 });
    await page.route("**/api/public/projects", (r) =>
      r.fulfill({ json: { projects: [], lastUpdated: null, stale: true } }),
    );
    await page.route("**/api/public/academics", (r) =>
      r.fulfill({
        json: {
          ...record,
          semesters: record.semesters.map((s, i) => ({ ...s, key: `s${i}` })),
          provenance: "owner-provided",
          lastSuccessfulSync: null,
          recordImportedAt: "2026-10-25T00:00:00Z",
          stale: true,
        },
      }),
    );
    await page.goto("/#academics");
    await expect(
      page.getByText("Owner-provided transcript · live sync pending"),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Synthetic Course 1", exact: true }),
    ).toBeVisible();
    await page.getByLabel("Semester", { exact: true }).selectOption("s2");
    await expect(page.getByText("In progress", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "I · In progress", exact: true }),
    ).toHaveCount(9);
    await expect(page.locator(".semester-heading")).not.toContainText("0.00");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .locator("#academics")
      .screenshot({ path: `test-results/academic-${width}.png` });
  });

for (const width of [375, 768, 1440])
  test(`homepage, navigation and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/api/public/projects", (r) =>
      r.fulfill({ json: { projects: [], lastUpdated: null, stale: true } }),
    );
    await page.route("**/api/public/academics", (r) =>
      r.fulfill({ json: emptyAcademics }),
    );
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByRole("heading", { name: "Ali Irtiza." }),
    ).toBeVisible();
    await expect(
      page.getByText("Self-reported · awaiting transcript sync"),
    ).toBeVisible();
    if (width < 680) {
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(page.getByRole("navigation")).toBeVisible();
    }
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Academics" })
      .click();
    await expect(page).toHaveURL(/#academics$/);
    await page
      .getByRole("button", { name: "Engineering notes" })
      .first()
      .click();
    await expect(
      page.getByText("Authenticated responses are checked before parsing.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "View source" })).toHaveCount(
      3,
    );
    for (const a of await page.getByRole("link", { name: "View source" }).all())
      expect(await a.getAttribute("href")).toMatch(
        /^https:\/\/github.com\/i250685-aliirtiza\//,
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(await page.locator("body").innerText()).not.toMatch(
      /target\s+(?:s?gpa)|projected|comeback|0 awards/i,
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(errors).toEqual([]);
    await page
      .getByRole("button", { name: "Engineering notes" })
      .first()
      .click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
test("semester switching, escaped content and saved provenance with synthetic records", async ({
  page,
}) => {
  await page.route("**/api/public/projects", (r) =>
    r.fulfill({ json: { projects: [], lastUpdated: null, stale: true } }),
  );
  await page.route("**/api/public/academics", (r) =>
    r.fulfill({
      json: {
        cgpa: 2.7,
        provenance: "verified",
        stale: true,
        lastSuccessfulSync: "2026-01-01T00:00:00Z",
        semesters: [
          {
            key: "a",
            label: "Synthetic semester A",
            sgpa: 2.5,
            courses: [
              {
                code: "TEST1",
                title: "<script>window.compromised=true</script>",
                grade: "C+",
              },
            ],
          },
          {
            key: "b",
            label: "Synthetic semester B",
            sgpa: 2.9,
            courses: [
              { code: "TEST2", title: "Synthetic Algorithms", grade: "B" },
            ],
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(page.getByLabel("Semester", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("cell", {
      name: "<script>window.compromised=true</script>",
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => Object.hasOwn(window, "compromised"))).toBe(
    false,
  );
  await page.getByLabel("Semester", { exact: true }).selectOption("b");
  await expect(
    page.getByRole("cell", { name: "Synthetic Algorithms" }),
  ).toBeVisible();
  await expect(
    page.getByText("Saved academic record", { exact: false }),
  ).toBeVisible();
});
test("API outage does not blank the page; menu and skip link work by keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/api/public/**", (r) =>
    r.fulfill({ status: 503, json: { error: "Temporarily unavailable" } }),
  );
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await page.getByRole("button", { name: "Menu" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Work", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  await expect(
    page.getByText("Detailed semester results are not yet synchronized.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Small tools. Real problems." }),
  ).toBeVisible();
});
