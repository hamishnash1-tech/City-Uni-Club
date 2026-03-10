package com.cityuniclub.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Light Color Scheme (Primary - matching iOS app)
private val LightColorScheme = lightColorScheme(
    primary = OxfordBlue,
    onPrimary = CardWhite,
    primaryContainer = CambridgeBlue,
    onPrimaryContainer = OxfordBlue,
    secondary = CambridgeBlue,
    onSecondary = OxfordBlue,
    secondaryContainer = LightCambridge,
    onSecondaryContainer = OxfordBlue,
    tertiary = ClubGold,
    onTertiary = OxfordBlue,
    background = Color(0xFFF5F5F5),
    onBackground = DarkText,
    surface = CardWhite,
    onSurface = DarkText,
    surfaceVariant = LightCambridge,
    onSurfaceVariant = SecondaryText,
    error = ErrorRed,
    onError = CardWhite
)

// Dark Color Scheme (Optional - for dark mode support)
private val DarkColorScheme = darkColorScheme(
    primary = CambridgeBlue,
    onPrimary = OxfordBlue,
    primaryContainer = OxfordBlue,
    onPrimaryContainer = CambridgeBlue,
    secondary = OxfordBlue,
    onSecondary = CambridgeBlue,
    secondaryContainer = Color(0xFF1A3A5C),
    onSecondaryContainer = CambridgeBlue,
    tertiary = ClubGold,
    onTertiary = OxfordBlue,
    background = Color(0xFF0A0A0A),
    onBackground = Color(0xFFE0E0E0),
    surface = Color(0xFF1C1C1C),
    onSurface = Color(0xFFE0E0E0),
    surfaceVariant = Color(0xFF2C2C2C),
    onSurfaceVariant = Color(0xFFB0B0B0),
    error = ErrorRed,
    onError = CardWhite
)

@Composable
fun CityUniClubTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Disabled to maintain brand colors
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = OxfordBlue.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
