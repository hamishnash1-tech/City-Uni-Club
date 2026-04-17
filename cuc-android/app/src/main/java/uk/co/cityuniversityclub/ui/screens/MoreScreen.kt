package uk.co.cityuniversityclub.ui.screens

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
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uk.co.cityuniversityclub.network.Member
import uk.co.cityuniversityclub.ui.theme.CambridgeBlue
import uk.co.cityuniversityclub.ui.theme.OxfordBlue
import uk.co.cityuniversityclub.ui.theme.SecondaryText

private sealed class MoreSubScreen {
    object Menu : MoreSubScreen()
    object Reciprocals : MoreSubScreen()
    object Profile : MoreSubScreen()
}

@Composable
fun MoreScreen(
    member: Member,
    token: String,
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
        Spacer(Modifier.height(24.dp))
        Text(
            "Contact",
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = SecondaryText,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.06f)),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 18.dp, vertical = 16.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(Icons.Default.Place, contentDescription = null, tint = CambridgeBlue, modifier = Modifier.size(22.dp))
                    Column {
                        Text("City University Club", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color.White)
                        Spacer(Modifier.height(4.dp))
                        Text("42 Crutched Friars", fontSize = 13.sp, color = SecondaryText)
                        Text("London EC3N 2AP", fontSize = 13.sp, color = SecondaryText)
                    }
                }
                Spacer(Modifier.height(14.dp))
                Divider(color = Color.White.copy(alpha = 0.08f))
                Spacer(Modifier.height(14.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(Icons.Default.Phone, contentDescription = null, tint = CambridgeBlue, modifier = Modifier.size(22.dp))
                    Text("020 7488 1770", fontSize = 13.sp, color = SecondaryText)
                }
                Spacer(Modifier.height(14.dp))
                Divider(color = Color.White.copy(alpha = 0.08f))
                Spacer(Modifier.height(14.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(Icons.Default.Schedule, contentDescription = null, tint = CambridgeBlue, modifier = Modifier.size(22.dp))
                    Column {
                        Text("Opening Hours", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color.White)
                        Spacer(Modifier.height(4.dp))
                        Text("Tuesday – Friday", fontSize = 13.sp, color = SecondaryText)
                        Text("9:00 am – 5:00 pm", fontSize = 13.sp, color = SecondaryText)
                    }
                }
            }
        }
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
