import { copyFile } from "node:fs/promises";

await copyFile("dist/react-index.html", "dist/index.html");
