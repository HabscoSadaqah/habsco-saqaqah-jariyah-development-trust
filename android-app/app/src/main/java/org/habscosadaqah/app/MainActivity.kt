package org.habscosadaqah.app

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import java.util.concurrent.Executors


private data class NativeTransaction(
    val reference: String,
    val type: String,
    val description: String,
    val amount: Double,
    val direction: String,
    val status: String,
    val createdAt: String
)

private data class NativeDashboard(
    val email: String,
    val fullName: String,
    val memberId: String,
    val wallet: Double?,
    val savings: Double?,
    val shares: Double?,
    val specialSavings: Double?,
    val dividend: Double?,
    val total: Double?,
    val transactions: List<NativeTransaction>
)

private object SupabaseNative {
    private const val BASE_URL = "https://ythnoeyxovapydbmymdo.supabase.co"
    private const val PUBLISHABLE_KEY = "sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN"
    private const val PREFS = "habsco_native_secure_session"
    private const val KEY_ALIAS = "habsco_native_session_key"
    private val io = Executors.newSingleThreadExecutor()
    private val main = Handler(Looper.getMainLooper())

    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = store.getKey(KEY_ALIAS, null) as? SecretKey
        if (existing != null) return existing
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return generator.generateKey()
    }

    private fun encrypt(value: String): String {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val encrypted = cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        return Base64.encodeToString(cipher.iv + encrypted, Base64.NO_WRAP)
    }

    private fun decrypt(value: String): String {
        val bytes = Base64.decode(value, Base64.NO_WRAP)
        require(bytes.size > 12) { "Saved session is invalid. Please sign in again." }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, bytes.copyOfRange(0, 12)))
        return String(cipher.doFinal(bytes.copyOfRange(12, bytes.size)), Charsets.UTF_8)
    }

    fun hasSession(context: android.content.Context): Boolean = try {
        val p = context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
        p.getString("access", null)?.let { decrypt(it).isNotBlank() } == true &&
            p.getString("refresh", null)?.let { decrypt(it).isNotBlank() } == true
    } catch (_: Exception) {
        clearSession(context)
        false
    }

    private fun saveSession(context: android.content.Context, json: JSONObject) {
        val user = json.getJSONObject("user")
        val p = context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
        p.edit()
            .putString("access", encrypt(json.getString("access_token")))
            .putString("refresh", encrypt(json.getString("refresh_token")))
            .putString("user_id", user.getString("id"))
            .putString("email", user.optString("email", ""))
            .putLong("expires_at", System.currentTimeMillis() + json.optLong("expires_in", 3600L) * 1000L)
            .apply()
    }

    fun clearSession(context: android.content.Context) {
        context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE).edit().clear().apply()
    }

    private fun sessionToken(context: android.content.Context): String {
        val p = context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
        val access = p.getString("access", null)?.let { decrypt(it) }
            ?: throw IllegalStateException("Please sign in to your HABSCO account.")
        if (p.getLong("expires_at", 0L) > System.currentTimeMillis() + 60_000L) return access
        val refresh = p.getString("refresh", null)?.let { decrypt(it) }
            ?: throw IllegalStateException("Your session expired. Please sign in again.")
        val response = request(
            "POST", "/auth/v1/token?grant_type=refresh_token", null,
            JSONObject().put("refresh_token", refresh)
        )
        val json = JSONObject(response)
        saveSession(context, json)
        return json.getString("access_token")
    }

    private fun request(method: String, path: String, token: String?, body: JSONObject? = null): String {
        val connection = (URL(BASE_URL + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15000
            readTimeout = 20000
            setRequestProperty("apikey", PUBLISHABLE_KEY)
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Authorization", "Bearer " + (token ?: PUBLISHABLE_KEY))
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
            }
        }
        try {
            if (body != null) OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { it.write(body.toString()) }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            if (status !in 200..299) {
                val message = try {
                    val j = JSONObject(text)
                    j.optString("msg").ifBlank { j.optString("message") }
                        .ifBlank { j.optString("error_description") }
                        .ifBlank { j.optString("error") }
                } catch (_: Exception) { "" }
                throw IllegalStateException(message.ifBlank { "HABSCO service returned HTTP $status." })
            }
            return text
        } finally {
            connection.disconnect()
        }
    }

    fun signIn(context: android.content.Context, email: String, password: String, callback: (Result<Unit>) -> Unit) {
        io.execute {
            val result = runCatching {
                require(email.contains("@")) { "Enter a valid email address." }
                require(password.isNotBlank()) { "Enter your password." }
                val json = JSONObject(request(
                    "POST", "/auth/v1/token?grant_type=password", null,
                    JSONObject().put("email", email.trim()).put("password", password)
                ))
                saveSession(context, json)
            }
            main.post { callback(result) }
        }
    }

    fun loadDashboard(context: android.content.Context, callback: (Result<NativeDashboard>) -> Unit) {
        io.execute {
            val result = runCatching {
                val token = sessionToken(context)
                val p = context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
                val userId = p.getString("user_id", null) ?: throw IllegalStateException("Session user is missing. Sign in again.")
                val email = p.getString("email", null).orEmpty()
                val profileText = request(
                    "GET", "/rest/v1/profiles?id=eq.$userId&select=full_name,member_id", token
                )
                val profileRows = JSONArray(profileText)
                val profile = if (profileRows.length() > 0) profileRows.getJSONObject(0) else JSONObject()
                val balanceText = request("POST", "/rest/v1/rpc/member_dashboard_balances", token, JSONObject())
                val balance = when {
                    balanceText.trimStart().startsWith("[") -> {
                        val rows = JSONArray(balanceText)
                        if (rows.length() == 0) JSONObject() else rows.getJSONObject(0)
                    }
                    balanceText.trimStart().startsWith("{") -> JSONObject(balanceText)
                    else -> JSONObject()
                }
                fun number(vararg keys: String): Double? {
                    for (k in keys) if (!balance.isNull(k) && balance.has(k)) return balance.optDouble(k)
                    return null
                }
                val transactions = runCatching {
                    val statementText = request(
                        "POST", "/rest/v1/rpc/member_statement_data", token,
                        JSONObject().put("p_limit", 100)
                    )
                    val payload = JSONObject(statementText)
                    val rows = payload.optJSONArray("transactions") ?: JSONArray()
                    (0 until rows.length()).map { index ->
                        val row = rows.getJSONObject(index)
                        NativeTransaction(
                            reference = row.optString("reference", "—"),
                            type = row.optString("type", "Transaction").replace("_", " "),
                            description = row.optString("description", ""),
                            amount = kotlin.math.abs(row.optDouble("amount", 0.0)),
                            direction = row.optString("direction", "credit").lowercase(),
                            status = row.optString("status", "approved").replace("_", " "),
                            createdAt = row.optString("created_at", "")
                        )
                    }.filterNot {
                        listOf("rejected", "declined", "failed", "cancelled", "canceled").contains(it.status.lowercase())
                    }.sortedByDescending { it.createdAt }.take(5)
                }.getOrDefault(emptyList())

                NativeDashboard(
                    email = email,
                    fullName = profile.optString("full_name").ifBlank { email.ifBlank { "HABSCO Member" } },
                    memberId = profile.optString("member_id", ""),
                    wallet = number("available", "wallet_balance"),
                    savings = number("savings", "savings_balance"),
                    shares = number("shares", "shares_balance"),
                    specialSavings = number("special_savings", "special_savings_balance"),
                    dividend = number("dividend", "dividend_balance"),
                    total = number("total", "total_balance"),
                    transactions = transactions
                )
            }
            main.post { callback(result) }
        }
    }

    fun signOut(context: android.content.Context) {
        io.execute {
            try {
                val p = context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
                val token = p.getString("access", null)?.let { decrypt(it) }
                if (token != null) request("POST", "/auth/v1/logout", token)
            } catch (_: Exception) {
                // Always clear local encrypted credentials, even if the network is unavailable.
            } finally {
                clearSession(context)
            }
        }
    }
}

