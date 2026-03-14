package com.cityuniclub.app

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.cityuniclub.app.network.Member
import com.cityuniclub.app.ui.screens.ClubsScreen
import com.cityuniclub.app.ui.screens.DiningScreen
import com.cityuniclub.app.ui.screens.EventsScreen
import com.cityuniclub.app.ui.screens.HomeScreen
import com.cityuniclub.app.ui.screens.ProfileScreen
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.OxfordBlue

private data class NavItem(val route: String, val label: String, val icon: ImageVector)

private val navItems = listOf(
    NavItem("home", "Home", Icons.Default.Home),
    NavItem("events", "Events", Icons.Default.CalendarMonth),
    NavItem("dining", "Dining", Icons.Default.Restaurant),
    NavItem("clubs", "Clubs", Icons.Default.Language),
    NavItem("profile", "Profile", Icons.Default.Person)
)

@Composable
fun AppNavigation(member: Member, token: String, onLogout: () -> Unit) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    Scaffold(
        containerColor = OxfordBlue,
        bottomBar = {
            Column {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(0.5.dp)
                        .background(Color.White.copy(alpha = 0.12f))
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(OxfordBlue)
                        .horizontalScroll(rememberScrollState())
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(0.dp)
                ) {
                    navItems.forEach { item ->
                        val selected = currentDestination?.hierarchy?.any { it.route == item.route } == true
                        NavCarouselItem(
                            item = item,
                            selected = selected,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") {
                HomeScreen(member = member)
            }
            composable("events") {
                EventsScreen()
            }
            composable("dining") {
                DiningScreen(token = token, member = member)
            }
            composable("clubs") {
                ClubsScreen(token = token)
            }
            composable("profile") {
                ProfileScreen(member = member, onLogout = onLogout)
            }
        }
    }
}

@Composable
private fun NavCarouselItem(item: NavItem, selected: Boolean, onClick: () -> Unit) {
    val contentColor = if (selected) CambridgeBlue else Color.White.copy(alpha = 0.5f)

    Column(
        modifier = Modifier
            .widthIn(min = 80.dp)
            .clickable(onClick = onClick)
            .padding(vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .background(
                    color = if (selected) Color.White.copy(alpha = 0.1f) else Color.Transparent,
                    shape = RoundedCornerShape(16.dp)
                )
                .padding(horizontal = 20.dp, vertical = 4.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.label,
                tint = contentColor,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(Modifier.height(2.dp))
        Text(
            text = item.label,
            fontSize = 10.sp,
            color = contentColor,
            fontWeight = if (selected) FontWeight.Medium else FontWeight.Normal
        )
    }
}
