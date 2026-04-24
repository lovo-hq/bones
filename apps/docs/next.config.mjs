import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ["bones"],
};

const withMDX = createMDX();

export default withMDX(config);
