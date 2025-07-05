// This script ensures React is fully loaded before any components try to use it
(function() {
  // Track loading state
  let isInitialized = false;
  let waitingCallbacks = [];
  let reactCheckInterval = null;
  
  // Function to execute callbacks once React is loaded
  function executeCallbacks() {
    while (waitingCallbacks.length > 0) {
      const callback = waitingCallbacks.shift();
      try {
        callback();
      } catch (err) {
        console.error('Error executing callback:', err);
      }
    }
  }
  
  // More robust check for React being fully loaded
  function isReactFullyLoaded() {
    return typeof window !== 'undefined' && 
           typeof window.React !== 'undefined' && 
           window.React !== null &&
           typeof window.React.Component === 'function';
  }
  
  // Main initialization function
  function initReactComponents() {
    if (isInitialized) return true;
    
    if (isReactFullyLoaded()) {
      console.log('React fully loaded, initializing components');
      
      // Create the ref forwarder implementation
      window.createRefForwarder = function(render) {
        return window.React.forwardRef(render);
      };
      
      // Also define unifiedForwardRef for compatibility
      window.unifiedForwardRef = window.createRefForwarder;
      
      // Mark as initialized
      isInitialized = true;
      
      // Execute any waiting callbacks
      executeCallbacks();
      
      // Clear interval if it exists
      if (reactCheckInterval) {
        clearInterval(reactCheckInterval);
        reactCheckInterval = null;
      }
      
      return true;
    }
    
    return false;
  }
  
  // Try to initialize immediately
  if (!initReactComponents()) {
    // If not successful, set up a more robust polling mechanism
    let attempts = 0;
    const maxAttempts = 200; // 20 seconds max wait time
    
    reactCheckInterval = setInterval(function() {
      attempts++;
      
      if (initReactComponents() || attempts >= maxAttempts) {
        clearInterval(reactCheckInterval);
        reactCheckInterval = null;
        
        if (attempts >= maxAttempts && !isInitialized) {
          console.error('Failed to initialize React components after maximum attempts');
        }
      }
    }, 100);
  }
  
  // Public API to register callbacks
  window.whenReactIsReady = function(callback) {
    if (isInitialized) {
      setTimeout(callback, 0); // Use setTimeout to ensure async execution
    } else {
      waitingCallbacks.push(callback);
    }
  };
})();