private val Forest = Color(0xFF06251B)
private val DeepForest = Color(0xFF03150F)
private val Emerald = Color(0xFF0E8A58)
private val Mint = Color(0xFFBDF4D4)
private val Gold = Color(0xFFF3C95B)
private val Ink = Color(0xFF172821)
private val Muted = Color(0xFF687A70)
private val Canvas = Color(0xFFF4F8F5)
private val Line = Color(0xFFE1EAE4)

private data class AppTab(val label: String, val icon: ImageVector)

private val tabs = listOf(
    AppTab("Home", Icons.Default.Home),
    AppTab("Services", Icons.Default.Apps),
    AppTab("Wallet", Icons.Default.AccountBalanceWallet),
    AppTab("Charity", Icons.Default.Favorite),
    AppTab("Profile", Icons.Default.Person)
)

private data class ServiceItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val tint: Color,
    val url: String
)

private val services = listOf(
    ServiceItem("Airtime", "Top up a phone", Icons.Default.PhoneAndroid, Color(0xFFDCF5E8), "https://habscosadaqah.org/member.html"),
    ServiceItem("Data", "Internet bundles", Icons.Default.Wifi, Color(0xFFDCEBFF), "https://habscosadaqah.org/member.html"),
    ServiceItem("Electricity", "Pay utility bills", Icons.Default.Bolt, Color(0xFFFFF0C7), "https://habscosadaqah.org/member.html"),
    ServiceItem("TV", "Renew subscriptions", Icons.Default.Tv, Color(0xFFF0E5FF), "https://habscosadaqah.org/member.html"),
    ServiceItem("Education", "Education payments", Icons.Default.School, Color(0xFFFFE6DF), "https://habscosadaqah.org/member.html"),
    ServiceItem("Savings & Shares", "Build your future", Icons.Default.Savings, Color(0xFFDDF4F2), "https://habscosadaqah.org/member.html")
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(3, 21, 15)
        window.navigationBarColor = android.graphics.Color.rgb(3, 21, 15)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Emerald,
                    secondary = Gold,
                    background = Canvas,
                    surface = Color.White,
                    onBackground = Ink,
                    onSurface = Ink
                )
            ) {
                HabscoNativeApp(
                    onOpenUrl = { url -> openExternal(url) }
                )
            }
        }
    }

    private fun openExternal(url: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(this, "No browser is available to open this service.", Toast.LENGTH_LONG).show()
        } catch (_: Exception) {
            Toast.makeText(this, "Unable to open this service right now.", Toast.LENGTH_LONG).show()
        }
    }
}

