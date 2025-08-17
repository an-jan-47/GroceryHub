package com.groceryhub.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Context;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
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
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.database.Cursor;
import java.io.File;
import androidx.core.content.FileProvider;

// Modern imports
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.Manifest;
import android.os.Build;
import android.provider.MediaStore;
import android.content.ContentValues;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import android.app.AlertDialog;
import android.content.DialogInterface;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.os.Handler;
import android.os.Looper;

// Additional imports for blob and base64 handling
import android.webkit.JavascriptInterface;
import android.util.Base64;
import java.io.ByteArrayInputStream;
import java.io.FileOutputStream;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int STORAGE_PERMISSION_REQUEST_CODE = 100;
    private static final int MAX_RELOAD_ATTEMPTS = 3;
    
    // Thread management
    private ExecutorService executorService;
    private Handler mainHandler;
    
    // Download state management
    private BroadcastReceiver downloadCompleteReceiver;
    private String pendingDownloadUrl;
    private String pendingDownloadUserAgent;
    private String pendingDownloadContentDisposition;
    private String pendingDownloadMimetype;
    private long pendingDownloadContentLength;
    private String lastPageUrl;
    
    // Error tracking
    private int reloadAttempts = 0;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize thread management
        executorService = Executors.newFixedThreadPool(2);
        mainHandler = new Handler(Looper.getMainLooper());
        
        configureWebView();
        
        // Handle deep link intent
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        String action = intent.getAction();
        Uri data = intent.getData();
    
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            // Store the intent data for processing after WebView is ready
            pendingAuthIntent = intent;
            
            // If WebView is already initialized, process immediately
            if (bridge != null && bridge.getWebView() != null) {
                processAuthIntent(intent);
            }
            // Otherwise, it will be processed when WebView is ready in configureWebView()
        }
    }

    private void processAuthIntent(Intent intent) {
    Uri data = intent.getData();
    if (data != null) {
        String path = data.getPath();
        String fragment = data.getFragment();
        String query = data.getQuery();
        
        // Check for auth-related URLs
        if (isAuthRedirect(data)) {
            // Load the full URL in WebView to let Supabase handle the auth response
            this.bridge.getWebView().loadUrl(data.toString());
            return;
        }
        
        // Handle product deep links
        if (path != null && path.startsWith("/product/")) {
            String productId = path.substring("/product/".length());
            String productUrl = "https://modern-cart-nexus-app.vercel.app/product/" + productId;
            this.bridge.getWebView().loadUrl(productUrl);
        }
    }
}
private boolean isAuthRedirect(Uri uri) {
    if (uri == null) return false;
    
    // Check fragment and query parameters for auth tokens
    String fragment = uri.getFragment();
    String query = uri.getQuery();
    if ((fragment != null && (fragment.contains("access_token") || fragment.contains("error") || 
        fragment.contains("token") || fragment.contains("code"))) ||
        (query != null && (query.contains("access_token") || query.contains("error") || 
        query.contains("token") || query.contains("code")))) {
        return true;
    }
    
    // Check path for auth-related endpoints
    String path = uri.getPath();
    return path != null && (
        path.contains("/auth/callback") ||
        path.contains("/auth/confirm") ||
        path.contains("/oauth") ||
        path.contains("/callback")
    );
}

    // Add this at the class level
    private Intent pendingAuthIntent;

    private void configureWebView() {
        WebView webView = this.bridge.getWebView();
        
        // Enable debugging in development
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Add JavaScript interface for blob and base64 downloads
        webView.addJavascriptInterface(new AndroidDownloadInterface(), "AndroidDownload");

        WebSettings settings = webView.getSettings();
        
        // Essential settings
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Security settings - more restrictive
        settings.setBlockNetworkLoads(false);
        settings.setBlockNetworkImage(false);
        // Only allow mixed content if necessary - be more selective
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        
        // Performance settings
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setTextZoom(100);
        
        // Download listener
        webView.setDownloadListener(new SecureDownloadListener());
        
        // Chrome client for console logging
        webView.setWebChromeClient(new CustomWebChromeClient());
        
        // Custom WebView client
        webView.setWebViewClient(new CustomWebViewClient());
        
        // Inject JavaScript to handle blob URLs
        injectBlobDownloadScript(webView);
    }
    
    // JavaScript interface for handling downloads from web content
    public class AndroidDownloadInterface {
        @JavascriptInterface
        public void downloadBase64(String base64Data, String fileName, String mimeType) {
            Log.d(TAG, "Received base64 download: " + fileName + " (" + mimeType + ")");
            
            try {
                // Remove data URL prefix if present
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                
                byte[] pdfBytes = Base64.decode(base64Data, Base64.DEFAULT);
                
                if (pdfBytes.length == 0) {
                    Log.e(TAG, "Base64 decode resulted in empty data");
                    mainHandler.post(() -> showToast("Download failed: Invalid data"));
                    return;
                }
                
                Log.d(TAG, "Decoded " + pdfBytes.length + " bytes from base64");
                saveFileToStorage(pdfBytes, fileName, mimeType);
                
            } catch (Exception e) {
                Log.e(TAG, "Error processing base64 download", e);
                mainHandler.post(() -> showToast("Download failed: " + e.getMessage()));
            }
        }
        
        @JavascriptInterface
        public void downloadBlob(String blobUrl, String fileName, String mimeType) {
            Log.d(TAG, "Received blob download: " + blobUrl + " -> " + fileName);
            mainHandler.post(() -> {
                // Trigger normal download flow for blob URLs
                handleDownloadRequest(blobUrl, null, "attachment; filename=\"" + fileName + "\"", mimeType, 0);
            });
        }
    }
    
    private void injectBlobDownloadScript(WebView webView) {
        String script = 
            "(function() {" +
            "    const originalCreateObjectURL = URL.createObjectURL;" +
            "    const createdUrls = new Map();" +
            "    " +
            "    URL.createObjectURL = function(blob) {" +
            "        const url = originalCreateObjectURL(blob);" +
            "        createdUrls.set(url, blob);" +
            "        return url;" +
            "    };" +
            "    " +
            "    document.addEventListener('click', function(e) {" +
            "        const link = e.target.closest('a[href]');" +
            "        if (link && link.href.startsWith('blob:')) {" +
            "            e.preventDefault();" +
            "            const blob = createdUrls.get(link.href);" +
            "            if (blob) {" +
            "                const fileName = link.download || 'invoice.pdf';" +
            "                const reader = new FileReader();" +
            "                reader.onload = function(e) {" +
            "                    const base64 = e.target.result;" +
            "                    AndroidDownload.downloadBase64(base64, fileName, blob.type || 'application/pdf');" +
            "                };" +
            "                reader.readAsDataURL(blob);" +
            "            } else {" +
            "                AndroidDownload.downloadBlob(link.href, link.download || 'invoice.pdf', 'application/pdf');" +
            "            }" +
            "        }" +
            "    }, true);" +
            "})();";
        
        webView.evaluateJavascript(script, null);
    }
    
    private void saveFileToStorage(byte[] fileData, String fileName, String mimeType) {
        showToast("Downloading Invoice...");
        
        // Make fileName effectively final by creating a final copy
        final String finalFileName = ensurePdfExtension(fileName);
        final String finalMimeType = mimeType != null ? mimeType : "application/pdf";
        
        executorService.execute(() -> {
            Uri resultUri = null;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Use MediaStore for Android 10+
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, finalFileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, finalMimeType);
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    
                    if (uri != null) {
                        try (OutputStream outputStream = getContentResolver().openOutputStream(uri)) {
                            if (outputStream != null) {
                                outputStream.write(fileData);
                                outputStream.flush();
                                resultUri = uri;
                                Log.d(TAG, "Successfully saved " + fileData.length + " bytes to MediaStore");
                            }
                        }
                    }
                } else {
                    // Use external storage for older versions
                    if (checkStoragePermissions()) {
                        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                        if (!downloadsDir.exists()) {
                            downloadsDir.mkdirs();
                        }
                        
                        File file = new File(downloadsDir, finalFileName);
                        try (FileOutputStream fos = new FileOutputStream(file)) {
                            fos.write(fileData);
                            fos.flush();
                            resultUri = Uri.fromFile(file);
                            Log.d(TAG, "Successfully saved " + fileData.length + " bytes to external storage");
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error saving file to storage", e);
            }
            
            final Uri finalUri = resultUri;
            mainHandler.post(() -> {
                if (finalUri != null) {
                    showToast("Download completed! Opening PDF...");
                    openPdfFile(finalUri);
                } else {
                    showToast("Download failed. Please try again.");
                    // Don't fallback to browser for base64/blob downloads
                }
            });
        });
    }
    
    private String ensurePdfExtension(String fileName) {
        if (!fileName.toLowerCase().endsWith(".pdf")) {
            return fileName + ".pdf";
        }
        return fileName;
    }
    
    private class SecureDownloadListener implements DownloadListener {
        @Override
        public void onDownloadStart(String url, String userAgent, String contentDisposition, 
                                   String mimetype, long contentLength) {
            Log.d(TAG, "Download started: " + url);
            handleDownloadRequest(url, userAgent, contentDisposition, mimetype, contentLength);
        }
    }
    
    private class CustomWebChromeClient extends WebChromeClient {
        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            Log.d(TAG, "Console: " + consoleMessage.message() + " at line " + 
                  consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
            return true;
        }
    }
    
    private class CustomWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            return handleExternalUrls(url);
        }
        
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleExternalUrls(url);
        }
    
        private boolean handleExternalUrls(String url) {
            // Handle Google OAuth URLs
            if (url.contains("accounts.google.com") || 
                url.contains("oauth") || 
                url.contains("auth")) {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                try {
                    startActivity(intent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    Log.e(TAG, "No browser available to handle OAuth URL: " + url, e);
                    showToast("No browser available to handle authentication");
                    return true;
                }
            }
            
            // Handle other external URLs as before
            if (url.startsWith("tel:") || url.startsWith("mailto:") || 
                url.startsWith("https://wa.me/") || url.startsWith("whatsapp:")) {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                try {
                    startActivity(intent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    Log.e(TAG, "No activity found to handle URL: " + url, e);
                    showToast("No app available to handle this link");
                    return true; // Still consume the URL to prevent WebView from handling it
                }
            }
            return false;
        }
        
        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Log.e(TAG, "WebView error: " + error.getDescription() + " (" + error.getErrorCode() + 
                      ") for URL: " + request.getUrl());
                
                // Only handle main frame errors and limit retry attempts
                if (request.isForMainFrame() && shouldRetryOnError(error.getErrorCode())) {
                    handleNetworkError(view);
                }
            }
        }
        
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            Log.e(TAG, "WebView error: " + description + " (" + errorCode + ") for URL: " + failingUrl);
            
            if (shouldRetryOnError(errorCode)) {
                handleNetworkError(view);
            }
        }
        
        private boolean shouldRetryOnError(int errorCode) {
            return (errorCode == WebViewClient.ERROR_CONNECT || 
                    errorCode == WebViewClient.ERROR_HOST_LOOKUP ||
                    errorCode == WebViewClient.ERROR_TIMEOUT) && 
                   reloadAttempts < MAX_RELOAD_ATTEMPTS;
        }
        
        private void handleNetworkError(WebView view) {
            reloadAttempts++;
            // Add exponential backoff
            mainHandler.postDelayed(() -> {
                if (!isDestroyed() && !isFinishing()) {
                    view.reload();
                }
            }, 2000 * reloadAttempts); // 2s, 4s, 6s delay
        }
        
        @Override
        public void onPageFinished(WebView view, String url) {
            Log.d(TAG, "Page loaded: " + url);
            lastPageUrl = url;
            reloadAttempts = 0; // Reset on successful page load
        }
    }
    
    private void handleDownloadRequest(String url, String userAgent, String contentDisposition, 
                                     String mimetype, long contentLength) {
        // Store pending download info
        pendingDownloadUrl = url;
        pendingDownloadUserAgent = userAgent;
        pendingDownloadContentDisposition = contentDisposition;
        pendingDownloadMimetype = mimetype;
        pendingDownloadContentLength = contentLength;
        
        Log.d(TAG, "Handling download: " + url + " (" + mimetype + ")");
        
        String fileName = extractFileName(contentDisposition, mimetype);
        
        // Handle blob URLs differently
        if (url.startsWith("blob:")) {
            Log.d(TAG, "Blob URL detected, attempting to convert");
            convertBlobToBase64(url, fileName, mimetype != null ? mimetype : "application/pdf");
            return;
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            downloadToMediaStore(url, fileName, mimetype != null ? mimetype : "application/pdf");
        } else if (checkStoragePermissions()) {
            downloadWithDownloadManager(url, userAgent, contentDisposition, mimetype, contentLength);
        } else {
            requestStoragePermissions();
        }
    }
    
    private void convertBlobToBase64(String blobUrl, String fileName, String mimeType) {
        WebView webView = this.bridge.getWebView();
        String script = 
            "(function() {" +
            "    fetch('" + blobUrl + "')" +
            "    .then(response => response.blob())" +
            "    .then(blob => {" +
            "        const reader = new FileReader();" +
            "        reader.onload = function(e) {" +
            "            AndroidDownload.downloadBase64(e.target.result, '" + fileName + "', '" + mimeType + "');" +
            "        };" +
            "        reader.readAsDataURL(blob);" +
            "    })" +
            "    .catch(error => {" +
            "        console.error('Blob conversion failed:', error);" +
            "        AndroidDownload.downloadBlob('" + blobUrl + "', '" + fileName + "', '" + mimeType + "');" +
            "    });" +
            "})();";
        
        webView.evaluateJavascript(script, null);
    }
    
    private String extractFileName(String contentDisposition, String mimetype) {
        String fileName = "invoice.pdf";
        
        if (contentDisposition != null) {
            Pattern pattern = Pattern.compile("filename=\\\"([^\\\"]*)\\\"", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(contentDisposition);
            if (matcher.find()) {
                fileName = matcher.group(1);
            }
        }
        
        // Ensure proper extension
        if ((mimetype == null || mimetype.toLowerCase().contains("pdf")) && 
            !fileName.toLowerCase().endsWith(".pdf")) {
            fileName = fileName + ".pdf";
        }
        
        return fileName;
    }
    
    private void downloadToMediaStore(String url, String fileName, String mimeType) {
        showToast("Downloading Invoice...");
        
        executorService.execute(() -> {
            Uri resultUri = null;
            try {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
                values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                
                if (uri != null) {
                    try (OutputStream outputStream = getContentResolver().openOutputStream(uri)) {
                        if (outputStream != null && downloadFileToStream(url, outputStream)) {
                            resultUri = uri;
                        } else {
                            getContentResolver().delete(uri, null, null);
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error downloading to MediaStore", e);
            }
            
            final Uri finalUri = resultUri;
            mainHandler.post(() -> {
                if (finalUri != null) {
                    showToast("Download completed! Opening PDF...");
                    openPdfFile(finalUri);
                } else {
                    showToast("Download failed. Please try again.");
                    fallbackToBrowser(pendingDownloadUrl);
                }
            });
        });
    }
    
    private boolean downloadFileToStream(String fileUrl, OutputStream outputStream) {
        try {
            String cookie = android.webkit.CookieManager.getInstance().getCookie(fileUrl);
            String userAgent = pendingDownloadUserAgent != null ? pendingDownloadUserAgent :
                "Mozilla/5.0 (Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari/537.36";
            
            // Add retry logic
            for (int retry = 0; retry < 3; retry++) {
                try {
                    if (downloadWithRedirects(fileUrl, outputStream, cookie, userAgent, 5)) {
                        return true;
                    }
                    Thread.sleep(1000 * (retry + 1)); // Exponential backoff
                } catch (IOException e) {
                    Log.e(TAG, "Download attempt " + (retry + 1) + " failed", e);
                    if (retry == 2) throw e; // Rethrow on last attempt
                }
            }
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Error downloading file: " + e.getMessage(), e);
            return false;
        }
    }
    
    private boolean downloadWithRedirects(String currentUrl, OutputStream outputStream,
                                        String cookie, String userAgent, int maxRedirects) throws IOException {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(currentUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(30000);
            connection.setReadTimeout(30000);
            connection.setInstanceFollowRedirects(true); // Let HttpURLConnection handle redirects
            
            // Enhanced headers
            connection.setRequestProperty("User-Agent", userAgent);
            connection.setRequestProperty("Accept", "application/pdf,application/octet-stream;q=0.9,*/*;q=0.8");
            if (cookie != null && !cookie.isEmpty()) {
                connection.setRequestProperty("Cookie", cookie);
            }
            if (lastPageUrl != null && !lastPageUrl.isEmpty()) {
                connection.setRequestProperty("Referer", lastPageUrl);
            }
            
            int responseCode = connection.getResponseCode();
            String contentType = connection.getContentType();
            
            // Check if response is actually a PDF
            if (responseCode == HttpURLConnection.HTTP_OK) {
                if (contentType != null && 
                    (contentType.contains("application/pdf") || 
                     contentType.contains("application/octet-stream"))) {
                    return copyStream(connection.getInputStream(), outputStream);
                } else {
                    Log.e(TAG, "Invalid content type: " + contentType);
                    return false;
                }
            } else {
                Log.e(TAG, "HTTP error code: " + responseCode + ", Content-Type: " + contentType);
                return false;
            }
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
    
    private void fallbackToBrowser(String url) {
        // First try to open in a PDF viewer directly
        Intent pdfIntent = new Intent(Intent.ACTION_VIEW);
        pdfIntent.setDataAndType(Uri.parse(url), "application/pdf");
        pdfIntent.setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
        
        try {
            startActivity(pdfIntent);
            showToast("Opening in PDF viewer...");
            return;
        } catch (ActivityNotFoundException e) {
            Log.d(TAG, "No PDF viewer available, trying browser");
        }
        
        // Fallback to browser
        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(browserIntent);
            showToast("Opening in browser...");
        } catch (ActivityNotFoundException e) {
            showToast("No browser available to download file");
            Log.e(TAG, "No browser available", e);
        }
    }
    
    private boolean copyStream(InputStream inputStream, OutputStream outputStream) throws IOException {
        byte[] buffer = new byte[8192];
        int bytesRead;
        long total = 0;
        
        try (InputStream input = inputStream) {
            while ((bytesRead = input.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                total += bytesRead;
            }
        }
        
        if (total == 0) {
            Log.e(TAG, "Downloaded file is empty");
            return false;
        }
        
        return true;
    }
    
    private void openPdfFile(Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/pdf");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            
            if (intent.resolveActivity(getPackageManager()) != null) {
                startActivity(intent);
            } else {
                showPdfViewerDialog();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error opening PDF", e);
            showPdfViewerDialog();
        }
    }
    
    private void downloadWithDownloadManager(String url, String userAgent, String contentDisposition, 
                                           String mimetype, long contentLength) {
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            String fileName = extractFileName(contentDisposition, mimetype);
            
            // Configure download
            request.setTitle("Downloading Invoice");
            request.setDescription("Downloading invoice PDF file");
            request.allowScanningByMediaScanner();
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            
            // Use proper destination for older Android versions
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            } else {
                // For Android 10+, let DownloadManager handle the destination
                request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, fileName);
            }
            
            // Add headers
            addDownloadHeaders(request, userAgent, url);
            
            if (mimetype != null) {
                request.setMimeType(mimetype);
            }
            
            DownloadManager downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            long downloadId = downloadManager.enqueue(request);
            
            showToast("Downloading Invoice...");
            registerDownloadReceiver(downloadManager, downloadId, mimetype);
            
        } catch (Exception e) {
            Log.e(TAG, "Download error", e);
            fallbackToBrowser(url);
        }
    }
    
    private void addDownloadHeaders(DownloadManager.Request request, String userAgent, String url) {
        if (userAgent != null) {
            request.addRequestHeader("User-Agent", userAgent);
        }
        
        String cookie = android.webkit.CookieManager.getInstance().getCookie(url);
        if (cookie != null && !cookie.isEmpty()) {
            request.addRequestHeader("Cookie", cookie);
        }
        
        if (lastPageUrl != null && !lastPageUrl.isEmpty()) {
            request.addRequestHeader("Referer", lastPageUrl);
        }
        
        request.addRequestHeader("Accept", "application/pdf,application/octet-stream;q=0.9,*/*;q=0.8");
    }
    
    private void registerDownloadReceiver(DownloadManager downloadManager, long downloadId, String mimetype) {
        unregisterDownloadReceiver();
        
        downloadCompleteReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (downloadId == id) {
                    handleDownloadCompletion(downloadManager, downloadId, mimetype);
                    unregisterDownloadReceiver();
                }
            }
        };
        
        registerReceiver(downloadCompleteReceiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
    }
    
    private void unregisterDownloadReceiver() {
        if (downloadCompleteReceiver != null) {
            try {
                unregisterReceiver(downloadCompleteReceiver);
            } catch (IllegalArgumentException ignored) {
                // Receiver wasn't registered
            }
            downloadCompleteReceiver = null;
        }
    }
    
    private void handleDownloadCompletion(DownloadManager downloadManager, long downloadId, String mimetype) {
        DownloadManager.Query query = new DownloadManager.Query();
        query.setFilterById(downloadId);
        
        try (Cursor cursor = downloadManager.query(query)) {
            if (cursor.moveToFirst()) {
                int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                int uriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI);
                
                if (statusIndex != -1 && uriIndex != -1) {
                    int status = cursor.getInt(statusIndex);
                    String downloadedUri = cursor.getString(uriIndex);
                    
                    if (status == DownloadManager.STATUS_SUCCESSFUL && downloadedUri != null) {
                        if (isValidDownloadedFile(downloadedUri)) {
                            openDownloadedFile(downloadedUri);
                        } else {
                            showToast("Downloaded file is invalid or empty");
                        }
                    } else {
                        showToast("Download failed");
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling download completion", e);
        }
    }
    
    private boolean isValidDownloadedFile(String downloadedUri) {
        try {
            Uri uri = Uri.parse(downloadedUri);
            if ("file".equalsIgnoreCase(uri.getScheme())) {
                File file = new File(uri.getPath());
                return file.exists() && file.length() > 0;
            }
            return true; // Assume valid for non-file URIs
        } catch (Exception e) {
            return false;
        }
    }
    
    private void openDownloadedFile(String downloadedUri) {
        try {
            Uri fileUri = Uri.parse(downloadedUri);
            File file = new File(fileUri.getPath());
            
            if (file.exists()) {
                Uri contentUri = FileProvider.getUriForFile(
                    this,
                    getApplicationContext().getPackageName() + ".fileprovider",
                    file
                );
                
                openPdfFile(contentUri);
                showToast("Opening PDF...");
            } else {
                showToast("Downloaded file not found");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error opening downloaded file", e);
            showPdfViewerDialog();
        }
    }
    
    private void showPdfViewerDialog() {
        new AlertDialog.Builder(this)
            .setTitle("PDF Viewer Required")
            .setMessage("To view PDF files, please install a PDF viewer app from the Play Store.\n\n" +
                       "Popular options include:\n• Adobe Acrobat Reader\n• Google PDF Viewer\n• Microsoft Edge")
            .setPositiveButton("Install PDF Viewer", (dialog, which) -> promptToInstallPdfViewer())
            .setNegativeButton("Cancel", null)
            .show();
    }
    
    private void promptToInstallPdfViewer() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("market://search?q=pdf%20viewer&c=apps"));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        
        try {
            startActivity(intent);
            showToast("Please install a PDF viewer from the Play Store");
        } catch (ActivityNotFoundException e) {
            // Fallback to browser
            Intent browserIntent = new Intent(Intent.ACTION_VIEW);
            browserIntent.setData(Uri.parse("https://play.google.com/store/search?q=pdf%20viewer&c=apps"));
            try {
                startActivity(browserIntent);
            } catch (ActivityNotFoundException e2) {
                showToast("Unable to open Play Store. Please manually install a PDF viewer app.");
            }
        }
    }
    
    private boolean checkStoragePermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) 
                    == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }
    
    private void requestStoragePermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE},
                STORAGE_PERMISSION_REQUEST_CODE);
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == STORAGE_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingDownloadUrl != null) {
                    downloadWithDownloadManager(pendingDownloadUrl, pendingDownloadUserAgent, 
                                              pendingDownloadContentDisposition, pendingDownloadMimetype, 
                                              pendingDownloadContentLength);
                }
            } else {
                showPermissionDeniedDialog();
            }
        }
    }
    
    private void showPermissionDeniedDialog() {
        new AlertDialog.Builder(this)
            .setTitle("Storage Permission Required")
            .setMessage("This app needs storage permission to download and save PDF invoices to your device.")
            .setPositiveButton("Grant Permission", (dialog, which) -> requestStoragePermissions())
            .setNegativeButton("Use Browser", (dialog, which) -> {
                if (pendingDownloadUrl != null) {
                    fallbackToBrowser(pendingDownloadUrl);
                }
            })
            .show();
    }
    
    private void openInBrowser(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        try {
            startActivity(intent);
            showToast("Opening download in browser...");
        } catch (ActivityNotFoundException e) {
            showToast("No browser available to download file");
        }
    }
    
    private void showToast(String message) {
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onBackPressed() {
        WebView webView = this.bridge.getWebView();
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    public void onDestroy() {
        unregisterDownloadReceiver();
        
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
        
        super.onDestroy();
    }
}
