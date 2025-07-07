import * as React from 'react';

type ForwardRefRenderFunction<T, P = {}> = (
  props: P,
  ref: React.Ref<T>
) => React.ReactElement | null;

/**
 * Implementation that chooses the appropriate ref forwarding method
 * based on the environment and initialization state
 */
export function createRefForwarder<T, P = {}>(Component: ForwardRefRenderFunction<T, P>) {
  // Try standard React.forwardRef first
  if (typeof React.forwardRef === 'function') {
    try {
      return React.forwardRef<T, P>(Component);
    } catch (e) {
      console.warn('React.forwardRef failed, using HOC fallback');
    }
  }
  
  // Fallback to class component implementation
  return class RefForwarder extends React.Component<P & { ref?: React.Ref<T> }> {
    render() {
      const { ref, ...rest } = this.props as any;
      return Component(rest as P, ref);
    }
  };
}