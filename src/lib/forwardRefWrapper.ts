import React from 'react';

/**
 * A unified wrapper for React.forwardRef that works consistently
 * across different environments and initialization states
 */
export function safeForwardRef<T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactElement | null) {
  // In browser environment, use the unified implementation
  if (typeof window !== 'undefined' && window.unifiedForwardRef) {
    return window.unifiedForwardRef(render);
  }
  
  // Direct React.forwardRef if available
  if (React && typeof React.forwardRef === 'function') {
    try {
      return React.forwardRef(render);
    } catch (e) {
      console.warn('React.forwardRef failed, using fallback', e);
      // Fall through to fallback
    }
  }
  
  // Last resort fallback
  return function ForwardRefFallback(props: P & { ref?: React.Ref<T> }) {
    const { ref, ...rest } = props as any;
    return render(rest as P, ref);
  };
}