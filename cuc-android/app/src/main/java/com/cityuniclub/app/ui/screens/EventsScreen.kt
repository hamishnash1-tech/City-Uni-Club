package com.cityuniclub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cityuniclub.app.network.ApiService
import com.cityuniclub.app.network.ClubEvent
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.CardWhite
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.SecondaryText
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun EventsScreen() {
    var events by remember { mutableStateOf<List<ClubEvent>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            events = withContext(Dispatchers.IO) { ApiService.getEvents() }
        } catch (e: Exception) {
            error = e.message
        } finally {
            isLoading = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OxfordBlue)
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Upcoming Events",
            fontSize = 24.sp,
            fontWeight = FontWeight.Light,
            color = Color.White,
            modifier = Modifier.padding(top = 24.dp, bottom = 20.dp)
        )

        when {
            isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = CambridgeBlue)
            }
            error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(error ?: "Failed to load events", color = SecondaryText, textAlign = TextAlign.Center)
            }
            events.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No upcoming events", color = SecondaryText, textAlign = TextAlign.Center)
            }
            else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(events) { event -> EventCard(event) }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@Composable
private fun EventCard(event: ClubEvent) {
    val formattedDate = remember(event.eventDate) {
        runCatching {
            val dt = LocalDateTime.parse(event.eventDate, DateTimeFormatter.ISO_DATE_TIME)
            dt.format(DateTimeFormatter.ofPattern("EEE d MMM yyyy • HH:mm", Locale.UK))
        }.getOrElse { event.eventDate }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = event.title,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = OxfordBlue
                    )
                    if (event.eventType.isNotBlank()) {
                        Spacer(Modifier.height(4.dp))
                        Surface(
                            color = OxfordBlue.copy(alpha = 0.08f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = event.eventType.replaceFirstChar { it.uppercaseChar() },
                                fontSize = 11.sp,
                                color = OxfordBlue,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }
                if (event.pricePerPerson > 0) {
                    Text(
                        text = "£%.0f pp".format(event.pricePerPerson),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CambridgeBlue
                    )
                }
            }

            Spacer(Modifier.height(10.dp))
            Divider(color = Color(0xFFE8E8E8))
            Spacer(Modifier.height(10.dp))

            Text(
                text = if (event.isTba) "Date TBA" else formattedDate,
                fontSize = 12.sp,
                color = SecondaryText
            )

            if (!event.description.isNullOrBlank()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = event.description,
                    fontSize = 13.sp,
                    color = Color(0xFF4A4A4A),
                    lineHeight = 18.sp
                )
            }
        }
    }
}
