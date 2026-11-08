import assert from "node:assert/strict";
import { mkdtemp, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import parser from "@typescript-eslint/parser";
import typography from "@tailwindcss/typography";

const require = createRequire(import.meta.url);

test("TypeScript ESLint's own minimatch preserves the dot-file/default-project boundary", async () => {
  const estreeRequire = createRequire(require.resolve("@typescript-eslint/typescript-estree"));
  const { minimatch } = estreeRequire("minimatch");
  assert.equal(minimatch(".fixture.config.js", "*.config.js", { dot: true }), true);
  assert.equal(minimatch("fixture.other.js", "*.config.js", { dot: true }), false);

  const directory = await mkdtemp(join(tmpdir(), "education-parser-compat-"));
  const files = ["tsconfig.json", "project.ts", ".fixture.config.js", "fixture.other.js"];
  try {
    await writeFile(
      join(directory, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { allowJs: true }, include: ["project.ts"] }),
    );
    await writeFile(join(directory, "project.ts"), "export const count: number = 1;");
    for (const file of files.slice(2))
      await writeFile(join(directory, file), "export const count = 1;");
    const options = {
      tsconfigRootDir: directory,
      projectService: { allowDefaultProject: ["*.config.js"] },
      sourceType: "module",
    };
    const result = parser.parseForESLint(
      await readFile(join(directory, ".fixture.config.js"), "utf8"),
      {
        ...options,
        filePath: join(directory, ".fixture.config.js"),
      },
    );
    assert.equal(result.ast.type, "Program");
    assert.ok(result.services.program);
    assert.throws(
      () =>
        parser.parseForESLint("export const count = 1;", {
          ...options,
          filePath: join(directory, "fixture.other.js"),
        }),
      /not found by the project service|allowDefaultProject/,
    );
  } finally {
    parser.clearCaches();
    for (const file of files) await unlink(join(directory, file)).catch(() => {});
    await rmdir(directory);
  }
});

test("Typography still generates prose selectors, exclusions and trailing pseudo-elements", () => {
  const plugin = typography();
  const components = [];
  const variants = new Map();
  plugin.handler({
    addVariant: (name, selector) => variants.set(name, selector),
    addComponents: (items) => components.push(...items),
    theme: () => plugin.config.theme.typography,
    prefix: (selector) => selector,
  });
  const prose = components.find((item) => item[".prose"])[".prose"];
  const table = Object.keys(prose).find((selector) => selector.startsWith(":where(table)"));
  const codeBefore = Object.keys(prose).find(
    (selector) => selector.startsWith(":where(code)") && selector.endsWith("::before"),
  );
  assert.equal(prose[table].width, "100%");
  assert.ok(codeBefore.includes(':not(:where([class~="not-prose"]'));
  assert.equal(codeBefore.includes(":where(code::before)"), false);
  assert.ok(variants.get("prose-a").includes(":where(a)"));
});
