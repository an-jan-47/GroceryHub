// Direct React initialization with no dependencies
(function() {
  // Create a global React placeholder immediately
  window.React = window.React || {};
  
  // Track when the real React is loaded
  let reactLoaded = false;
  let reactDOMLoaded = false;
  let callbacksQueue = [];
  let maxAttempts = 20; // Increase max attempts
  let attempts = 0;
  
  // Create a proxy for React that will work before React is fully loaded
  const reactProxy = new Proxy(window.React, {
    get: function(target, prop) {
      // If React is loaded, return the actual property
      if (reactLoaded && target[prop] !== undefined) {
        return target[prop];
      }
      
      // For Component, provide a minimal implementation that won't break
      if (prop === 'Component') {
        return class MinimalComponent {
          constructor(props) { this.props = props; }
          setState() {}
          forceUpdate() {}
          render() { return null; }
        };
      }
      
      // For forwardRef, provide a minimal implementation
      if (prop === 'forwardRef') {
        return function(render) {
          return function ForwardRefFallback(props) {
            const { ref, ...rest } = props || {};
            return render ? render(rest, ref) : null;
          };
        };
      }
      
      // Return empty functions for other common React methods
      if (['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo'].includes(prop)) {
        return function() { return [undefined, function() {}]; };
      }
      
      // Return undefined for other properties
      return undefined;
    }
  });
  
  // Replace window.React with our proxy
  window.React = reactProxy;
  
  // Function to execute when React is ready
  window.whenReactIsReady = function(callback) {
    if (reactLoaded && reactDOMLoaded) {
      setTimeout(callback, 0);
    } else {
      callbacksQueue.push(callback);
    }
  };
  
  // Function to check if the real React is loaded
  function checkReactLoaded() {
    const realReact = window.React;
    attempts++;
    
    if (realReact && typeof realReact.Component === 'function' && 
        realReact.Component.toString().indexOf('MinimalComponent') === -1) {
      console.log('Real React detected');
      reactLoaded = true;
      
      // Create the ref forwarder implementation
      window.createRefForwarder = function(render) {
        return realReact.forwardRef(render);
      };
      
      window.unifiedForwardRef = window.createRefForwarder;
      
      // Check if we can execute callbacks
      maybeExecuteCallbacks();
    } else if (attempts >= maxAttempts) {
      console.error('Failed to detect React after maximum attempts');
      // Force reactLoaded to true as a fallback
      reactLoaded = true;
      reactDOMLoaded = true;
      maybeExecuteCallbacks();
    }
  }
  
  // Function to check if ReactDOM is loaded
  function checkReactDOMLoaded() {
    if (window.ReactDOM) {
      console.log('ReactDOM detected');
      reactDOMLoaded = true;
      maybeExecuteCallbacks();
    }
  }
  
  // Execute callbacks if both React and ReactDOM are loaded
  function maybeExecuteCallbacks() {
    if (reactLoaded && reactDOMLoaded) {
      console.log('Executing React ready callbacks');
      while (callbacksQueue.length > 0) {
        const callback = callbacksQueue.shift();
        try {
          callback();
        } catch (err) {
          console.error('Error executing React ready callback:', err);
        }
      }
    }
  }
  
  // Set up polling to check if React is loaded
  const checkInterval = setInterval(function() {
    checkReactLoaded();
    checkReactDOMLoaded();
    
    if ((reactLoaded && reactDOMLoaded) || attempts >= maxAttempts) {
      clearInterval(checkInterval);
    }
  }, 100); // Check more frequently
  
  // Also check immediately
  checkReactLoaded();
  checkReactDOMLoaded();
})();