import React from 'react';

// This is a safe wrapper around React.forwardRef that handles cases where forwardRef might not be available
export function safeForwardRef<T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactElement | null) {
  // Check if React.forwardRef is available
  if (typeof React.forwardRef === 'function') {
    return React.forwardRef(render);
  } else {
    // Fallback implementation when forwardRef is not available
    return function ForwardRefFallback(props: P & { ref?: React.Ref<T> }) {
      const { ref, ...rest } = props as any;
      return render(rest as P, ref);
    };
  }
}