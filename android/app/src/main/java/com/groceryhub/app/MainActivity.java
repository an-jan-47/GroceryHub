package com.groceryhub.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Context;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.webkit.DownloadListener;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configure WebView for better navigation
        WebView webView = this.bridge.getWebView();
        
        // Enable WebView debugging first
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Inside onCreate method
        WebSettings settings = webView.getSettings();
        
        // Critical settings for React
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // Change from LOAD_CACHE_ELSE_NETWORK to LOAD_DEFAULT
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Enable file downloads
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        
        // Set download listener
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, 
                                        String mimetype, long contentLength) {
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(url));
                startActivity(intent);
            }
        });
        
        // Ensure network requests work properly
        settings.setBlockNetworkLoads(false);
        settings.setBlockNetworkImage(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Improve WebView performance
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setTextZoom(100); // Prevent text scaling issues
        
        // Add console logging
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "Console: " + consoleMessage.message() + " at line " + 
                      consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
                return true;
            }
        });
        
        // Set a custom WebViewClient that DOESN'T load error.html
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Handle tel:, mailto:, and WhatsApp links
                if (url.startsWith("tel:") || url.startsWith("mailto:") || 
                    url.startsWith("https://wa.me/") || url.startsWith("whatsapp:")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    try {
                        startActivity(intent);
                        return true; // Indicate we handled the URL
                    } catch (ActivityNotFoundException e) {
                        Log.e(TAG, "No activity found to handle URL: " + url, e);
                        // Fall back to browser if no app is available
                        return false;
                    }
                }
                // Let the WebView handle all other URLs
                return false;
            }
            
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Forward to the string version for API 21+
                return shouldOverrideUrlLoading(view, request.getUrl().toString());
            }
            
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView error: " + description + " (" + errorCode + ") for URL: " + failingUrl);
                // Don't load error.html - just log the error
                
                // Try to reload the page on connection errors
                if (errorCode == WebViewClient.ERROR_CONNECT || 
                    errorCode == WebViewClient.ERROR_HOST_LOOKUP ||
                    errorCode == WebViewClient.ERROR_TIMEOUT) {
                    view.reload();
                }
            }
            
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Log.e(TAG, "WebView resource error: " + error.getDescription() + " (" + error.getErrorCode() + ") for URL: " + request.getUrl());
                // Don't load error.html - just log the error
                
                // Only try to reload for main frame errors, not resource errors
                if (request.isForMainFrame()) {
                    int errorCode = error.getErrorCode();
                    if (errorCode == WebViewClient.ERROR_CONNECT || 
                        errorCode == WebViewClient.ERROR_HOST_LOOKUP ||
                        errorCode == WebViewClient.ERROR_TIMEOUT) {
                        view.reload();
                    }
                }
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(TAG, "Page loaded: " + url);
            }
        });
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
