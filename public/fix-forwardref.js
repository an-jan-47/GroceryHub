// Enhanced fix for forwardRef error - v5.0
(function() {
  console.log('ForwardRef patch v5.0 initializing...');
  
  // Track patched objects to avoid duplicates
  const patchedObjects = new Set();
  
  // Function to apply the patch
  function applyForwardRefPatch() {
    try {
      // If React is available in window
      if (window.React && window.React.forwardRef) {
        let patchCount = 0;
        
        // 1. Patch window.n which is commonly used in Vite builds
        if (window.n && typeof window.n === 'object' && !window.n.forwardRef && 
            (window.n.useState || window.n.createElement || window.n.Component)) {
          window.n.forwardRef = window.React.forwardRef;
          patchedObjects.add('window.n');
          console.log('Patched forwardRef on window.n');
          patchCount++;
        }
        
        // 2. Patch all potential React instances in window
        Object.keys(window).forEach(key => {
          try {
            if (typeof window[key] !== 'object' || window[key] === null || patchedObjects.has(`window.${key}`)) return;
            
            // Check if this object uses React but is missing forwardRef
            if ((window[key].createElement || window[key].useState || window[key].Component) && !window[key].forwardRef) {
              window[key].forwardRef = window.React.forwardRef;
              patchedObjects.add(`window.${key}`);
              console.log(`Patched forwardRef on window.${key}`);
              patchCount++;
            }
          } catch (err) {
            // Silently ignore errors for individual properties
          }
        });
        
        // 3. Specifically look for the Vite module system
        if (window.__vite_is_modern_browser) {
          console.log('Found Vite modern browser flag, checking for modules');
          
          // Try to find the React module in the Vite system
          const moduleKeys = Object.keys(window).filter(k => 
            k.startsWith('__vite_chunk_') || 
            k.startsWith('__vite_module_')
          );
          
          moduleKeys.forEach(moduleKey => {
            try {
              const mod = window[moduleKey];
              if (mod && typeof mod === 'object') {
                Object.keys(mod).forEach(exportKey => {
                  try {
                    const exp = mod[exportKey];
                    if (exp && typeof exp === 'object' && !patchedObjects.has(`${moduleKey}.${exportKey}`)) {
                      if ((exp.createElement || exp.useState || exp.Component) && !exp.forwardRef) {
                        exp.forwardRef = window.React.forwardRef;
                        patchedObjects.add(`${moduleKey}.${exportKey}`);
                        console.log(`Patched forwardRef on ${moduleKey}.${exportKey}`);
                        patchCount++;
                      }
                    }
                  } catch (err) {
                    // Silently ignore errors for individual exports
                  }
                });
              }
            } catch (err) {
              console.warn(`Error checking module ${moduleKey}:`, err);
            }
          });
        }
        
        // 4. Patch component chunks specifically
        const componentChunkPattern = /components-[A-Za-z0-9]+\.js/;
        const scripts = Array.from(document.querySelectorAll('script[src]'))
          .filter(script => componentChunkPattern.test(script.src));
        
        if (scripts.length > 0) {
          console.log(`Found ${scripts.length} component scripts, applying targeted patches`);
          
          // Monitor for new modules being added to window
          const originalDefineProperty = Object.defineProperty;
          Object.defineProperty = function(obj, prop, descriptor) {
            const result = originalDefineProperty.call(this, obj, prop, descriptor);
            
            // Check if this is a new React-like object being added
            if (obj === window && typeof window[prop] === 'object' && window[prop]) {
              setTimeout(() => {
                try {
                  const newObj = window[prop];
                  if ((newObj.createElement || newObj.useState || newObj.Component) && !newObj.forwardRef && !patchedObjects.has(`window.${prop}`)) {
                    newObj.forwardRef = window.React.forwardRef;
                    patchedObjects.add(`window.${prop}`);
                    console.log(`Patched forwardRef on dynamically added window.${prop}`);
                    patchCount++;
                  }
                } catch (err) {
                  // Silently ignore errors
                }
              }, 0);
            }
            
            return result;
          };
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
    window.addEventListener('load', applyForwardRefPatch);
    
    // Set up a polling mechanism as a fallback
    let attempts = 0;
    const maxAttempts = 200; // Increased from 150 to 200
    const checkInterval = setInterval(function() {
      attempts++;
      
      // Log every 50 attempts
      if (attempts % 50 === 0) {
        console.log(`Still trying to patch forwardRef... (attempt ${attempts})`);
      }
      
      if (applyForwardRefPatch() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log(`ForwardRef patch ${attempts >= maxAttempts ? 'timed out' : 'succeeded'} after ${attempts} attempts`);
      }
    }, 50); // Reduced interval from 100ms to 50ms for faster patching
    
    // Add multiple final attempts with increasing delays
    [1000, 2000, 5000].forEach(delay => {
      setTimeout(function() {
        if (attempts < maxAttempts) {
          console.log(`Making additional attempt to patch forwardRef after ${delay}ms...`);
          applyForwardRefPatch();
        }
      }, delay);
    });
  }
})();