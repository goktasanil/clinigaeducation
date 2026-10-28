import { buildEuropeBlog } from "./build-europe-blog.mjs";
import { buildWixArchive } from "./build-wix-archive.mjs";

await buildEuropeBlog();
await buildWixArchive();
