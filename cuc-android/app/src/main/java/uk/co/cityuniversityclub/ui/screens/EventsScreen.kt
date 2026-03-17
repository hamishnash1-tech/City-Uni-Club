package uk.co.cityuniversityclub.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import uk.co.cityuniversityclub.network.ApiService
import uk.co.cityuniversityclub.network.ClubEvent
import uk.co.cityuniversityclub.network.Member
import uk.co.cityuniversityclub.ui.theme.CambridgeBlue
import uk.co.cityuniversityclub.ui.theme.CardWhite
import uk.co.cityuniversityclub.ui.theme.OxfordBlue
import uk.co.cityuniversityclub.ui.theme.SecondaryText
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private fun formatEventType(type: String): String = when (type.lowercase()) {
    "lunch"        -> "Lunch"
    "dinner"       -> "Dinner"
    "lunch_dinner" -> "Lunch & Dinner"
    "meeting"      -> "Meeting"
    "special"      -> "Special Event"
    else           -> type.replace('_', ' ').split(' ')
        .joinToString(" ") { it.replaceFirstChar { c -> c.uppercaseChar() } }
}

private fun formatEventDate(eventDate: String): String = runCatching {
    val date = LocalDate.parse(eventDate, DateTimeFormatter.ISO_DATE_TIME.withZone(java.time.ZoneOffset.UTC))
        .let { it } ?: LocalDate.parse(eventDate.take(10))
    date.format(DateTimeFormatter.ofPattern("EEE d MMM yyyy", Locale.UK))
}.getOrElse {
    runCatching {
        LocalDate.parse(eventDate.take(10))
            .format(DateTimeFormatter.ofPattern("EEE d MMM yyyy", Locale.UK))
    }.getOrElse { eventDate }
}

@Composable
fun EventsScreen(member: Member, token: String) {
    var events by remember { mutableStateOf<List<ClubEvent>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var bookingEvent by remember { mutableStateOf<ClubEvent?>(null) }

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
                items(events) { event ->
                    EventCard(event = event, onBookClick = { bookingEvent = event })
                }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }

    bookingEvent?.let { event ->
        BookingDialog(
            event = event,
            member = member,
            token = token,
            onDismiss = { bookingEvent = null }
        )
    }
}

@Composable
private fun EventCard(event: ClubEvent, onBookClick: () -> Unit) {
    val formattedDate = remember(event.eventDate) {
        if (event.isTba) "Date TBA" else formatEventDate(event.eventDate)
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
                                text = formatEventType(event.eventType),
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
                text = formattedDate,
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

            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = onBookClick,
                modifier = Modifier.fillMaxWidth().height(40.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = OxfordBlue),
                border = ButtonDefaults.outlinedButtonBorder
            ) {
                Icon(Icons.Default.ConfirmationNumber, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Book Tickets", fontSize = 13.sp)
            }
        }
    }
}

