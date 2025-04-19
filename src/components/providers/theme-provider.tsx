"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// import type { ThemeProviderProps } from "next-themes/dist/types"; // 不要

// ThemeProviderProps を直接使わず、NextThemesProvider の Props を継承する
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 