import React from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
}

const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({ onRefresh, children }) => {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      pullingContent={<div className="text-center text-gray-500 text-sm py-2">Pull down to refresh</div>}
      refreshingContent={<div className="text-center text-gray-500 text-sm py-2">Refreshing...</div>}
      pullDownThreshold={70}
      maxPullDownDistance={95}
      resistance={3}
      className="h-full"
    >
      {children}
    </PullToRefresh>
  );
};

export default PullToRefreshWrapper;