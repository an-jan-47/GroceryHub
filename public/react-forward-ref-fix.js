import React from "react";import { safeForwardRef } from "@/lib/forwardRefWrapper";
/**
 * Single source of truth for React safeForwardRef handling
 * This script ensures safeForwardRef is available before any components try to use it
 */
(function() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Create a global React object if it doesn't exist
  window.React = window.React || {};
  
  // Store original implementation if it exists
  const originalForwardRef = window.safeForwardRef;
  
  // Create a unified safeForwardRef implementation
  const unifiedForwardRef = function(render) {
    // If the original was a function, use it
    if (typeof originalForwardRef === 'function') {
      try {
        return originalForwardRef(render);
      } catch (e) {
        console.warn('Original safeForwardRef failed, using fallback', e);
        // Fall through to fallback if original fails
      }
    }
    
    // Fallback implementation
    return function ForwardRefFallback(props) {
      const { ref, ...rest } = props || {};
      return render(rest, ref);
    };
  };
  
  // Replace safeForwardRef with our implementation
  window.safeForwardRef = unifiedForwardRef;
  
  // Also provide it as a global for direct access
  window.unifiedForwardRef = unifiedForwardRef;
  
  console.log('Unified safeForwardRef implementation initialized');
})();