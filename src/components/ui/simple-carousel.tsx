import React, { forwardRef } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimpleCarouselProps {
  children: React.ReactNode
  className?: string
}

const SimpleCarousel = forwardRef<HTMLDivElement, SimpleCarouselProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    
  }

SimpleCarousel.displayName = "SimpleCarousel"

const SimpleCarouselContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="overflow-hidden">
      <div
        ref={ref}
        className={cn("flex", className)}
        {...props}
      />
    </div>
  
})
SimpleCarouselContent.displayName = "SimpleCarouselContent"

const SimpleCarouselItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  
})
SimpleCarouselItem.displayName = "SimpleCarouselItem"

export {
  SimpleCarousel,
  SimpleCarouselContent,
  SimpleCarouselItem,
}
