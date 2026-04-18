"use client";

import { createContext } from "react";

export interface BonesContextValue {
  forced: boolean;
}

export const BonesContext = createContext<BonesContextValue>({
  forced: false,
});
