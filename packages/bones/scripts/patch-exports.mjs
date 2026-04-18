import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
console.log("Before patch:", JSON.stringify(pkg.exports));
pkg.exports["./css"] = "./dist/css/bones.css";
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
const verify = JSON.parse(readFileSync("package.json", "utf8"));
console.log("After patch:", JSON.stringify(verify.exports));
