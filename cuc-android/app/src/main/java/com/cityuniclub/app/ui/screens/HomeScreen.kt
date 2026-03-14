package com.cityuniclub.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cityuniclub.app.R
import com.cityuniclub.app.network.Member
import com.cityuniclub.app.ui.components.MembershipCard
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.OxfordBlue

@Composable
fun HomeScreen(member: Member, displayName: String) {
    val memberFirstName = displayName.ifBlank { member.firstName.ifBlank { member.fullName.split(" ").firstOrNull() ?: "Member" } }.split(" ").firstOrNull() ?: "Member"
    val memberFullName = displayName.ifBlank { member.fullName.ifBlank { "Member" } }
    val memberUntil = "March ${java.util.Calendar.getInstance().get(java.util.Calendar.YEAR) + 1}"

    Box(modifier = Modifier.fillMaxSize()) {
        Image(
            painter = painterResource(R.drawable.cuc_photo),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(
                    colors = listOf(OxfordBlue.copy(alpha = 0.55f), OxfordBlue.copy(alpha = 0.75f))
                ))
        )

        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 20.dp)) {

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth().padding(top = 40.dp, bottom = 20.dp)
            ) {
                Image(
                    painter = painterResource(R.drawable.cuc_logo_real),
                    contentDescription = "City University Club",
                    modifier = Modifier.size(80.dp),
                    contentScale = ContentScale.Fit
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text("Welcome", fontSize = 16.sp, fontWeight = FontWeight.Normal, color = CambridgeBlue)

                Spacer(modifier = Modifier.height(4.dp))

                Text(memberFirstName, fontSize = 32.sp, fontWeight = FontWeight.Light, color = Color.White)
            }

            Spacer(modifier = Modifier.weight(1f))

            MembershipCard(memberName = memberFullName, memberUntil = memberUntil)

            Spacer(modifier = Modifier.weight(1f))
        }
    }
}
