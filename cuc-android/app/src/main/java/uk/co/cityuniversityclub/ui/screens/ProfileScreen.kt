package uk.co.cityuniversityclub.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uk.co.cityuniversityclub.network.Member
import uk.co.cityuniversityclub.ui.theme.CambridgeBlue
import uk.co.cityuniversityclub.ui.theme.OxfordBlue
import uk.co.cityuniversityclub.ui.theme.SecondaryText

@Composable
fun ProfileScreen(member: Member, onLogout: () -> Unit) {
    val memberUntil = "March ${java.util.Calendar.getInstance().get(java.util.Calendar.YEAR) + 1}"

    val initials = member.fullName
        .split(" ")
        .filter { it.isNotBlank() }
        .take(2)
        .joinToString("") { it.first().uppercase() }
        .ifBlank { "M" }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OxfordBlue)
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(40.dp))

        Box(
            modifier = Modifier
                .size(96.dp)
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            CambridgeBlue.copy(alpha = 0.5f),
                            OxfordBlue.copy(alpha = 0.8f)
                        )
                    ),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(initials, fontSize = 36.sp, fontWeight = FontWeight.Light, color = Color.White)
        }

        Spacer(Modifier.height(20.dp))

        Text(
            text = member.fullName.ifBlank { "Member" },
            fontSize = 26.sp,
            fontWeight = FontWeight.Light,
            color = Color.White
        )

        if (member.email.isNotBlank()) {
            Spacer(Modifier.height(6.dp))
            Text(
                text = member.email,
                fontSize = 14.sp,
                color = SecondaryText
            )
        }

        Spacer(Modifier.height(32.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
            shape = RoundedCornerShape(14.dp)
        ) {
            InfoRow(label = "Member Until", value = memberUntil)
        }

        Spacer(Modifier.weight(1f))

        Button(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.06f)),
            shape = RoundedCornerShape(14.dp),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
        ) {
            Icon(
                Icons.Default.Logout,
                contentDescription = null,
                tint = Color(0xFFEB5757),
                modifier = Modifier.size(18.dp)
            )
            Spacer(Modifier.width(8.dp))
            Text("Sign Out", color = Color(0xFFEB5757), fontSize = 15.sp, fontWeight = FontWeight.Medium)
        }

        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 13.sp, color = SecondaryText)
        Text(value, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = CambridgeBlue)
    }
}
