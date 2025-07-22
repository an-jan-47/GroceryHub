package com.groceryhub.app;

import android.app.Activity;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GestureHelper")
public class GestureHelper extends Plugin {

    @PluginMethod
    public void enableEdgeToEdge(PluginCall call) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> {
                Window window = activity.getWindow();
                View decorView = window.getDecorView();
                
                // Enable edge-to-edge display
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // For Android 10+ (API 29+)
                    window.setNavigationBarContrastEnforced(false);
                }
                
                int flags = decorView.getSystemUiVisibility();
                flags |= View.SYSTEM_UI_FLAG_LAYOUT_STABLE 
                      | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                      | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                decorView.setSystemUiVisibility(flags);
                
                // Disable window zoom
                window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
                
                // Enable hardware acceleration for better performance
                window.setFlags(
                    WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                    WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
                
                call.resolve();
            });
        } else {
            call.reject("Activity not available");
        }
    }
    
    @PluginMethod
    public void disableZoom(PluginCall call) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> {
                try {
                    WebView webView = getBridge().getWebView();
                    webView.getSettings().setBuiltInZoomControls(false);
                    webView.getSettings().setDisplayZoomControls(false);
                    webView.getSettings().setSupportZoom(false);
                    
                    // Additional settings for better navigation
                    webView.getSettings().setJavaScriptEnabled(true);
                    webView.getSettings().setDomStorageEnabled(true);
                    webView.getSettings().setAllowFileAccess(true);
                    webView.getSettings().setAllowContentAccess(true);
                    
                    // Set text zoom to 100% to prevent text scaling
                    webView.getSettings().setTextZoom(100);
                    
                    call.resolve();
                } catch (Exception e) {
                    call.reject("Failed to disable zoom: " + e.getMessage());
                }
            });
        } else {
            call.reject("Activity not available");
        }
    }

    @PluginMethod
    public void enableSwipeNavigation(PluginCall call) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> {
                try {
                    WebView webView = getBridge().getWebView();
                    
                    // Enable hardware acceleration for smoother gestures
                    webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                    
                    // Set overscroll mode to always for better edge feedback
                    webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
                    
                    call.resolve();
                } catch (Exception e) {
                    call.reject("Failed to enable swipe navigation: " + e.getMessage());
                }
            });
        } else {
            call.reject("Activity not available");
        }
    }
}