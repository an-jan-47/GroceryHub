package com.groceryhub.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register our plugins
        registerPlugin(GestureHelper.class);
        
        // Configure WebView for better navigation
        WebView webView = this.bridge.getWebView();
        WebSettings settings = webView.getSettings();
        
        // Add these configurations
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE); // Change to NO_CACHE
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        
        // Disable zooming
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        
        // Set text zoom to 100% to prevent text scaling
        settings.setTextZoom(100);
        
        // Enable DOM storage for better state management
        settings.setDomStorageEnabled(true);
        
        // Enable JavaScript
        settings.setJavaScriptEnabled(true);
        
        // Add this to ensure scripts load properly
        settings.setBlockNetworkLoads(false);
        settings.setBlockNetworkImage(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Initialize GestureHelper
        try {
            GestureHelper gestureHelper = new GestureHelper();
            gestureHelper.setBridge(this.bridge);
            gestureHelper.load();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @Override
    public void onBackPressed() {
        // Let the WebView handle back navigation first
        WebView webView = this.bridge.getWebView();
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            // Let Capacitor handle back button presses
            super.onBackPressed();
        }
    }
}
