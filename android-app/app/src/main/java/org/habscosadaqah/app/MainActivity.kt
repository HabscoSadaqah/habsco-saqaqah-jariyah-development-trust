package org.habscosadaqah.app

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
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

    fun rpc(context: android.content.Context, name: String, body: JSONObject, callback: (Result<JSONObject>) -> Unit) {
        io.execute {
            val result = runCatching {
                val token = sessionToken(context)
                val raw = request("POST", "/rest/v1/rpc/" + name, token, body)
                runCatching { JSONObject(raw) }.getOrElse { JSONObject().put("result", raw) }
            }
            main.post { callback(result) }
        }
    }

    fun edge(context: android.content.Context, function: String, body: JSONObject, callback: (Result<JSONObject>) -> Unit) {
        io.execute {
            val result = runCatching {
                val token = sessionToken(context)
                JSONObject(request("POST", "/functions/v1/" + function, token, body))
            }
            main.post { callback(result) }
        }
    }

    fun billvending(context: android.content.Context, body: JSONObject, callback: (Result<JSONObject>) -> Unit) {
        io.execute {
            val result = runCatching {
                val token = sessionToken(context)
                JSONObject(request("POST", "/functions/v1/accelerate-billvending", token, body))
            }
            main.post { callback(result) }
        }
    }

    fun loadVirtualAccount(context: android.content.Context, callback: (Result<JSONObject?>) -> Unit) {
        io.execute {
            val result = runCatching {
                val token = sessionToken(context)
                val response = request(
                    "POST", "/functions/v1/squad-virtual-account", token,
                    JSONObject().put("action", "get")
                )
                JSONObject(response).optJSONObject("data")
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
                fun parseBalance(balanceText: String): JSONObject = when {
                    balanceText.trimStart().startsWith("[") -> {
                        val rows = JSONArray(balanceText)
                        if (rows.length() == 0) JSONObject() else rows.getJSONObject(0)
                    }
                    balanceText.trimStart().startsWith("{") -> JSONObject(balanceText)
                    else -> JSONObject()
                }
                val balance = runCatching {
                    parseBalance(request("POST", "/rest/v1/rpc/member_dashboard_balances", token, JSONObject()))
                }.getOrElse {
                    // Existing member website uses this fallback RPC for the same signed-in member.
                    parseBalance(request(
                        "POST", "/rest/v1/rpc/get_unified_member_balance", token,
                        JSONObject().put("p_user_id", userId)
                    ))
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
    val action: String,
    val url: String
)

private val services = listOf(
    ServiceItem("Airtime", "Top up a phone", Icons.Default.PhoneAndroid, Color(0xFFDCF5E8), "airtime", "https://habscosadaqah.org/member-actions.html?action=airtime"),
    ServiceItem("Data", "Internet bundles", Icons.Default.Wifi, Color(0xFFDCEBFF), "data", "https://habscosadaqah.org/member-actions.html?action=data"),
    ServiceItem("Electricity", "Pay utility bills", Icons.Default.Bolt, Color(0xFFFFF0C7), "power", "https://habscosadaqah.org/member-actions.html?action=electricity"),
    ServiceItem("TV", "Renew subscriptions", Icons.Default.Tv, Color(0xFFF0E5FF), "tv", "https://habscosadaqah.org/member-actions.html?action=tv"),
    ServiceItem("Education", "Education payments", Icons.Default.School, Color(0xFFFFE6DF), "education", "https://habscosadaqah.org/member-actions.html?action=education"),
    ServiceItem("Savings & Shares", "Build your future", Icons.Default.Savings, Color(0xFFDDF4F2), "savings", "https://habscosadaqah.org/member-actions.html?action=save")
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
                HabscoNativeApp()
            }
        }
    }

}

