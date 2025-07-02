// Enhanced fix for forwardRef error - v3.0
(function() {
  console.log('ForwardRef patch v3.0 initializing...');
  
  // Function to apply the patch
  function applyForwardRefPatch() {
    try {
      // If React is available in window
      if (window.React && window.React.forwardRef) {
        console.log('Found React.forwardRef, applying patches...');
        let patchCount = 0;
        
        // 1. Patch global variables that might be React instances
        // This covers minified variables and other global objects
        Object.keys(window).forEach(key => {
          try {
            // Skip non-objects and null
            if (typeof window[key] !== 'object' || window[key] === null) return;
            
            // Check if this object uses React but is missing forwardRef
            if (window[key].createElement && !window[key].forwardRef) {
              window[key].forwardRef = window.React.forwardRef;
              console.log(`Patched forwardRef on window.${key}`);
              patchCount++;
            }
          } catch (err) {
            // Silently ignore errors for individual properties
          }
        });
        
        // 2. Patch common minified variable names
        ['n', 'r', 'a', 'o', 'i', 'e', 't', 's', 'l', 'c', 'u', 'f', 'd', 'Ie'].forEach(varName => {
          if (window[varName] && typeof window[varName] === 'object' && !window[varName].forwardRef) {
            // Check if it has other React-like methods
            if (window[varName].createElement || window[varName].useState || window[varName].Component) {
              window[varName].forwardRef = window.React.forwardRef;
              console.log(`Patched forwardRef on window.${varName}`);
              patchCount++;
            }
          }
        });
        
        // 3. Check for React in module systems
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers) {
          Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers).forEach(renderer => {
            if (renderer && typeof renderer === 'object' && !renderer.forwardRef && renderer.createElement) {
              renderer.forwardRef = window.React.forwardRef;
              console.log('Patched forwardRef on React DevTools renderer');
              patchCount++;
            }
          });
        }
        
        // 4. Patch specific module exports that might be used in your app
        // This targets the specific pattern seen in your bundled files
        if (window.__vite__mapDeps) {
          console.log('Found Vite module system, attempting to patch module exports...');
          
          // Try to find and patch the react-vendor module
          const reactModuleNames = ['react-vendor', 'vendor'];
          for (const name of reactModuleNames) {
            try {
              // Look for modules with names containing 'react-vendor' or 'vendor'
              const moduleMap = window.__vite__mapDeps.f || [];
              const moduleIndex = moduleMap.findIndex(path => path.includes(name));
              
              if (moduleIndex !== -1) {
                console.log(`Found potential React module: ${moduleMap[moduleIndex]}`);
                
                // Try to access the module's exports through the window
                const moduleExports = window[`__vite__module__${moduleIndex}`];
                if (moduleExports && typeof moduleExports === 'object') {
                  // Patch all exports that might be React
                  Object.keys(moduleExports).forEach(exportKey => {
                    const exportObj = moduleExports[exportKey];
                    if (exportObj && typeof exportObj === 'object' && !exportObj.forwardRef && 
                        (exportObj.createElement || exportObj.useState || exportObj.Component)) {
                      exportObj.forwardRef = window.React.forwardRef;
                      console.log(`Patched forwardRef on module export ${name}.${exportKey}`);
                      patchCount++;
                    }
                  });
                }
              }
            } catch (err) {
              console.warn(`Error patching ${name} module:`, err);
            }
          }
        }
        
        // 5. Direct patch for the specific component file
        try {
          // This targets the specific component file that's causing issues
          const componentFiles = document.querySelectorAll('script[src*="components-"]');
          if (componentFiles.length > 0) {
            console.log('Found component script, will attempt to patch when it loads');
            
            // Create a MutationObserver to watch for new script elements
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'SCRIPT' && node.src && node.src.includes('components-')) {
                      console.log('Component script loaded, attempting to patch...');
                      setTimeout(patchComponentModules, 100);
                    }
                  });
                }
              });
            });
            
            observer.observe(document.documentElement, {
              childList: true,
              subtree: true
            });
            
            // Also try to patch immediately in case the script is already loaded
            setTimeout(patchComponentModules, 100);
          }
        } catch (err) {
          console.warn('Error setting up component script observer:', err);
        }
        
        function patchComponentModules() {
          try {
            // Look for any global variables that might be the component module
            Object.keys(window).forEach(key => {
              // Skip non-objects
              if (typeof window[key] !== 'object' || window[key] === null) return;
              
              // Check if this object has component-like properties
              const obj = window[key];
              if (obj.Button || obj.Input || obj.Select || obj.Tooltip) {
                console.log(`Found potential component module: ${key}`);
                
                // Patch all component exports that use forwardRef
                Object.keys(obj).forEach(compKey => {
                  const comp = obj[compKey];
                  if (comp && typeof comp === 'function' && comp.displayName) {
                    // This is likely a component, make sure it has access to forwardRef
                    const proto = Object.getPrototypeOf(comp);
                    if (proto && !proto.forwardRef && window.React.forwardRef) {
                      proto.forwardRef = window.React.forwardRef;
                      console.log(`Patched forwardRef for component: ${comp.displayName}`);
                      patchCount++;
                    }
                  }
                });
              }
            });
          } catch (err) {
            console.warn('Error patching component modules:', err);
          }
        }
        
        console.log(`ForwardRef patch completed: ${patchCount} objects patched`);
        return patchCount > 0;
      } else {
        console.log('React.forwardRef not found yet, will retry...');
        return false;
      }
    } catch (e) {
      console.error('Error in forwardRef patch:', e);
      return false;
    }
  }
  
  // Try to apply patch immediately if React is already loaded
  if (!applyForwardRefPatch()) {
    // Set up event listeners for different load stages
    window.addEventListener('DOMContentLoaded', applyForwardRefPatch);
    
    // Also try on load
    window.addEventListener('load', applyForwardRefPatch);
    
    // Set up a polling mechanism as a fallback
    let attempts = 0;
    const maxAttempts = 100; // Increased from 50 to 100
    const checkInterval = setInterval(function() {
      attempts++;
      if (applyForwardRefPatch() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log(`ForwardRef patch ${attempts >= maxAttempts ? 'timed out' : 'succeeded'} after ${attempts} attempts`);
      }
    }, 100);
    
    // Add a final attempt with a longer delay
    setTimeout(function() {
      if (attempts < maxAttempts) {
        console.log('Making final attempt to patch forwardRef...');
        applyForwardRefPatch();
      }
    }, 5000);
  }
})();