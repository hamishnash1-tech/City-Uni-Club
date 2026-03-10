package com.cityuniclub.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.CambridgeBlue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SplashScreen(
    onAuthCheckComplete: (Boolean) -> Unit
) {
    val scope = rememberCoroutineScope()
    var showLogo by remember { mutableStateOf(false) }
    var isAuthenticated by remember { mutableStateOf(false) }
    
    val scale = remember { Animatable(0.5f) }
    val alpha = remember { Animatable(0f) }
    
    LaunchedEffect(Unit) {
        scope.launch {
            scale.animateTo(
                targetValue = 1f,
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioMediumBouncy,
                    stiffness = Spring.StiffnessLow
                )
            )
        }
        scope.launch {
            alpha.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = 800)
            )
        }
        
        showLogo = true
        delay(2000)
        onAuthCheckComplete(isAuthenticated)
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(OxfordBlue),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(32.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(scale.value)
                    .alpha(alpha.value)
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
                Text(
                    text = "CUC",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "CITY UNIVERSITY CLUB",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White,
                modifier = Modifier.alpha(alpha.value)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "42 Crutched Friars, London EC3N 2AP",
                fontSize = 12.sp,
                color = CambridgeBlue,
                modifier = Modifier.alpha(alpha.value)
            )
        }
        
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 50.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            if (showLogo) {
                CircularProgressIndicator(
                    modifier = Modifier.size(40.dp),
                    color = CambridgeBlue,
                    strokeWidth = 3.dp
                )
            }
        }
    }
}