@Composable
private fun HabscoNativeApp(onOpenUrl: (String) -> Unit) {
    val context = LocalContext.current
    var authenticated by remember { mutableStateOf(SupabaseNative.hasSession(context)) }
    var selectedTab by remember { mutableStateOf(0) }
    var loginLoading by remember { mutableStateOf(false) }
    var loginError by remember { mutableStateOf<String?>(null) }
    var dashboard by remember { mutableStateOf<NativeDashboard?>(null) }
    var balanceLoading by remember { mutableStateOf(false) }
    var balanceError by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(authenticated) {
        if (authenticated) {
            balanceLoading = true
            balanceError = null
            SupabaseNative.loadDashboard(context) { result ->
                result.onSuccess {
                    dashboard = it
                    balanceError = null
                }.onFailure {
                    balanceError = it.message ?: "Unable to load your account summary."
                    if (balanceError!!.contains("sign in", true) || balanceError!!.contains("session expired", true)) {
                        SupabaseNative.clearSession(context)
                        authenticated = false
                    }
                }
                balanceLoading = false
            }
        } else {
            dashboard = null
        }
    }

    BackHandler(enabled = selectedTab != 0 && authenticated) { selectedTab = 0 }

    if (!authenticated) {
        NativeLoginScreen(
            loading = loginLoading,
            error = loginError,
            onLogin = { email, password ->
                loginLoading = true
                loginError = null
                SupabaseNative.signIn(context, email, password) { result ->
                    loginLoading = false
                    result.onSuccess {
                        authenticated = true
                        selectedTab = 0
                        loginError = null
                    }.onFailure {
                        loginError = it.message ?: "Sign in failed. Please try again."
                    }
                }
            },
            onOpenWebsite = { onOpenUrl("https://habscosadaqah.org/auth.html") }
        )
    } else {
        ScaffoldNative(
            selectedTab = selectedTab,
            onSelectTab = { selectedTab = it }
        ) { contentModifier ->
            when (selectedTab) {
                0 -> HomeScreen(contentModifier, onSelectTab = { selectedTab = it }, onOpenUrl = onOpenUrl)
                1 -> ServicesScreen(contentModifier, onOpenUrl = onOpenUrl)
                2 -> WalletScreen(
                    contentModifier, onOpenUrl, dashboard, balanceLoading, balanceError,
                    onRefresh = {
                        balanceLoading = true
                        balanceError = null
                        SupabaseNative.loadDashboard(context) { result ->
                            result.onSuccess { dashboard = it; balanceError = null }
                                .onFailure { balanceError = it.message ?: "Could not refresh account." }
                            balanceLoading = false
                        }
                    }
                )
                3 -> CharityScreen(contentModifier, onOpenUrl)
                else -> ProfileScreen(contentModifier, dashboard, onOpenUrl) {
                    SupabaseNative.signOut(context)
                    authenticated = false
                    selectedTab = 0
                }
            }
        }
    }
}

