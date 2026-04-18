"use client";

import { useContext } from "react";
import { BonesContext } from "./context.ts";

export function useBones() {
  const ctx = useContext(BonesContext);
  return { isLoading: ctx.forced };
}
