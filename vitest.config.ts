import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Large journal/locale imports should not compete with one worker per CPU
    // on high-core developer hosts; retain the normal per-test timeout.
    maxWorkers: 4,
  },
});