@Composable
private fun BookingDialog(
    event: ClubEvent,
    member: Member,
    token: String,
    onDismiss: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var guestCount by remember { mutableStateOf(0) }
    var mealOption by remember { mutableStateOf<String?>(null) }
    var specialRequests by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }
    var submitted by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    val isLunchDinner = event.eventType.lowercase() == "lunch_dinner"
    val formattedDate = if (event.isTba) "Date TBA" else formatEventDate(event.eventDate)

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = OxfordBlue.copy(alpha = 0.4f),
        unfocusedBorderColor = Color(0xFFCCCCCC),
        focusedTextColor = OxfordBlue,
        unfocusedTextColor = OxfordBlue,
        cursorColor = OxfordBlue
    )

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = CardWhite),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(24.dp).verticalScroll(rememberScrollState())) {
                Text("Book Event", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue)
                Spacer(Modifier.height(4.dp))
                Text(event.title, fontSize = 14.sp, color = SecondaryText)

                if (submitted) {
                    Spacer(Modifier.height(20.dp))
                    Icon(
                        Icons.Default.CheckCircle, null,
                        tint = Color(0xFF27AE60),
                        modifier = Modifier.size(48.dp).align(Alignment.CenterHorizontally)
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Your booking request has been submitted. The club will be in touch to confirm.",
                        fontSize = 14.sp, color = OxfordBlue, textAlign = TextAlign.Center
                    )
                    Spacer(Modifier.height(20.dp))
                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth().height(46.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OxfordBlue),
                        shape = RoundedCornerShape(12.dp)
                    ) { Text("Close", color = Color.White) }
                } else {
                    Spacer(Modifier.height(16.dp))

                    // Event summary
                    Card(
                        colors = CardDefaults.cardColors(containerColor = OxfordBlue.copy(alpha = 0.06f)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(formattedDate, fontSize = 13.sp, color = SecondaryText)
                            if (event.pricePerPerson > 0) {
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    "£%.0f per person".format(event.pricePerPerson),
                                    fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue
                                )
                            }
                        }
                    }

                    // Meal option for lunch_dinner events
                    if (isLunchDinner) {
                        Spacer(Modifier.height(16.dp))
                        Text(
                            "SELECT SITTING",
                            fontSize = 10.sp, fontWeight = FontWeight.Medium,
                            color = SecondaryText, letterSpacing = 1.sp
                        )
                        Spacer(Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            listOf("lunch" to "Lunch", "dinner" to "Dinner").forEach { (value, label) ->
                                val selected = mealOption == value
                                OutlinedButton(
                                    onClick = { mealOption = value },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        containerColor = if (selected) OxfordBlue else Color.Transparent,
                                        contentColor = if (selected) Color.White else OxfordBlue
                                    ),
                                    border = ButtonDefaults.outlinedButtonBorder
                                ) { Text(label, fontSize = 13.sp) }
                            }
                        }
                    }

                    // Additional guests
                    Spacer(Modifier.height(16.dp))
                    Text(
                        "ADDITIONAL GUESTS",
                        fontSize = 10.sp, fontWeight = FontWeight.Medium,
                        color = SecondaryText, letterSpacing = 1.sp
                    )
                    Spacer(Modifier.height(8.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        IconButton(
                            onClick = { if (guestCount > 0) guestCount-- },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Remove, null, tint = if (guestCount > 0) OxfordBlue else SecondaryText)
                        }
                        Text(
                            "$guestCount",
                            fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue
                        )
                        IconButton(
                            onClick = { if (guestCount < 5) guestCount++ },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Add, null, tint = OxfordBlue)
                        }
                        Text(
                            if (guestCount == 0) "Just me" else "+$guestCount guest${if (guestCount > 1) "s" else ""}",
                            fontSize = 13.sp, color = SecondaryText
                        )
                    }

                    if (event.pricePerPerson > 0) {
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "Total: £%.0f".format(event.pricePerPerson * (1 + guestCount)),
                            fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue
                        )
                    }

                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(
                        value = specialRequests,
                        onValueChange = { specialRequests = it },
                        label = { Text("Special Requests") },
                        placeholder = { Text("Dietary requirements, seating preferences…") },
                        minLines = 2,
                        maxLines = 4,
                        modifier = Modifier.fillMaxWidth(),
                        colors = fieldColors,
                        shape = RoundedCornerShape(10.dp)
                    )

                    errorMsg?.let {
                        Spacer(Modifier.height(8.dp))
                        Text(it, color = Color(0xFFEB5757), fontSize = 12.sp)
                    }

                    Spacer(Modifier.height(20.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.weight(1f).height(46.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) { Text("Cancel", color = OxfordBlue) }
                        Button(
                            onClick = {
                                if (isLunchDinner && mealOption == null) {
                                    errorMsg = "Please select lunch or dinner sitting."
                                    return@Button
                                }
                                isSubmitting = true; errorMsg = null
                                scope.launch {
                                    try {
                                        withContext(Dispatchers.IO) {
                                            ApiService.bookEvent(
                                                token = token,
                                                eventId = event.id,
                                                memberEmail = member.email,
                                                guestCount = guestCount,
                                                mealOption = mealOption,
                                                specialRequests = specialRequests.trim().ifBlank { null }
                                            )
                                        }
                                        submitted = true
                                    } catch (e: Exception) {
                                        errorMsg = e.message ?: "Booking failed. Please try again."
                                    } finally {
                                        isSubmitting = false
                                    }
                                }
                            },
                            enabled = !isSubmitting,
                            modifier = Modifier.weight(1f).height(46.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = OxfordBlue),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            if (isSubmitting) CircularProgressIndicator(
                                modifier = Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp
                            )
                            else Text("Request Booking", color = Color.White, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}
