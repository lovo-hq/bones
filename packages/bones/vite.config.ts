import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/index.ts"],
    unbundle: true,
    copy: "src/css",
    dts: {
      tsgo: true,
    },
    exports: {
      customExports: {
        "./css": {
          style: "./dist/css/bones.css",
          default: "./dist/css/bones.css",
        },
      },
    },
    deps: {
      neverBundle: ["react", "react-dom", /^react\//],
    },
  },
  test: {
    environment: "jsdom",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
