
import React from 'react';

export function createRefForwarder<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
) {
  const Component = React.forwardRef<T, P>(render);
  return Component;
}
