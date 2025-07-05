import * as React from 'react';

type ForwardRefRenderFunction<T, P = {}> = (
  props: P,
  ref: React.Ref<T>
) => React.ReactElement | null;

/**
 * Higher-Order Component that forwards refs without using React.forwardRef
 * This avoids initialization issues with minified variable names
 */
export function createRefForwarder<T, P = {}>(Component: ForwardRefRenderFunction<T, P>) {
  // Return a class component that forwards refs
  return class RefForwarder extends React.Component<P & { ref?: React.Ref<T> }> {
    render() {
      const { ref, ...rest } = this.props as any;
      return Component(rest as P, ref);
    }
  };
}