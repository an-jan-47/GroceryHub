
import React, { ReactNode } from 'react';

interface PullToRefreshWrapperProps {
  onRefresh: () => void;
  children: ReactNode;
}

export default function PullToRefreshWrapper({ onRefresh, children }: PullToRefreshWrapperProps) {
  return (
    <div>{children}</div>
  );
}
