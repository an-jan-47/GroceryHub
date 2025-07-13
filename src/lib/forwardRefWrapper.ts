import React from "react";

/**
 * A unified wrapper for forwardRef that works consistently
 * across different environments and initialization states
 */
export function createRefForwarder<T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactElement | null) {
  // First try the global React instance
  const ReactInstance = typeof window !== 'undefined' ? (window.React || React) : React;
  
  // Try React.forwardRef first
  if (ReactInstance && typeof ReactInstance.forwardRef === 'function') {
    try {
      return ReactInstance.forwardRef(render);
    } catch (e) {
      console.warn('React.forwardRef failed, using fallback');
    }
  }
  
  // Try window.unifiedForwardRef if available
  if (typeof window !== 'undefined' && window.unifiedForwardRef) {
    try {
      return window.unifiedForwardRef(render);
    } catch (e) {
      console.warn('window.unifiedForwardRef failed, using fallback');
    }
  }
  
  // Final fallback implementation
  return function ForwardRefFallback(props: P & { ref?: React.Ref<T> }) {
    const { ref, ...rest } = props as any;
    return render(rest as P, ref);
  };
}