@Composable
private fun NativeLoginScreen(
    loading: Boolean,
    error: String?,
    onLogin: (String, String) -> Unit,
    onOpenWebsite: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    Column(
        Modifier.fillMaxSize().background(Canvas).verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            Modifier.size(72.dp).clip(RoundedCornerShape(22.dp))
                .background(Brush.linearGradient(listOf(Emerald, Forest))),
            contentAlignment = Alignment.Center
        ) { Text("H", color = Gold, fontSize = 42.sp, fontWeight = FontWeight.Black) }
        Spacer(Modifier.height(16.dp))
        Text("HABSCO", color = Forest, fontSize = 26.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
        Text("Finance • Business • Charity", color = Muted, fontSize = 12.sp)
        Spacer(Modifier.height(30.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Sign in securely", color = Forest, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("Use your existing HABSCO member email and password.", color = Muted, fontSize = 13.sp, lineHeight = 19.sp)
                OutlinedTextField(
                    value = email, onValueChange = { email = it.trimStart() },
                    label = { Text("Email address") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = password, onValueChange = { password = it },
                    label = { Text("Password") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth()
                )
                if (!error.isNullOrBlank()) {
                    Text(error, color = Color(0xFFB3261E), fontSize = 12.sp, lineHeight = 17.sp)
                }
                Button(
                    onClick = { onLogin(email.trim(), password) },
                    enabled = !loading && email.isNotBlank() && password.isNotBlank(),
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Forest),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    else Text("Sign in to HABSCO", fontWeight = FontWeight.Bold)
                }
                TextButton(onClick = onOpenWebsite, modifier = Modifier.fillMaxWidth()) {
                    Text("Forgot password or need help? Open secure website", color = Emerald, fontSize = 11.sp)
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        Text("Your password is sent directly to HABSCO Supabase Auth over HTTPS. It is not saved on this device.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
    }
}

@Composable
private fun ScaffoldNative(
    selectedTab: Int,
    onSelectTab: (Int) -> Unit,
    content: @Composable (Modifier) -> Unit
) {
    androidx.compose.material3.Scaffold(
        containerColor = Canvas,
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        bottomBar = {
            NavigationBar(containerColor = Color.White, tonalElevation = 8.dp) {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { onSelectTab(index) },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label, fontSize = 10.sp, maxLines = 1) },
                        alwaysShowLabel = true
                    )
                }
            }
        }
    ) { padding ->
        content(Modifier.fillMaxSize().padding(padding))
    }
}

@Composable
private fun HomeScreen(
    modifier: Modifier,
    onSelectTab: (Int) -> Unit,
    onOpenUrl: (String) -> Unit
) {
    Column(
        modifier = modifier.verticalScroll(rememberScrollState()).padding(horizontal = 18.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier.size(48.dp).clip(RoundedCornerShape(16.dp))
                    .background(Brush.linearGradient(listOf(Emerald, Forest))),
                contentAlignment = Alignment.Center
            ) {
                Text("H", color = Gold, fontSize = 29.sp, fontWeight = FontWeight.Black)
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("HABSCO", fontWeight = FontWeight.Black, fontSize = 19.sp, color = Forest, letterSpacing = 1.3.sp)
                Text("Finance • Business • Charity", color = Muted, fontSize = 11.sp)
            }
            Box(
                modifier = Modifier.size(42.dp).clip(CircleShape).background(Color.White)
                    .clickable { onSelectTab(4) },
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Person, contentDescription = "Profile", tint = Forest)
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(26.dp),
            colors = CardDefaults.cardColors(containerColor = Forest)
        ) {
            Box(
                modifier = Modifier.fillMaxWidth()
                    .background(Brush.linearGradient(listOf(Forest, DeepForest, Color(0xFF12573C))))
                    .padding(22.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("WELCOME TO HABSCO", color = Mint, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
                    Text("Move forward with confidence.", color = Color.White, fontSize = 25.sp, lineHeight = 31.sp, fontWeight = FontWeight.Bold)
                    Text(
                        "Your everyday finance, business services and charitable giving in one place.",
                        color = Color(0xFFD6E8DD), fontSize = 13.sp, lineHeight = 19.sp
                    )
                    Spacer(Modifier.height(2.dp))
                    Button(
                        onClick = { onSelectTab(2) },
                        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Forest),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("View my wallet", fontWeight = FontWeight.Bold)
                        Spacer(Modifier.width(8.dp))
                        Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        SectionTitle("Quick actions", "Manage your money")
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            QuickAction(
                modifier = Modifier.weight(1f),
                title = "Fund wallet",
                icon = Icons.Default.AccountBalanceWallet,
                onClick = { onOpenUrl("https://habscosadaqah.org/member-actions.html?action=fund&v=20261003") }
            )
            QuickAction(
                modifier = Modifier.weight(1f),
                title = "Transfer",
                icon = Icons.Default.ArrowForward,
                onClick = { onOpenUrl("https://habscosadaqah.org/member-actions.html?action=squad-transfer") }
            )
            QuickAction(
                modifier = Modifier.weight(1f),
                title = "Receive",
                icon = Icons.Default.Savings,
                onClick = { onOpenUrl("https://habscosadaqah.org/member-actions.html?action=virtual-account") }
            )
        }

        SectionTitle("Explore services", "Everyday essentials")
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            services.take(4).chunked(2).forEach { pair ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    pair.forEach { service ->
                        ServiceCard(service, Modifier.weight(1f)) { onOpenUrl(service.url) }
                    }
                }
            }
        }
        TextButton(onClick = { onSelectTab(1) }, modifier = Modifier.align(Alignment.End)) {
            Text("View all services", color = Emerald, fontWeight = FontWeight.Bold)
            Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Emerald, modifier = Modifier.padding(start = 6.dp).size(16.dp))
        }

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE4F5EA)),
            shape = RoundedCornerShape(22.dp),
            modifier = Modifier.fillMaxWidth().clickable { onSelectTab(3) }
        ) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Favorite, contentDescription = null, tint = Emerald, modifier = Modifier.size(30.dp))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("Give with purpose", fontWeight = FontWeight.Bold, color = Forest, fontSize = 16.sp)
                    Text("Support sadaqah jariyah projects and build a lasting legacy.", color = Muted, fontSize = 12.sp)
                }
                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Forest)
            }
        }

        Card(
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth().clickable { onOpenUrl("https://habscosadaqah.org/how-to-guides.html") }
        ) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.MenuBook, contentDescription = null, tint = Emerald, modifier = Modifier.size(25.dp))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("How-to guides", color = Ink, fontWeight = FontWeight.Bold)
                    Text("Learn how to use HABSCO services.", color = Muted, fontSize = 12.sp)
                }
                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Muted)
            }
        }
        Spacer(Modifier.height(10.dp))
    }
}

