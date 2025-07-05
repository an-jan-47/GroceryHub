import React from "react";
import { createRefForwarder } from "@/lib/createRefForwarder";
/**
 * Single source of truth for React createRefForwarder handling
 * This script ensures createRefForwarder is available before any components try to use it
 * This avoids initialization issues with minified variable names
 */
(function() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Wait for React to be defined
  function initRefForwarder() {
    // Check if React is available globally
    if (!window.React) {
      console.log('Waiting for React to be defined...');
      setTimeout(initRefForwarder, 10);
      return;
    }
    
    // Define a global createRefForwarder function
    window.createRefForwarder = function(render) {
      // Return a class component that forwards refs
      return class RefForwarder extends window.React.Component {
        render() {
          const { ref, ...rest } = this.props || {};
          return render(rest, ref);
        }
      };
    };
    
    // Also define unifiedForwardRef for compatibility
    window.unifiedForwardRef = window.createRefForwarder;
    
    console.log('RefForwarder HOC implementation initialized');
  }
  
  // Start initialization
  initRefForwarder();
})();