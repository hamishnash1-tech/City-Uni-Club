package com.cityuniclub.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.CardWhite
import com.cityuniclub.app.ui.theme.SecondaryText
import com.cityuniclub.app.ui.theme.AddressGray

@Composable
fun MembershipCard(
    memberName: String,
    memberUntil: String
) {
    Card(
        modifier = Modifier.fillMaxWidth().heightIn(min = 200.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        shape = RoundedCornerShape(20.dp),
        border = BorderStroke(
            width = 2.dp,
            brush = Brush.linearGradient(
                colors = listOf(Color.White, Color(0xFFE0E0E4)),
                start = androidx.compose.ui.geometry.Offset.Zero,
                end = androidx.compose.ui.geometry.Offset.Infinite
            )
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(20.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .size(58.dp, 72.dp)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(
                                        CambridgeBlue.copy(alpha = 0.3f),
                                        OxfordBlue.copy(alpha = 0.3f)
                                    )
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("CUC", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = OxfordBlue)
                    }
                    
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("CITY UNIVERSITY CLUB", fontSize = 20.sp, fontWeight = FontWeight.Medium, color = OxfordBlue)
                        Text("42 CRUTCHED FRIARS, EC3N 2AP", fontSize = 11.sp, fontWeight = FontWeight.Normal, color = AddressGray)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)
            ) {
                Text(
                    "This is to introduce",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Normal,
                    color = SecondaryText,
                    fontStyle = FontStyle.Italic
                )
                Text(
                    memberName,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = OxfordBlue,
                    letterSpacing = 1.5.sp
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("Member Until", fontSize = 10.sp, fontWeight = FontWeight.Normal, color = SecondaryText)
                    Text(memberUntil, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue)
                }
                
                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text("Secretary", fontSize = 9.sp, fontWeight = FontWeight.Normal, color = SecondaryText)
                    Text("H. Senanayake", fontSize = 11.sp, fontWeight = FontWeight.Normal, color = OxfordBlue, fontStyle = FontStyle.Italic)
                }
            }
        }
    }
}