@Composable
private fun ServicesScreen(modifier: Modifier, onOpenUrl: (String) -> Unit) {
    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        ScreenHeader("Services", "Your everyday essentials")
        services.chunked(2).forEach { pair ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                pair.forEach { service -> ServiceCard(service, Modifier.weight(1f)) { onOpenUrl(service.url) } }
                if (pair.size == 1) Spacer(Modifier.weight(1f))
            }
        }
        ServiceLink("Interest-Free Loan", "Explore eligible member loan services", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member.html")
        }
        ServiceLink("Wallet & Transfers", "Funding, receiving and sending money", Icons.Default.AccountBalanceWallet) {
            onOpenUrl("https://habscosadaqah.org/member.html")
        }
        ServiceLink("Flyers & Guides", "Daily PNG flyers and tutorials", Icons.Default.MenuBook) {
            onOpenUrl("https://habscosadaqah.org/how-to-guides.html")
        }
    }
}

@Composable
private fun WalletScreen(
    modifier: Modifier,
    onOpenUrl: (String) -> Unit,
    dashboard: NativeDashboard?,
    loading: Boolean,
    error: String?,
    onRefresh: () -> Unit
) {
    fun money(value: Double?): String = value?.let {
        java.text.NumberFormat.getCurrencyInstance(java.util.Locale("en", "NG")).apply {
            currency = java.util.Currency.getInstance("NGN")
            minimumFractionDigits = 2
            maximumFractionDigits = 2
        }.format(it)
    } ?: "—"

    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        ScreenHeader("My wallet", "Connected to your HABSCO member account")
        Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = Forest), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("AVAILABLE WALLET BALANCE", color = Mint, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text(money(dashboard?.wallet), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 30.sp)
                Text(dashboard?.fullName ?: "Loading your member account…", color = Color(0xFFD6E8DD), fontSize = 13.sp)
                if (loading) CircularProgressIndicator(Modifier.size(22.dp), color = Gold, strokeWidth = 2.dp)
                if (!error.isNullOrBlank()) Text(error, color = Color(0xFFFFD7D2), fontSize = 12.sp, lineHeight = 17.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = onRefresh,
                        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Forest),
                        modifier = Modifier.weight(1f)
                    ) { Text("Refresh balance", fontWeight = FontWeight.Bold) }
                    TextButton(onClick = { onOpenUrl("https://habscosadaqah.org/member.html") }) {
                        Text("Website", color = Color.White)
                    }
                }
            }
        }
        ScreenHeader("Account balances", "Live values returned by HABSCO")
        Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
            BalanceRow("Savings", money(dashboard?.savings))
            BalanceRow("Shares", money(dashboard?.shares))
            BalanceRow("Special savings", money(dashboard?.specialSavings))
            BalanceRow("Dividends", money(dashboard?.dividend))
            BalanceRow("Total", money(dashboard?.total))
        }
        ScreenHeader("Recent transactions", "Latest entries from your HABSCO statement")
        if (dashboard?.transactions.isNullOrEmpty()) {
            Text("No recent transactions are available, or the statement service could not be reached.", color = Muted, fontSize = 12.sp, lineHeight = 18.sp)
        } else {
            dashboard!!.transactions.forEach { transaction ->
                val credit = transaction.direction in listOf("credit", "inflow", "in")
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        Modifier.fillMaxWidth().padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            Modifier.size(36.dp).clip(CircleShape)
                                .background(if (credit) Color(0xFFE1F5E8) else Color(0xFFFFE9E5)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(if (credit) "↓" else "↑", color = if (credit) Emerald else Color(0xFFB3261E), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(transaction.type.ifBlank { "Transaction" }, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            if (transaction.description.isNotBlank()) {
                                Text(transaction.description, color = Muted, fontSize = 11.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            }
                            Text(
                                listOf(transaction.createdAt.take(10), transaction.status, transaction.reference).filter { it.isNotBlank() }.joinToString(" · "),
                                color = Muted, fontSize = 9.sp, maxLines = 2, overflow = TextOverflow.Ellipsis
                            )
                        }
                        Spacer(Modifier.width(8.dp))
                        Text(
                            (if (credit) "+" else "−") + money(transaction.amount),
                            color = if (credit) Emerald else Color(0xFFB3261E),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }
        Button(
            onClick = { onOpenUrl("https://habscosadaqah.org/member.html") },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Forest)
        ) { Text("Open full statement", fontWeight = FontWeight.Bold) }

        ServiceLink("Fund wallet", "Open the existing verified funding workflow", Icons.Default.AccountBalanceWallet) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=fund&v=20261003")
        }
        ServiceLink("Transfer money", "Continue to the existing transfer workflow", Icons.Default.ArrowForward) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=squad-transfer")
        }
        ServiceLink("Receive money", "Manage your HABSCO receiving account", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=virtual-account")
        }
        Text("Funding, bank transfers and receiving-account changes still use the existing secure HABSCO website workflow.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
    }
}

@Composable
private fun BalanceRow(label: String, amount: String) {
    Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 15.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(label, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
            Text(amount, color = Forest, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun CharityScreen(modifier: Modifier, onOpenUrl: (String) -> Unit) {
    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        ScreenHeader("Sadaqah Jariyah", "Build a legacy that continues")
        Card(shape = RoundedCornerShape(26.dp), colors = CardDefaults.cardColors(containerColor = Forest), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Icon(Icons.Default.Favorite, contentDescription = null, tint = Gold, modifier = Modifier.size(34.dp))
                Text("Give today. Benefit tomorrow.", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 23.sp)
                Text(
                    "Support sustainable community projects through HABSCO Sadaqah Jariyah Development Trust.",
                    color = Color(0xFFD6E8DD), fontSize = 13.sp, lineHeight = 20.sp
                )
                Divider(color = Color(0xFF315848))
                Text("Project areas", color = Mint, fontWeight = FontWeight.Bold)
                Text("• Waqf shops\n• Solar-powered boreholes\n• Free vocational learning\n• Empowerment programmes", color = Color.White, lineHeight = 24.sp)
                Button(
                    onClick = { onOpenUrl("https://habscosadaqah.org/") },
                    colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Forest),
                    modifier = Modifier.fillMaxWidth()
                ) { Text("Continue to donation options", fontWeight = FontWeight.Bold) }
            }
        }
        Text("Please verify the project and payment details before confirming a donation.", color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun ProfileScreen(
    modifier: Modifier,
    dashboard: NativeDashboard?,
    onOpenUrl: (String) -> Unit,
    onSignOut: () -> Unit
) {
    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        ScreenHeader("Account", "Your signed-in HABSCO membership")
        Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(54.dp).clip(CircleShape).background(Color(0xFFE4F5EA)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = Emerald, modifier = Modifier.size(30.dp))
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(dashboard?.fullName ?: "HABSCO Member", color = Ink, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    Text(dashboard?.email ?: "Account details loading", color = Muted, fontSize = 12.sp)
                    if (!dashboard?.memberId.isNullOrBlank()) {
                        Text("Member ID: ${dashboard?.memberId}", color = Emerald, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        ServiceLink("Privacy policy", "Read how HABSCO handles information", Icons.Default.Security) {
            onOpenUrl("https://habscosadaqah.org/privacy-policy.html")
        }
        ServiceLink("How-to guides", "Learn about available services", Icons.Default.MenuBook) {
            onOpenUrl("https://habscosadaqah.org/how-to-guides.html")
        }
        Button(
            onClick = onSignOut,
            colors = ButtonDefaults.buttonColors(containerColor = Forest),
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(15.dp)
        ) { Text("Sign out securely", fontWeight = FontWeight.Bold) }
        Text("HABSCO Sadaqah Jariyah Development Trust", color = Muted, fontSize = 11.sp)
        Text("Finance • Business • Charity", color = Muted, fontSize = 11.sp)
    }
}

@Composable
private fun ScreenHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text(title, color = Forest, fontSize = 27.sp, fontWeight = FontWeight.ExtraBold)
        Text(subtitle, color = Muted, fontSize = 13.sp)
    }
}

@Composable
private fun SectionTitle(title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.Bottom, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(title, color = Forest, fontWeight = FontWeight.Bold, fontSize = 19.sp)
            Text(subtitle, color = Muted, fontSize = 12.sp)
        }
    }
}

@Composable
private fun QuickAction(
    modifier: Modifier,
    title: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 15.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(9.dp)
        ) {
            Box(Modifier.size(42.dp).clip(RoundedCornerShape(14.dp)).background(Color(0xFFE4F5EA)), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = Emerald, modifier = Modifier.size(22.dp))
            }
            Text(title, color = Ink, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun ServiceCard(service: ServiceItem, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        shape = RoundedCornerShape(19.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
            Box(Modifier.size(42.dp).clip(RoundedCornerShape(14.dp)).background(service.tint), contentAlignment = Alignment.Center) {
                Icon(service.icon, contentDescription = null, tint = Forest, modifier = Modifier.size(22.dp))
            }
            Text(service.title, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(service.subtitle, color = Muted, fontSize = 11.sp, maxLines = 2, lineHeight = 15.sp)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Open", color = Emerald, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(4.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Emerald, modifier = Modifier.size(13.dp))
            }
        }
    }
}

@Composable
private fun ServiceLink(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(Color(0xFFE4F5EA)), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = Emerald, modifier = Modifier.size(22.dp))
            }
            Spacer(Modifier.width(13.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text(subtitle, color = Muted, fontSize = 11.sp, lineHeight = 15.sp)
            }
            Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Muted)
        }
    }
}
