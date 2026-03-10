package com.cityuniclub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cityuniclub.app.ui.components.MembershipCard
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.CambridgeBlue

@Composable
fun HomeScreen() {
    val memberFirstName = "Member"
    val memberFullName = "Member Name"
    val memberUntil = "March 2026"
    
    Box(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            OxfordBlue.copy(alpha = 0.5f),
                            OxfordBlue.copy(alpha = 0.3f)
                        )
                    )
                )
        )
        
        Column(
            modifier = Modifier.fillMaxSize().padding(horizontal = 20.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth().padding(top = 50.dp, bottom = 20.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(
                            Brush.linearGradient(
                                colors = listOf(
                                    CambridgeBlue.copy(alpha = 0.4f),
                                    OxfordBlue.copy(alpha = 0.4f)
                                )
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text("CUC", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
                
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
