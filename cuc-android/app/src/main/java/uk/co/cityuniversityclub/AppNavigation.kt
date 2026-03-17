package uk.co.cityuniversityclub

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreHoriz
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
import uk.co.cityuniversityclub.network.Member
import uk.co.cityuniversityclub.ui.screens.DiningScreen
import uk.co.cityuniversityclub.ui.screens.EventsScreen
import uk.co.cityuniversityclub.ui.screens.HomeScreen
import uk.co.cityuniversityclub.ui.screens.MoreScreen
import uk.co.cityuniversityclub.ui.theme.CambridgeBlue
import uk.co.cityuniversityclub.ui.theme.OxfordBlue

private data class NavItem(val route: String, val label: String, val icon: ImageVector)

private val navItems = listOf(
    NavItem("home", "Home", Icons.Default.Home),
    NavItem("events", "Events", Icons.Default.CalendarMonth),
    NavItem("dining", "Dining", Icons.Default.Restaurant),
    NavItem("more", "More", Icons.Default.MoreHoriz)
)

@Composable
fun AppNavigation(member: Member, token: String, displayName: String, onSetDisplayName: (String) -> Unit, onLogout: () -> Unit) {
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
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
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
                HomeScreen(member = member, displayName = displayName)
            }
            composable("events") {
                EventsScreen(member = member, token = token)
            }
            composable("dining") {
                DiningScreen(token = token, member = member)
            }
            composable("more") {
                MoreScreen(
                    member = member,
                    token = token,
                    displayName = displayName,
                    onSetDisplayName = onSetDisplayName,
                    onLogout = onLogout
                )
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
