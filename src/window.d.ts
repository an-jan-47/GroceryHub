interface Window {
  React: typeof import('react');
  whenReactIsReady: (callback: () => void) => void;
  createRefForwarder: <T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactElement | null) => any;
  unifiedForwardRef: <T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactElement | null) => any;
}