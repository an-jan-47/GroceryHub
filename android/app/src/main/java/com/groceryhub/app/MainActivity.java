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
import android.app.DownloadManager;
import android.os.Environment;
import android.widget.Toast;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import android.util.Log;
// Remove permission imports
// import android.Manifest;
// import android.content.pm.PackageManager;
// import androidx.core.app.ActivityCompat;
// import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    // Remove permission constants
    // private static final int STORAGE_PERMISSION_CODE = 1001;
    
    // Remove pending download variables
    // private String pendingDownloadUrl = null;
    // private String pendingUserAgent = null;
    // private String pendingContentDisposition = null;
    // private String pendingMimeType = null;
    // private long pendingContentLength = 0;
    
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
        
        // Set download listener - simplified to directly download without permission checks
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, 
                                        String mimetype, long contentLength) {
                // Directly download the file without permission checks
                downloadFile(url, userAgent, contentDisposition, mimetype, contentLength);
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
    
    // Remove permission checking methods
    // private boolean checkStoragePermission() {...}
    // private void requestStoragePermission() {...}
    // @Override
    // public void onRequestPermissionsResult(...) {...}
    
    // Keep the download functionality method
    private void downloadFile(String url, String userAgent, String contentDisposition, 
                            String mimetype, long contentLength) {
        try {
            // Create a DownloadManager request
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            
            // Extract filename from content disposition or create a default one
            String fileName = "invoice.pdf";
            if (contentDisposition != null) {
                String fileNameRegex = "filename=\\\"([^\\\"]*)\\\"";
                Pattern pattern = Pattern.compile(fileNameRegex, Pattern.CASE_INSENSITIVE);
                Matcher matcher = pattern.matcher(contentDisposition);
                if (matcher.find()) {
                    fileName = matcher.group(1);
                }
            }
            
            // Configure the download with more permissive settings
            request.setTitle("Downloading Invoice");
            request.setDescription("Downloading invoice PDF file");
            request.allowScanningByMediaScanner();
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            
            // Add headers that might help with some servers
            if (userAgent != null) {
                request.addRequestHeader("User-Agent", userAgent);
            }
            
            // Set MIME type explicitly if available
            if (mimetype != null) {
                request.setMimeType(mimetype);
            }
            
            // Get the download service and enqueue the request
            DownloadManager downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            long downloadId = downloadManager.enqueue(request);
            
            // Show a toast message
            Toast.makeText(getApplicationContext(), "Downloading Invoice...", Toast.LENGTH_SHORT).show();
            
            // Log success for debugging
            Log.d(TAG, "Download started with ID: " + downloadId);
        } catch (Exception e) {
            // If there's an error, try the fallback method
            Log.e(TAG, "Download error: " + e.getMessage());
            
            // Fallback to browser download
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            try {
                startActivity(intent);
            } catch (ActivityNotFoundException anfe) {
                Toast.makeText(getApplicationContext(), "No application available to view PDF", Toast.LENGTH_SHORT).show();
            }
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
