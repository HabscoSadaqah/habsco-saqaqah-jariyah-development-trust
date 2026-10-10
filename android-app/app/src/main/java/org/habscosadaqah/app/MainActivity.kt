package org.habscosadaqah.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.Menu
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceError
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var refresh: SwipeRefreshLayout
    private val home = "https://habscosadaqah.org/"
    private val homePage = "https://habscosadaqah.org/home.html?app=android&v=20261010-2"
    private val allowedHost = "habscosadaqah.org"
    private var showingErrorPage = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        supportActionBar?.title = "HABSCO"

        refresh = SwipeRefreshLayout(this)
        webView = WebView(this)
        webView.setBackgroundColor(Color.rgb(2, 11, 7))
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        refresh.addView(
            webView,
            SwipeRefreshLayout.LayoutParams(
                SwipeRefreshLayout.LayoutParams.MATCH_PARENT,
                SwipeRefreshLayout.LayoutParams.MATCH_PARENT
            )
        )
        refresh.setOnRefreshListener { webView.reload() }
        setContentView(refresh)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false
            allowContentAccess = true
            builtInZoomControls = false
            displayZoomControls = false
            loadsImagesAutomatically = true
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            mediaPlaybackRequiresUserGesture = true
            cacheMode = WebSettings.LOAD_NO_CACHE
            userAgentString = "$userAgentString HABSCOAndroid/1.1"
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (!showingErrorPage) refresh.isRefreshing = newProgress < 100
            }

            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                Log.d("HABSCO-WebView", "${consoleMessage.message()} -- ${consoleMessage.sourceId()}:${consoleMessage.lineNumber()}")
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView, url: String, favicon: android.graphics.Bitmap?) {
                showingErrorPage = false
                refresh.isRefreshing = true
            }

            override fun onPageFinished(view: WebView, url: String) {
                refresh.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceError
            ) {
                if (request.isForMainFrame && !showingErrorPage) {
                    Log.e("HABSCO-WebView", "Page load failed: ${error.errorCode} ${error.description}")
                    showLoadError(view)
                }
            }

            override fun onReceivedHttpError(
                view: WebView,
                request: WebResourceRequest,
                errorResponse: android.webkit.WebResourceResponse
            ) {
                if (request.isForMainFrame && errorResponse.statusCode >= 400 && !showingErrorPage) {
                    Log.e("HABSCO-WebView", "HTTP ${errorResponse.statusCode} loading ${request.url}")
                    showLoadError(view)
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && (uri.host == allowedHost || uri.host == "www.$allowedHost")) {
                    return false
                }
                return try {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    true
                } catch (e: Exception) {
                    Toast.makeText(this@MainActivity, "No app can open this link.", Toast.LENGTH_SHORT).show()
                    true
                }
            }
        }

        webView.setDownloadListener(DownloadListener { url, userAgent, _, mimeType, _ ->
            try {
                val request = DownloadManager.Request(Uri.parse(url))
                request.addRequestHeader("User-Agent", userAgent)
                request.setMimeType(mimeType)
                request.setTitle("HABSCO download")
                request.setDescription("Downloading from HABSCO")
                request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                )
                request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    "HABSCO-" + System.currentTimeMillis()
                )
                (getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
                Toast.makeText(this, "Download started", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this, "Download could not start.", Toast.LENGTH_LONG).show()
                Log.e("HABSCO-WebView", "Download failed", e)
            }
        })

        if (
            android.os.Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                20
            )
        }

        val deepLink = intent?.data
        val startUrl = if (
            deepLink?.scheme == "https" &&
            (deepLink.host == allowedHost || deepLink.host == "www.$allowedHost")
        ) deepLink.toString() else homePage
        webView.loadUrl(startUrl)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack() && !showingErrorPage) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun showLoadError(view: WebView) {
        showingErrorPage = true
        refresh.isRefreshing = false
        val html = """
            <!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
            <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020b07;color:#fff;font:16px Arial,sans-serif;text-align:center;padding:24px;box-sizing:border-box}
            main{max-width:420px}h1{color:#f2c94c}p{line-height:1.6;color:#d5e5dc}a{display:inline-block;margin:10px;padding:13px 20px;border-radius:12px;background:#f2c94c;color:#102418;text-decoration:none;font-weight:bold}</style>
            </head><body><main><h1>HABSCO</h1><p>The app could not load the HABSCO website. Check your internet connection, then try again.</p>
            <a href="$homePage">Retry loading HABSCO</a><p>If the problem continues, open the website in your browser.</p>
            <a href="https://habscosadaqah.org/">Open HABSCO website</a></main></body></html>
        """.trimIndent()
        view.loadDataWithBaseURL(home, html, "text/html", "UTF-8", null)
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menu.add("Privacy Policy").setOnMenuItemClickListener {
            webView.loadUrl("${home}privacy-policy.html")
            true
        }
        menu.add("Delete Account").setOnMenuItemClickListener {
            webView.loadUrl("${home}delete-account.html")
            true
        }
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean =
        super.onOptionsItemSelected(item)

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val uri = intent.data
        if (uri?.scheme == "https" && (uri.host == allowedHost || uri.host == "www.$allowedHost")) {
            webView.loadUrl(uri.toString())
        } else {
            webView.loadUrl(homePage)
        }
    }

    override fun onDestroy() {
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }
}
