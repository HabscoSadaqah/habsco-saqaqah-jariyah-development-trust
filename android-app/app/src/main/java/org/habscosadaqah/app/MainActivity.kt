package org.habscosadaqah.app

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
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
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

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
    var selectedTab by remember { mutableStateOf(0) }
    BackHandler(enabled = selectedTab != 0) { selectedTab = 0 }

    ScaffoldNative(
        selectedTab = selectedTab,
        onSelectTab = { selectedTab = it }
    ) { contentModifier ->
        when (selectedTab) {
            0 -> HomeScreen(contentModifier, onSelectTab = { selectedTab = it }, onOpenUrl = onOpenUrl)
            1 -> ServicesScreen(contentModifier, onOpenUrl = onOpenUrl)
            2 -> WalletScreen(contentModifier, onOpenUrl = onOpenUrl)
            3 -> CharityScreen(contentModifier, onOpenUrl = onOpenUrl)
            else -> ProfileScreen(contentModifier, onOpenUrl = onOpenUrl)
        }
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
                        onClick = { onOpenUrl("https://habscosadaqah.org/member.html") },
                        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Forest),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("Sign in to your account", fontWeight = FontWeight.Bold)
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
private fun WalletScreen(modifier: Modifier, onOpenUrl: (String) -> Unit) {
    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        ScreenHeader("My wallet", "Secure access to your HABSCO wallet")
        Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = Forest), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Icon(Icons.Default.Security, contentDescription = null, tint = Gold, modifier = Modifier.size(28.dp))
                Text("Your balance stays private", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 21.sp)
                Text(
                    "Sign in securely to view your live balance and transaction history. This app will not display an invented balance.",
                    color = Color(0xFFD6E8DD), fontSize = 13.sp, lineHeight = 19.sp
                )
                Button(
                    onClick = { onOpenUrl("https://habscosadaqah.org/member.html") },
                    colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Forest),
                    modifier = Modifier.fillMaxWidth()
                ) { Text("Sign in securely", fontWeight = FontWeight.Bold) }
            }
        }
        ServiceLink("Fund wallet", "Add money using available funding methods", Icons.Default.AccountBalanceWallet) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=fund&v=20261003")
        }
        ServiceLink("Transfer money", "Continue to the verified transfer service", Icons.Default.ArrowForward) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=squad-transfer")
        }
        ServiceLink("Receive money", "Access your receiving account options", Icons.Default.Savings) {
            onOpenUrl("https://habscosadaqah.org/member-actions.html?action=virtual-account")
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
private fun ProfileScreen(modifier: Modifier, onOpenUrl: (String) -> Unit) {
    Column(modifier.verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        ScreenHeader("Account", "Your HABSCO membership")
        Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(54.dp).clip(CircleShape).background(Color(0xFFE4F5EA)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = Emerald, modifier = Modifier.size(30.dp))
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text("Welcome to HABSCO", color = Ink, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    Text("Sign in to access your member account.", color = Muted, fontSize = 12.sp)
                }
            }
        }
        Button(
            onClick = { onOpenUrl("https://habscosadaqah.org/member.html") },
            colors = ButtonDefaults.buttonColors(containerColor = Forest),
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(15.dp)
        ) { Text("Sign in / Register", fontWeight = FontWeight.Bold) }
        ServiceLink("Privacy policy", "Read how HABSCO handles information", Icons.Default.Security) {
            onOpenUrl("https://habscosadaqah.org/privacy-policy.html")
        }
        ServiceLink("Delete account", "View account deletion instructions", Icons.Default.Person) {
            onOpenUrl("https://habscosadaqah.org/delete-account.html")
        }
        ServiceLink("How-to guides", "Learn about available services", Icons.Default.MenuBook) {
            onOpenUrl("https://habscosadaqah.org/how-to-guides.html")
        }
        Spacer(Modifier.height(8.dp))
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
