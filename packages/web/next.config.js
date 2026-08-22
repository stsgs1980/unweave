/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  transpilePackages: ["@unweave/core"],
  // Disable Turbopack due to HMR panic bug (Cell no longer exists)
  // turbopack: {
  //   root: resolve(__dirname, "../.."),
  // },
};

export default nextConfig;
