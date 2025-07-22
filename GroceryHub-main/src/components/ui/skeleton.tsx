
import React from "react";
import { createRefForwarder } from "@/lib/createRefForwarder";

import { cn } from "@/lib/utils"

const Skeleton = createRefForwarder<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
