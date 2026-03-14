package com.cityuniclub.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.cityuniclub.app.ui.screens.LoginScreen
import com.cityuniclub.app.ui.screens.SplashScreen
import com.cityuniclub.app.ui.theme.CityUniClubTheme

class MainActivity : ComponentActivity() {

    private val viewModel: MainActivityViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CityUniClubTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val isAuthenticated by viewModel.isAuthenticated.collectAsState()
                    val member by viewModel.member.collectAsState()
                    val isRestoring by viewModel.isRestoring.collectAsState()
                    val displayName by viewModel.displayName.collectAsState()
                    var splashDone by remember { mutableStateOf(false) }

                    if (!splashDone || isRestoring) {
                        SplashScreen(onAuthCheckComplete = { splashDone = true })
                    } else if (isAuthenticated && member != null) {
                        AppNavigation(
                            member = member!!,
                            token = viewModel.token ?: "",
                            displayName = displayName,
                            onSetDisplayName = { viewModel.setDisplayName(it) },
                            onLogout = { viewModel.logout() }
                        )
                    } else {
                        LoginScreen(
                            onLogin = { email, password, onResult ->
                                viewModel.login(email, password, onResult)
                            }
                        )
                    }
                }
            }
        }
    }
}
