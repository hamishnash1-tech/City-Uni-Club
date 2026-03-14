package com.cityuniclub.app.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cityuniclub.app.network.Member
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.SecondaryText

private sealed class MoreSubScreen {
    object Menu : MoreSubScreen()
    object Reciprocals : MoreSubScreen()
    object Profile : MoreSubScreen()
}

@Composable
fun MoreScreen(
    member: Member,
    token: String,
    displayName: String,
    onSetDisplayName: (String) -> Unit,
    onLogout: () -> Unit
) {
    var subScreen by remember { mutableStateOf<MoreSubScreen>(MoreSubScreen.Menu) }

    BackHandler(enabled = subScreen != MoreSubScreen.Menu) {
        subScreen = MoreSubScreen.Menu
    }

    when (subScreen) {
        is MoreSubScreen.Menu -> MoreMenu(
            onReciprocalClubs = { subScreen = MoreSubScreen.Reciprocals },
            onProfile = { subScreen = MoreSubScreen.Profile }
        )
        is MoreSubScreen.Reciprocals -> {
            Column(modifier = Modifier.fillMaxSize().background(OxfordBlue)) {
                MoreSubHeader(title = "Reciprocal Clubs", onBack = { subScreen = MoreSubScreen.Menu })
                ClubsScreen(token = token)
            }
        }
        is MoreSubScreen.Profile -> {
            Column(modifier = Modifier.fillMaxSize().background(OxfordBlue)) {
                MoreSubHeader(title = "Profile", onBack = { subScreen = MoreSubScreen.Menu })
                ProfileScreen(
                    member = member,
                    displayName = displayName,
                    onSetDisplayName = onSetDisplayName,
                    onLogout = onLogout
                )
            }
        }
    }
}

@Composable
private fun MoreMenu(onReciprocalClubs: () -> Unit, onProfile: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OxfordBlue)
            .padding(horizontal = 20.dp),
    ) {
        Spacer(Modifier.height(24.dp))
        MoreMenuItem(
            icon = Icons.Default.Language,
            label = "Reciprocal Clubs",
            onClick = onReciprocalClubs
        )
        Spacer(Modifier.height(12.dp))
        MoreMenuItem(
            icon = Icons.Default.Person,
            label = "Profile",
            onClick = onProfile
        )
    }
}

@Composable
private fun MoreMenuItem(icon: ImageVector, label: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.06f)),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 18.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(icon, contentDescription = null, tint = CambridgeBlue, modifier = Modifier.size(22.dp))
                Text(label, fontSize = 16.sp, fontWeight = FontWeight.Normal, color = Color.White)
            }
            Icon(Icons.Default.ChevronRight, null, tint = SecondaryText, modifier = Modifier.size(20.dp))
        }
    }
}

@Composable
private fun MoreSubHeader(title: String, onBack: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(start = 8.dp, top = 16.dp, bottom = 4.dp)
    ) {
        IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) {
            Icon(Icons.Default.ArrowBack, null, tint = Color.White)
        }
        Spacer(Modifier.width(4.dp))
        Text(title, fontSize = 20.sp, fontWeight = FontWeight.Light, color = Color.White)
    }
}