@Composable
private fun HabscoNativeApp() {
    val context = LocalContext.current
    var authenticated by remember { mutableStateOf(SupabaseNative.hasSession(context)) }
    var selectedTab by remember { mutableStateOf(0) }
    var loginLoading by remember { mutableStateOf(false) }
    var loginError by remember { mutableStateOf<String?>(null) }
    var dashboard by remember { mutableStateOf<NativeDashboard?>(null) }
    var balanceLoading by remember { mutableStateOf(false) }
    var balanceError by remember { mutableStateOf<String?>(null) }
    var selectedService by remember { mutableStateOf<ServiceItem?>(null) }
    var selectedRoute by remember { mutableStateOf<String?>(null) }
    val onOpenUrl: (String) -> Unit = { url ->
        val action = Regex("[?&]action=([^&]+)").find(url)?.groupValues?.get(1)?.lowercase()
        selectedRoute = when {
            action == "fund" -> "fund"
            action == "savings" || action == "save" -> "save"
            action == "squad-transfer" || action == "money-services" -> "squad-transfer"
            action == "member-transfer" || action == "peer-transfer" -> "peer-transfer"
            action == "virtual-account" -> "virtual-account"
            action == "airtime" -> "airtime"
            action == "data" -> "data"
            action == "electricity" || action == "power" -> "power"
            action == "tv" -> "tv"
            action == "education" -> "education"
            action == "qard" -> "qard"
            action == "save" -> "save"
            action == "shares" -> "shares"
            action == "dividend" -> "dividend"
            action == "repayment" -> "repayment"
            url.contains("privacy-policy") -> "privacy"
            url.contains("how-to-guides") -> "guides"
            url.contains("member.html") -> "statement"
            url.contains("auth.html") -> "auth"
            else -> "donate"
        }
    }

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

    BackHandler(enabled = authenticated && (selectedService != null || selectedRoute != null || selectedTab != 0)) {
        when {
            selectedRoute != null -> selectedRoute = null
            selectedService != null -> selectedService = null
            else -> selectedTab = 0
        }
    }

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
            onOpenWebsite = { loginError = "Native registration and password recovery are not yet available. This app will not open the website; contact HABSCO support for account assistance." }
        )
    } else if (selectedRoute != null && selectedRoute in listOf("airtime", "data", "power", "tv", "education")) {
        NativeUtilityScreen(service = services.first { it.action == selectedRoute }, onBack = { selectedRoute = null }, onOpenUrl = onOpenUrl)
    } else if (selectedRoute != null) {
        NativeAccountServiceScreen(action = selectedRoute!!, onBack = { selectedRoute = null }, onRefresh = {
            balanceLoading = true
            SupabaseNative.loadDashboard(context) { result ->
                result.onSuccess { dashboard = it; balanceError = null }
                    .onFailure { balanceError = it.message ?: "Could not refresh account." }
                balanceLoading = false
            }
        })
    } else if (selectedService != null) {
        if (selectedService!!.action in listOf("airtime", "data", "power", "tv", "education")) {
            NativeUtilityScreen(service = selectedService!!, onBack = { selectedService = null }, onOpenUrl = onOpenUrl)
        } else {
            NativeAccountServiceScreen(action = selectedService!!.action, onBack = { selectedService = null }, onRefresh = { selectedService = null })
        }
    } else {
        val openService: (ServiceItem) -> Unit = { item ->
            if (item.action in listOf("airtime", "data", "power", "tv", "education")) selectedService = item
            else selectedRoute = if (item.action == "savings") "save" else item.action
        }
        ScaffoldNative(
            selectedTab = selectedTab,
            onSelectTab = { selectedTab = it }
        ) { contentModifier ->
            when (selectedTab) {
                0 -> HomeScreen(contentModifier, onSelectTab = { selectedTab = it }, onOpenUrl = onOpenUrl, onOpenService = openService)
                1 -> ServicesScreen(contentModifier, onOpenUrl = onOpenUrl, onOpenService = openService)
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
    onOpenUrl: (String) -> Unit,
    onOpenService: (ServiceItem) -> Unit
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
                onClick = { onSelectTab(2) }
            )
        }

        SectionTitle("Explore services", "Everyday essentials")
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            services.take(4).chunked(2).forEach { pair ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    pair.forEach { service ->
                        ServiceCard(service, Modifier.weight(1f)) { onOpenService(service) }
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
private fun NativeUtilityScreen(
    service: ServiceItem,
    onBack: () -> Unit,
    onOpenUrl: (String) -> Unit
) {
    val context = LocalContext.current
    var provider by remember(service.action) { mutableStateOf("") }
    var receiver by remember(service.action) { mutableStateOf("") }
    var amount by remember(service.action) { mutableStateOf("") }
    var packageCode by remember(service.action) { mutableStateOf("") }
    var meterType by remember(service.action) { mutableStateOf("PREPAID") }
    var phone by remember(service.action) { mutableStateOf("") }
    var pin by remember(service.action) { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf(false) }
    var choices by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
    var choiceTitle by remember { mutableStateOf<String?>(null) }
    var showConfirm by remember { mutableStateOf(false) }

    fun displayName(obj: JSONObject): String {
        return listOf("name", "provider_name", "short_name", "provider", "disco", "description", "package_name", "variation_name", "title")
            .firstNotNullOfOrNull { key -> obj.optString(key).takeIf { it.isNotBlank() && it != "null" } }
            ?: obj.optString("code").ifBlank { obj.optString("id") }
    }
    fun displayCode(obj: JSONObject): String {
        return listOf("code", "provider_code", "short_name", "provider", "variation_code", "package_code", "id")
            .firstNotNullOfOrNull { key -> obj.optString(key).takeIf { it.isNotBlank() && it != "null" } }
            ?: displayName(obj)
    }
    fun options(value: Any?): List<Pair<String, String>> {
        val out = mutableListOf<Pair<String, String>>()
        fun walk(v: Any?, depth: Int) {
            if (depth > 7 || out.size >= 100 || v == null || v == JSONObject.NULL) return
            when (v) {
                is JSONArray -> for (i in 0 until v.length()) walk(v.opt(i), depth + 1)
                is JSONObject -> {
                    val label = displayName(v)
                    val code = displayCode(v)
                    if (label.isNotBlank() && code.isNotBlank() &&
                        (v.has("code") || v.has("provider") || v.has("provider_name") || v.has("short_name") ||
                         v.has("variation_code") || v.has("package_code") || v.has("package_name") || v.has("name"))) {
                        val suffix = listOf("amount", "price", "price_amount", "variation_amount")
                            .firstNotNullOfOrNull { key -> v.opt(key)?.toString()?.takeIf { it.isNotBlank() && it != "null" } }
                        out.add((if (suffix != null) "$label · $suffix" else label) to code)
                    } else {
                        val keys = v.keys()
                        while (keys.hasNext()) walk(v.opt(keys.next()), depth + 1)
                    }
                }
            }
        }
        walk(value, 0)
        return out.distinctBy { it.second }.take(100)
    }
    fun runLookup(action: String, body: JSONObject = JSONObject()) {
        busy = true
        message = null
        choices = emptyList()
        choiceTitle = null
        SupabaseNative.billvending(context, JSONObject(body.toString()).put("action", action)) { result ->
            busy = false
            result.onSuccess { json ->
                if (json.optBoolean("success", true)) {
                    val data = json.opt("data")
                    val found = options(data)
                    choices = found
                    choiceTitle = when {
                        action.endsWith("-providers") || action == "power-providers" -> "Choose a provider"
                        else -> "Choose a package"
                    }
                    message = if (found.isEmpty()) json.toString() else "Choose an option below, or enter its code manually."
                    error = false
                } else {
                    message = json.optString("error").ifBlank { "Unable to load options." }
                    error = true
                }
            }.onFailure {
                message = it.message ?: "Unable to load options."
                error = true
            }
        }
    }
    fun performPurchase() {
        val value = amount.toDoubleOrNull()
        if (provider.isBlank()) { message = "Enter or choose the service provider."; error = true; return }
        if (receiver.isBlank()) { message = if (service.action == "power") "Enter your meter number." else "Enter the recipient number or account identifier."; error = true; return }
        if (service.action in listOf("airtime", "power") && (value == null || value <= 0)) { message = "Enter a valid amount."; error = true; return }
        if (service.action in listOf("data", "education") && packageCode.isBlank()) { message = "Enter or choose the package/code."; error = true; return }
        if (service.action == "tv" && packageCode.isBlank()) { message = "Enter or choose the TV package."; error = true; return }
        if (!pin.matches(Regex("^\\d{6}$"))) { message = "Enter your 6-digit transaction PIN."; error = true; return }
        showConfirm = true
    }

    Column(
        Modifier.fillMaxSize().background(Canvas).verticalScroll(rememberScrollState())
            .padding(horizontal = 18.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(13.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            TextButton(onClick = onBack) { Text("← Back", color = Emerald, fontWeight = FontWeight.Bold) }
            Column(Modifier.weight(1f)) {
                Text(service.title, color = Forest, fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("Secure HABSCO member service", color = Muted, fontSize = 12.sp)
            }
        }
        Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Service details", color = Forest, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                OutlinedTextField(value = provider, onValueChange = { provider = it }, label = { Text("Provider / network code") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                Button(
                    onClick = { runLookup(if (service.action == "power") "power-providers" else "${service.action}-providers") },
                    enabled = !busy, modifier = Modifier.fillMaxWidth()
                ) { Text(if (busy) "Loading…" else "Load providers") }

                if (service.action == "power") {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("PREPAID", "POSTPAID").forEach { option ->
                            TextButton(onClick = { meterType = option }) {
                                Text((if (meterType == option) "✓ " else "") + option, color = if (meterType == option) Emerald else Muted)
                            }
                        }
                    }
                }
                OutlinedTextField(
                    value = receiver, onValueChange = { receiver = it },
                    label = { Text(if (service.action == "power") "Meter number" else if (service.action == "tv") "Smart-card / decoder number" else if (service.action == "education") "Candidate / recipient number" else "Phone number") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                if (service.action in listOf("airtime", "power")) {
                    OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Amount (NGN)") }, modifier = Modifier.fillMaxWidth(), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
                }
                if (service.action in listOf("data", "tv", "education")) {
                    OutlinedTextField(value = packageCode, onValueChange = { packageCode = it }, label = { Text(if (service.action == "tv") "TV package code" else if (service.action == "education") "Education product / exam code" else "Data package code") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    Button(
                        onClick = {
                            val lookup = if (service.action == "data") "data-packages" else if (service.action == "tv") "tv-packages" else "education-packages"
                            runLookup(lookup, JSONObject().put("provider", provider))
                        },
                        enabled = !busy && provider.isNotBlank(), modifier = Modifier.fillMaxWidth()
                    ) { Text("Load available packages") }
                }
                if (service.action == "tv" || service.action == "education" || service.action == "power") {
                    OutlinedTextField(value = phone, onValueChange = { phone = it.filter { c -> c.isDigit() || c == '+' } }, label = { Text("Contact phone (optional)") }, modifier = Modifier.fillMaxWidth(), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone))
                }
                OutlinedTextField(value = pin, onValueChange = { pin = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit transaction PIN") }, modifier = Modifier.fillMaxWidth(), singleLine = true, visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword))
                Text("Your PIN is sent only to HABSCO’s authenticated transaction service. Never share it with anyone.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
                Button(
                    onClick = { performPurchase() },
                    enabled = !busy, modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Forest),
                    shape = RoundedCornerShape(14.dp)
                ) { Text("Review purchase", fontWeight = FontWeight.Bold) }
            }
        }
        if (choices.isNotEmpty()) {
            Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(choiceTitle ?: "Available options", color = Forest, fontWeight = FontWeight.Bold)
                    choices.take(30).forEach { (label, code) ->
                        TextButton(
                            onClick = {
                                if (choiceTitle == "Choose a provider") provider = code
                                else packageCode = code
                                message = "Selected: $label"
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) { Text("$label  [$code]", color = Ink) }
                    }
                }
            }
        }
        message?.let {
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = if (error) Color(0xFFFFE8E5) else Color(0xFFE4F5EA))) {
                Text(it, Modifier.padding(14.dp), color = if (error) Color(0xFF9E2F24) else Forest, fontSize = 12.sp, lineHeight = 17.sp)
            }
        }
        Text("Transactions are checked against your HABSCO wallet, PIN and provider response. Do not repeat a pending purchase; contact support or recheck its reference.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
    }

    if (showConfirm) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { showConfirm = false },
            title = { Text("Confirm ${service.title}") },
            text = {
                Text(
                    "${service.title} purchase\nProvider: $provider\nRecipient: $receiver" +
                        (if (amount.isNotBlank()) "\nAmount: ₦$amount" else "") +
                        (if (packageCode.isNotBlank()) "\nPackage: $packageCode" else "") +
                        "\n\nThis will submit a real transaction using your HABSCO wallet."
                )
            },
            confirmButton = {
                Button(onClick = {
                    showConfirm = false
                    busy = true
                    message = null
                    error = false
                    val payload = JSONObject()
                        .put("action", service.action)
                        .put("provider", provider.trim())
                        .put("receiver", receiver.trim())
                        .put("transaction_pin", pin)
                    if (amount.isNotBlank()) payload.put("amount", amount.toDoubleOrNull() ?: 0.0)
                    if (packageCode.isNotBlank()) {
                        if (service.action == "tv") payload.put("package", packageCode.trim())
                        else payload.put("code", packageCode.trim())
                    }
                    if (service.action == "power") {
                        payload.put("meter_type", meterType)
                        if (phone.isNotBlank()) payload.put("phone_number", phone.trim())
                    }
                    if (phone.isNotBlank() && service.action == "tv") payload.put("phone_number", phone.trim())
                    if (phone.isNotBlank() && service.action == "education") payload.put("phone_number", phone.trim())
                    SupabaseNative.billvending(context, payload) { result ->
                        busy = false
                        result.onSuccess { json ->
                            val success = json.optBoolean("success", false)
                            val pending = json.optBoolean("pending", false)
                            val ref = json.optString("reference")
                            message = when {
                                pending -> "Transaction is pending. Reference: $ref. Do not submit it again; recheck the reference later."
                                success -> "Purchase submitted successfully. Reference: $ref"
                                else -> json.optString("error").ifBlank { "Purchase was not confirmed. Check transaction history before trying again." } + if (ref.isNotBlank()) "\nReference: $ref" else ""
                            }
                            error = !success && !pending
                            pin = ""
                        }.onFailure {
                            message = it.message ?: "Transaction request failed. Check your statement before retrying."
                            error = true
                        }
                    }
                }, enabled = !busy) { Text("Confirm & pay") }
            },
            dismissButton = { TextButton(onClick = { showConfirm = false }) { Text("Cancel") } }
        )
    }
}


@Composable
private fun NativeAccountServiceScreen(action: String, onBack: () -> Unit, onRefresh: () -> Unit) {
    val context = LocalContext.current
    var amount by remember(action) { mutableStateOf("") }
    var purpose by remember(action) { mutableStateOf("") }
    var plan by remember(action) { mutableStateOf("monthly") }
    var pin by remember(action) { mutableStateOf("") }
    var frequency by remember(action) { mutableStateOf("monthly") }
    var reference by remember(action) { mutableStateOf("") }
    var qardId by remember(action) { mutableStateOf("") }
    var bankCode by remember(action) { mutableStateOf("") }
    var accountNumber by remember(action) { mutableStateOf("") }
    var accountName by remember(action) { mutableStateOf("") }
    var bankOptions by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf(false) }
    var receiving by remember { mutableStateOf<JSONObject?>(null) }
    var accountLoading by remember { mutableStateOf(false) }
    var firstName by remember(action) { mutableStateOf("") }
    var lastName by remember(action) { mutableStateOf("") }
    var mobile by remember(action) { mutableStateOf("") }
    var dob by remember(action) { mutableStateOf("") }
    var bvn by remember(action) { mutableStateOf("") }
    var gender by remember(action) { mutableStateOf("male") }
    var address by remember(action) { mutableStateOf("") }

    fun rpc(name: String, body: JSONObject) {
        busy = true; message = null; error = false
        SupabaseNative.rpc(context, name, body) { result ->
            busy = false
            result.onSuccess {
                message = "Request completed. " + it.toString().take(420)
                error = false; pin = ""; onRefresh()
            }.onFailure { message = it.message ?: "Request failed."; error = true }
        }
    }
    fun edge(function: String, body: JSONObject) {
        busy = true; message = null; error = false
        SupabaseNative.edge(context, function, body) { result ->
            busy = false
            result.onSuccess {
                val ok = it.optBoolean("success", true) && !it.has("error")
                message = if (ok) it.toString().take(650) else it.optString("error").ifBlank { it.toString() }
                error = !ok
                if (action == "virtual-account" && ok) receiving = it.optJSONObject("data")
                if (action == "squad-transfer" && ok) {
                    accountName = it.optString("account_name", accountName)
                    if (it.has("status") && it.optString("status") == "processing") message = "Transfer is processing. Do not retry. Reference: " + it.optString("reference")
                    if (it.optString("status") == "successful") pin = ""
                }
                if (ok) onRefresh()
            }.onFailure { message = it.message ?: "Request failed."; error = true }
        }
    }
    val title = when (action) {
        "fund" -> "Fund wallet"; "squad-transfer" -> "Transfer to bank"; "peer-transfer" -> "Transfer to member"; "virtual-account" -> "Receive money"
        "qard" -> "Interest-free loan"; "repayment" -> "Loan repayment"; "save" -> "Savings"
        "shares" -> "Shares"; "dividend" -> "Dividend account"; "guides" -> "HABSCO service guides"
        "privacy" -> "Privacy & security"; "statement" -> "Account statement"; "auth" -> "Account access"; else -> "Sadaqah Jariyah donation"
    }
    LaunchedEffect(action) {
        if (action == "virtual-account" || action == "fund") {
            accountLoading = true
            SupabaseNative.loadVirtualAccount(context) { r ->
                accountLoading = false
                r.onSuccess { receiving = it }.onFailure { message = it.message ?: "Could not load account."; error = true }
            }
        }
        if (action == "squad-transfer") {
            SupabaseNative.edge(context, "squad-bank-transfer", JSONObject().put("action", "banks")) { r ->
                r.onSuccess { json ->
                    val root = json.optJSONArray("data") ?: json.optJSONArray("banks") ?: json.optJSONObject("data")?.optJSONArray("data")
                    val opts = mutableListOf<Pair<String, String>>()
                    if (root != null) for (i in 0 until root.length()) {
                        val row = root.optJSONObject(i) ?: continue
                        val code = row.optString("bank_code").ifBlank { row.optString("code") }.ifBlank { row.optString("bankCode") }
                        val name = row.optString("name").ifBlank { row.optString("bank_name") }.ifBlank { row.optString("bankName") }
                        if (code.isNotBlank() && name.isNotBlank()) opts.add(name to code)
                    }
                    bankOptions = opts.distinctBy { it.second }
                    if (bankOptions.isEmpty()) { message = "Bank list response could not be read. You can enter the bank code."; error = true }
                }.onFailure { message = it.message ?: "Unable to load banks."; error = true }
            }
        }
    }
    Column(Modifier.fillMaxSize().background(Canvas).verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("← Back", color = Emerald, fontWeight = FontWeight.Bold) }
            Text(title, color = Forest, fontSize = 23.sp, fontWeight = FontWeight.ExtraBold)
        }
        when (action) {
            "fund" -> {
                Text("You can fund the wallet by transferring to your registered HABSCO receiving account below. The app will not open a website.", color = Muted, fontSize = 13.sp)
                if (accountLoading) CircularProgressIndicator(color = Emerald)
                receiving?.let { acct ->
                    Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(15.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                            Text("Bank transfer funding", color = Forest, fontWeight = FontWeight.Bold)
                            BalanceRow("Account number", acct.optString("virtual_account_number", "—"))
                            BalanceRow("Bank code", acct.optString("bank_code", "—"))
                            BalanceRow("Status", acct.optString("status", "—"))
                            Text("Send your bank transfer to this account. Credits are posted after the provider webhook confirms settlement.", color = Muted, fontSize = 11.sp)
                        }
                    }
                }
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Amount (minimum ₦100)") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                Button(onClick = {
                    val v = amount.toDoubleOrNull()
                    if (v == null || v < 100) { message = "Enter at least ₦100."; error = true }
                    else edge("accelerate-wallet-funding", JSONObject().put("action", "create_payment_link").put("amount", v))
                }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Create funding request") }
                Text("Card checkout is not opened because the current provider only supplies a hosted checkout URL. Bank-transfer funding through the receiving account above remains in-app and does not redirect.", color = Muted, fontSize = 11.sp)
            }
            "squad-transfer" -> {
                Text("Choose a bank or enter its bank code.", color = Muted, fontSize = 12.sp)
                bankOptions.take(50).forEach { (name, code) ->
                    TextButton(onClick = { bankCode = code; message = "Selected $name ($code)"; error = false }, modifier = Modifier.fillMaxWidth()) {
                        Text((if (bankCode == code) "✓ " else "") + name, color = Ink)
                    }
                }
                OutlinedTextField(value = bankCode, onValueChange = { bankCode = it.trim() }, label = { Text("Bank code") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = accountNumber, onValueChange = { accountNumber = it.filter(Char::isDigit).take(10); accountName = "" }, label = { Text("10-digit account number") }, modifier = Modifier.fillMaxWidth(), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
                Button(onClick = {
                    if (bankCode.isBlank() || accountNumber.length != 10) { message = "Select a bank and enter a 10-digit account number."; error = true }
                    else edge("squad-bank-transfer", JSONObject().put("action", "resolve").put("bank_code", bankCode).put("account_number", accountNumber))
                }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Verify account") }
                OutlinedTextField(value = accountName, onValueChange = { accountName = it }, label = { Text("Verified account name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Amount (NGN)") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = pin, onValueChange = { pin = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit transaction PIN") }, modifier = Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), singleLine = true)
                Button(onClick = {
                    val v = amount.toDoubleOrNull()
                    if (bankCode.isBlank() || accountNumber.length != 10 || accountName.isBlank() || v == null || v <= 0 || pin.length != 6) { message = "Verify the account and complete every field."; error = true }
                    else edge("squad-bank-transfer", JSONObject().put("action", "transfer").put("bank_code", bankCode).put("account_number", accountNumber).put("account_name", accountName).put("amount", v).put("transaction_pin", pin))
                }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Confirm transfer") }
                Text("If a transfer is processing, do not submit it again. Keep the reference and recheck its status.", color = Muted, fontSize = 11.sp)
            }
            "virtual-account" -> {
                if (accountLoading) CircularProgressIndicator(color = Emerald)
                if (receiving != null) {
                    BalanceRow("Account number", receiving!!.optString("virtual_account_number", "—"))
                    BalanceRow("Bank code", receiving!!.optString("bank_code", "—"))
                    BalanceRow("Status", receiving!!.optString("status", "—"))
                } else {
                    Text("Create your receiving account within the app. Enter your verified personal details.", color = Muted, fontSize = 12.sp)
                    OutlinedTextField(value = firstName, onValueChange = { firstName = it }, label = { Text("First name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Last name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(value = mobile, onValueChange = { mobile = it.filter { c -> c.isDigit() || c == '+' }.take(15) }, label = { Text("Mobile number") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), singleLine = true)
                    OutlinedTextField(value = dob, onValueChange = { dob = it }, label = { Text("Date of birth (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(value = bvn, onValueChange = { bvn = it.filter(Char::isDigit).take(11) }, label = { Text("BVN (11 digits)") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), visualTransformation = PasswordVisualTransformation(), singleLine = true)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { listOf("male", "female").forEach { g -> TextButton(onClick = { gender = g }) { Text((if (gender == g) "✓ " else "") + g.replaceFirstChar { it.uppercase() }, color = Emerald) } } }
                    OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Residential address") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        if (firstName.isBlank() || lastName.isBlank() || mobile.isBlank() || !dob.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$")) || bvn.length != 11 || address.isBlank()) { message = "Complete all fields and check date and BVN."; error = true }
                        else edge("squad-virtual-account", JSONObject().put("action", "create").put("profile", JSONObject().put("first_name", firstName).put("last_name", lastName).put("mobile_num", mobile).put("dob", dob).put("bvn", bvn).put("gender", gender).put("address", address)))
                    }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Create receiving account") }
                }
            }
            "peer-transfer" -> {
                OutlinedTextField(value = qardId, onValueChange = { qardId = it.trim().uppercase() }, label = { Text("Recipient HABSCO member ID") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Amount (NGN)") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = purpose, onValueChange = { purpose = it }, label = { Text("Transfer description (optional)") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = pin, onValueChange = { pin = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit transaction PIN") }, modifier = Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), singleLine = true)
                Button(onClick = { val v = amount.toDoubleOrNull(); if (qardId.isBlank() || v == null || v <= 0 || pin.length != 6) { message = "Enter recipient member ID, valid amount and 6-digit PIN."; error = true } else rpc("member_transfer", JSONObject().put("p_recipient_member_id", qardId).put("p_amount", v).put("p_description", purpose.ifBlank { "HABSCO member transfer" }).put("p_transaction_pin", pin)) }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Confirm member transfer") }
            }
            "qard" -> {
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Loan amount (NGN)") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = plan, onValueChange = { plan = it }, label = { Text("Repayment plan") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = purpose, onValueChange = { purpose = it }, label = { Text("Purpose of loan") }, modifier = Modifier.fillMaxWidth())
                Button(onClick = {
                    val v = amount.toDoubleOrNull()
                    if (v == null || v <= 0 || plan.isBlank() || purpose.isBlank()) { message = "Enter a valid amount, plan and purpose."; error = true }
                    else rpc("member_submit_qard_request", JSONObject().put("p_amount", v).put("p_repayment_plan", plan.trim()).put("purpose", purpose.trim()))
                }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Submit loan request") }
            }
            "repayment" -> {
                OutlinedTextField(value = qardId, onValueChange = { qardId = it.trim() }, label = { Text("Loan request ID") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Repayment amount") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = reference, onValueChange = { reference = it }, label = { Text("Payment reference") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = purpose, onValueChange = { purpose = it }, label = { Text("Note (optional)") }, modifier = Modifier.fillMaxWidth())
                Button(onClick = {
                    val v = amount.toDoubleOrNull()
                    if (qardId.isBlank() || v == null || v <= 0 || reference.isBlank()) { message = "Enter loan ID, amount and actual payment reference."; error = true }
                    else rpc("member_submit_qard_repayment", JSONObject().put("p_qard_request_id", qardId).put("p_amount", v).put("p_paid_date", java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())).put("p_payment_reference", reference.trim()).put("p_note", purpose.trim()))
                }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Submit repayment record") }
                Text("Only record a repayment after payment has actually been made.", color = Muted, fontSize = 11.sp)
            }
            "save" -> {
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Amount (NGN)") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = frequency, onValueChange = { frequency = it.lowercase() }, label = { Text("Plan frequency: daily, weekly, monthly") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = pin, onValueChange = { pin = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit transaction PIN") }, modifier = Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), singleLine = true)
                Button(onClick = { val v = amount.toDoubleOrNull(); if (v == null || v <= 0 || pin.length != 6) { message = "Enter valid amount and PIN."; error = true } else rpc("member_add_money_to_savings", JSONObject().put("p_amount", v).put("p_pin", pin)) }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Add to savings") }
                Button(onClick = { if (pin.length != 6) { message = "Enter your 6-digit PIN."; error = true } else rpc("member_withdraw_all_savings", JSONObject().put("p_pin", pin)) }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Withdraw eligible savings") }
                Button(onClick = { val v = amount.toDoubleOrNull(); if (v == null || v <= 0 || pin.length != 6 || frequency !in listOf("daily", "weekly", "monthly")) { message = "Enter valid amount, frequency and PIN."; error = true } else rpc("member_set_savings_plan", JSONObject().put("p_frequency", frequency).put("p_fixed_amount", v).put("p_pin", pin)) }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Save automatic plan") }
            }
            "shares" -> {
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Share purchase amount") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = pin, onValueChange = { pin = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit transaction PIN") }, modifier = Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), singleLine = true)
                Button(onClick = { val v = amount.toDoubleOrNull(); if (v == null || v <= 0 || pin.length != 6) { message = "Enter valid amount and PIN."; error = true } else rpc("member_buy_share", JSONObject().put("p_amount", v).put("p_transaction_pin", pin)) }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Buy shares") }
            }
            "dividend" -> {
                OutlinedTextField(value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Dividend withdrawal amount") }, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = pin, onValueChange = { pin = it.filter(Char::isDigit).take(6) }, label = { Text("6-digit transaction PIN") }, modifier = Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), singleLine = true)
                Button(onClick = { val v = amount.toDoubleOrNull(); if (v == null || v <= 0 || pin.length != 6) { message = "Enter valid amount and PIN."; error = true } else rpc("member_withdraw_dividend", JSONObject().put("p_amount", v).put("p_transaction_pin", pin)) }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Withdraw dividends") }
            }
            "guides" -> Text("Home has quick actions; Services contains airtime, data, electricity, TV, education, savings, shares and loans; Wallet contains balances, receiving accounts, funding and bank transfers; Charity explains HABSCO Sadaqah Jariyah.", color = Muted, lineHeight = 22.sp)
            "statement" -> Text("Your recent native account statement is available on the Wallet screen. Use Back, then Wallet to view transaction references, amounts, directions and statuses.", color = Muted, lineHeight = 22.sp)
            "auth" -> Text("Sign in using the native sign-in form. Native registration and password recovery are not yet available; this app will not open the website.", color = Muted, lineHeight = 22.sp)
            "privacy" -> Text("HABSCO sends account requests over encrypted HTTPS. Transaction PINs are sent to authenticated transaction services and are not stored by this screen. Never share your PIN, BVN or bank details.", color = Muted, lineHeight = 22.sp)
            else -> {
                Text("Support waqf shops, solar-powered boreholes, free vocational learning and empowerment programmes.", color = Muted, lineHeight = 22.sp)
                Text("Donations are not yet connected to a dedicated secure donation endpoint. No payment will be taken from this screen.", color = Color(0xFF9A4A00), fontSize = 12.sp)
            }
        }
        if (busy) CircularProgressIndicator(color = Emerald)
        message?.let { Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = if (error) Color(0xFFFFE8E5) else Color(0xFFE4F5EA))) { Text(it, Modifier.padding(14.dp), color = if (error) Color(0xFF9E2F24) else Forest, fontSize = 12.sp, lineHeight = 17.sp) } }
    }
}

@Composable
private fun ServicesScreen(modifier: Modifier, onOpenUrl: (String) -> Unit, onOpenService: (ServiceItem) -> Unit) {
    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        ScreenHeader("Services", "Your everyday essentials")
        services.chunked(2).forEach { pair ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                pair.forEach { service -> ServiceCard(service, Modifier.weight(1f)) { onOpenService(service) } }
                if (pair.size == 1) Spacer(Modifier.weight(1f))
            }
        }
        ServiceLink("Interest-Free Loan", "Apply for or manage an interest-free loan", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=qard")
        }
        ServiceLink("Savings", "Manage your savings account", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=save")
        }
        ServiceLink("Shares", "Manage your shares account", Icons.Default.AccountBalanceWallet) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=save")
        }
        ServiceLink("Wallet & Transfers", "Funding, receiving and sending money", Icons.Default.AccountBalanceWallet) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=money-services")
        }
        ServiceLink("Member-to-member transfer", "Send wallet funds using a HABSCO member ID", Icons.Default.ArrowForward) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=member-transfer")
        }
        ServiceLink("Dividend Account", "View your dividend account", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=dividend")
        }
        ServiceLink("Loan Repayment", "Manage repayments for your interest-free loan", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=repayment")
        }
        ServiceLink("Donation & Sadaqah Jariyah", "Support HABSCO community projects", Icons.Default.Favorite) {
            onOpenUrl("https://habscosadaqah.org/")
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

    val context = LocalContext.current
    var accountLoading by remember { mutableStateOf(false) }
    var accountChecked by remember { mutableStateOf(false) }
    var receivingAccount by remember { mutableStateOf<JSONObject?>(null) }
    var accountError by remember { mutableStateOf<String?>(null) }

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
                    TextButton(onClick = onRefresh) {
                        Text("Refresh", color = Color.White)
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
            onClick = onRefresh,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Forest)
        ) { Text("Refresh statement", fontWeight = FontWeight.Bold) }

        ServiceLink("Fund wallet", "Open the existing verified funding workflow", Icons.Default.AccountBalanceWallet) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=fund&v=20261003")
        }
        ServiceLink("Transfer money", "Continue to the existing transfer workflow", Icons.Default.ArrowForward) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=squad-transfer")
        }
        ServiceLink("Receive money", "View or create your registered receiving account", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=virtual-account")
        }
        if (accountLoading) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = Emerald)
                Text("Loading receiving account…", color = Muted, fontSize = 12.sp)
            }
        }
        if (!accountError.isNullOrBlank()) {
            Text(accountError!!, color = Color(0xFFB3261E), fontSize = 12.sp)
            TextButton(onClick = { accountError = null; accountChecked = false }) { Text("Try again") }
        } else if (accountChecked && receivingAccount == null) {
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("No receiving account found", color = Ink, fontWeight = FontWeight.Bold)
                    Text("Open Receive Money in the native Wallet screen to create your receiving account securely in the app.", color = Muted, fontSize = 12.sp, lineHeight = 17.sp)
                }
            }
        } else if (receivingAccount != null) {
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("Your HABSCO receiving account", color = Ink, fontWeight = FontWeight.Bold)
                    BalanceRow("Account number", receivingAccount!!.optString("virtual_account_number", "—"))
                    BalanceRow("Bank code", receivingAccount!!.optString("bank_code", "—"))
                    BalanceRow("Status", receivingAccount!!.optString("status", "—").replaceFirstChar { it.uppercase() })
                    Text("Share these details only with people who need to pay you. Account details are loaded securely from HABSCO.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
                }
            }
        }
        Text("Wallet funding and bank transfers continue through HABSCO's existing secure workflow.", color = Muted, fontSize = 11.sp, lineHeight = 16.sp)
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
        ServiceLink("Privacy & security", "Read in-app privacy and security information", Icons.Default.Security) {
            onOpenUrl("https://habscosadaqah.org/privacy-policy.html")
        }
        ServiceLink("How-to guides", "Learn about available services in the app", Icons.Default.MenuBook) {
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
