import { describe, expect, test } from "vite-plus/test";
import { middleware } from "./middleware";
import { NextRequest } from "next/server";

describe("middleware", () => {
  test("sets x-bones-compare header when param is present", () => {
    const req = new NextRequest("http://localhost:3000/pokemon/6?bones-compare=1");
    const res = middleware(req);
    expect(res.headers.get("x-middleware-request-x-bones-compare")).toBe("1");
  });

  test("does not set header when param is absent", () => {
    const req = new NextRequest("http://localhost:3000/pokemon/6");
    const res = middleware(req);
    expect(res.headers.get("x-middleware-request-x-bones-compare")).toBeNull();
  });
});
