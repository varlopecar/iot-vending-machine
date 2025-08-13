"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const NoSSRWrapper = ({ children, fallback = null }: NoSSRProps) => {
  return <>{children}</>;
};

export const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
});
