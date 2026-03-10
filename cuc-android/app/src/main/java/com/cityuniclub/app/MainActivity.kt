package com.cityuniclub.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.cityuniclub.app.ui.screens.HomeScreen
import com.cityuniclub.app.ui.screens.LoginScreen
import com.cityuniclub.app.ui.screens.SplashScreen
import com.cityuniclub.app.ui.theme.CityUniClubTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CityUniClubTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var isAuthenticated = false
                    
                    if (!isAuthenticated) {
                        SplashScreen(
                            onAuthCheckComplete = { auth ->
                                isAuthenticated = auth
                            }
                        )
                    } else if (isAuthenticated) {
                        HomeScreen()
                    } else {
                        LoginScreen(
                            onLoginSuccess = {
                                isAuthenticated = true
                            }
                        )
                    }
                }
            }
        }
    }
}
