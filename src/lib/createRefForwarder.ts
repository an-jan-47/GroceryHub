
import React, { PropsWithoutRef } from "react";

export function createRefForwarder<T, P = {}>(
  render: (props: PropsWithoutRef<P>, ref: React.Ref<T>) => React.ReactElement | null
) {
  const component = React.forwardRef<T, P>(render);
  return component;
}
