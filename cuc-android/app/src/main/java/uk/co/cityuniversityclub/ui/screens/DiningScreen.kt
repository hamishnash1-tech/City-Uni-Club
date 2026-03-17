package uk.co.cityuniversityclub.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import uk.co.cityuniversityclub.network.ApiService
import uk.co.cityuniversityclub.network.Member
import uk.co.cityuniversityclub.ui.theme.CambridgeBlue
import uk.co.cityuniversityclub.ui.theme.OxfordBlue
import uk.co.cityuniversityclub.ui.theme.SecondaryText
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.TimeZone

private val breakfastTimes = listOf("09:00", "09:30", "10:00", "10:30", "11:00")
private val lunchTimes     = listOf("12:00", "12:30", "13:00", "13:30", "14:00", "14:30")

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun DiningScreen(token: String, member: Member) {
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    var mealType by remember { mutableStateOf("Lunch") }
    var date by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var guestCount by remember { mutableStateOf(2) }
    var tablePreference by remember { mutableStateOf("") }
    var specialRequests by remember { mutableStateOf("") }

    var isSubmitting by remember { mutableStateOf(false) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }
    var pendingTime by remember { mutableStateOf("") }
    val datePickerState = rememberDatePickerState()

    val times = if (mealType == "Breakfast") breakfastTimes else lunchTimes

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = CambridgeBlue.copy(alpha = 0.5f),
        unfocusedBorderColor = CambridgeBlue.copy(alpha = 0.2f),
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White,
        focusedLabelColor = CambridgeBlue,
        unfocusedLabelColor = SecondaryText,
        cursorColor = Color.White
    )

    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
                        cal.timeInMillis = millis
                        val y = cal.get(Calendar.YEAR)
                        val m = cal.get(Calendar.MONTH) + 1
                        val d = cal.get(Calendar.DAY_OF_MONTH)
                        date = "%04d-%02d-%02d".format(y, m, d)
                        time = ""
                    }
                    showDatePicker = false
                }) { Text("OK", color = OxfordBlue) }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("Cancel", color = SecondaryText) }
            }
        ) {
            DatePicker(
                state = datePickerState,
                colors = DatePickerDefaults.colors(
                    selectedDayContainerColor = OxfordBlue,
                    todayDateBorderColor = OxfordBlue,
                    todayContentColor = OxfordBlue
                )
            )
        }
    }

    if (showTimePicker) {
        Dialog(onDismissRequest = { showTimePicker = false }) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(modifier = Modifier.padding(horizontal = 24.dp, vertical = 20.dp)) {
                    Text(
                        "Select Time",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = OxfordBlue
                    )
                    Spacer(Modifier.height(20.dp))
                    TimeSlotGroup(
                        label = mealType,
                        times = times,
                        selected = pendingTime,
                        onSelect = { pendingTime = it }
                    )
                    Spacer(Modifier.height(20.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { showTimePicker = false }) {
                            Text("Cancel", color = SecondaryText)
                        }
                        Spacer(Modifier.width(4.dp))
                        TextButton(
                            onClick = { time = pendingTime; showTimePicker = false },
                            enabled = pendingTime.isNotBlank()
                        ) {
                            Text(
                                "Confirm",
                                color = if (pendingTime.isNotBlank()) OxfordBlue else SecondaryText,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OxfordBlue)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Dining Reservation",
            fontSize = 24.sp,
            fontWeight = FontWeight.Light,
            color = Color.White,
            modifier = Modifier.padding(top = 24.dp, bottom = 6.dp)
        )
        Text(
            text = "42 Crutched Friars, EC3N 2AP",
            fontSize = 13.sp,
            color = SecondaryText,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        successMessage?.let {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1B4332)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF6FCF97), modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(10.dp))
                    Text(it, color = Color(0xFF6FCF97), fontSize = 14.sp)
                }
            }
        }

        errorMessage?.let {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF3B1A1A)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Error, null, tint = Color(0xFFEB5757), modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(10.dp))
                    Text(it, color = Color(0xFFEB5757), fontSize = 14.sp)
                }
            }
        }

        SectionLabel("Select Meal")
        Spacer(Modifier.height(8.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            listOf("Breakfast" to "09:00 – 11:00", "Lunch" to "12:00 – 14:30").forEach { (type, hours) ->
                val selected = mealType == type
                Card(
                    modifier = Modifier.weight(1f).clickable { mealType = type; time = "" },
                    colors = CardDefaults.cardColors(
                        containerColor = if (selected) CambridgeBlue.copy(alpha = 0.18f) else Color.White.copy(alpha = 0.05f)
                    ),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(
                        width = if (selected) 1.5.dp else 0.5.dp,
                        color = if (selected) CambridgeBlue else Color.White.copy(alpha = 0.12f)
                    )
                ) {
                    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
                        Text(type, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = Color.White)
                        Text(hours, fontSize = 11.sp, color = SecondaryText, modifier = Modifier.padding(top = 2.dp))
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))
        SectionLabel("Date & Guests")
        Spacer(Modifier.height(8.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = date,
                onValueChange = {},
                readOnly = true,
                label = { Text("Date") },
                placeholder = { Text("Select date", color = SecondaryText, fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.CalendarMonth, null, tint = SecondaryText) },
                trailingIcon = {
                    IconButton(onClick = { showDatePicker = true }) {
                        Icon(Icons.Default.EditCalendar, null, tint = CambridgeBlue)
                    }
                },
                singleLine = true,
                modifier = Modifier.weight(1f).clickable { showDatePicker = true },
                colors = fieldColors,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = time,
                onValueChange = {},
                readOnly = true,
                label = { Text("Time") },
                placeholder = { Text("Select time", color = SecondaryText, fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Schedule, null, tint = SecondaryText) },
                trailingIcon = {
                    IconButton(onClick = { pendingTime = time; showTimePicker = true }) {
                        Icon(Icons.Default.AccessTime, null, tint = CambridgeBlue)
                    }
                },
                singleLine = true,
                modifier = Modifier.weight(1f).clickable { pendingTime = time; showTimePicker = true },
                colors = fieldColors,
                shape = RoundedCornerShape(12.dp)
            )
        }

        Spacer(Modifier.height(12.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(0.5.dp, CambridgeBlue.copy(alpha = 0.2f))
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.Group, null, tint = SecondaryText, modifier = Modifier.size(18.dp))
                    Text("Number of Guests", fontSize = 14.sp, color = Color.White)
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    IconButton(
                        onClick = { if (guestCount > 1) guestCount-- },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Remove, null, tint = if (guestCount > 1) Color.White else SecondaryText)
                    }
                    Text("$guestCount", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    IconButton(
                        onClick = { if (guestCount < 20) guestCount++ },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Add, null, tint = Color.White)
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))
        SectionLabel("Additional Details")
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = tablePreference,
            onValueChange = { tablePreference = it },
            label = { Text("Table Preference") },
            placeholder = { Text("Window seat, quiet corner…", color = SecondaryText, fontSize = 12.sp) },
            leadingIcon = { Icon(Icons.Default.TableRestaurant, null, tint = SecondaryText) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = fieldColors,
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = specialRequests,
            onValueChange = { specialRequests = it },
            label = { Text("Special Requests") },
            placeholder = { Text("Dietary requirements, allergies…", color = SecondaryText, fontSize = 12.sp) },
            leadingIcon = { Icon(Icons.Default.Notes, null, tint = SecondaryText) },
            minLines = 3,
            maxLines = 5,
            modifier = Modifier.fillMaxWidth(),
            colors = fieldColors,
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(Modifier.height(28.dp))

        Button(
            onClick = {
                errorMessage = null
                successMessage = null
                isSubmitting = true
                scope.launch {
                    try {
                        val reservation = mapOf<String, Any?>(
                            "reservation_date" to date.trim(),
                            "reservation_time" to time.trim(),
                            "meal_type" to mealType,
                            "guest_count" to guestCount,
                            "table_preference" to tablePreference.trim().ifBlank { null },
                            "special_requests" to specialRequests.trim().ifBlank { null }
                        )
                        withContext(Dispatchers.IO) {
                            ApiService.createDiningReservation(token.ifBlank { null }, reservation)
                        }
                        successMessage = "Your reservation request has been submitted. The club will be in touch."
                        date = ""; time = ""; tablePreference = ""; specialRequests = ""
                    } catch (e: Exception) {
                        errorMessage = e.message ?: "Submission failed. Please try again."
                    } finally {
                        isSubmitting = false
                    }
                }
            },
            enabled = !isSubmitting && date.isNotBlank() && time.isNotBlank(),
            modifier = Modifier.fillMaxWidth().height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = CambridgeBlue),
            shape = RoundedCornerShape(14.dp)
        ) {
            if (isSubmitting) {
                CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Color.White, strokeWidth = 2.dp)
            } else {
                Icon(Icons.Default.Restaurant, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Request Reservation", fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TimeSlotGroup(label: String, times: List<String>, selected: String, onSelect: (String) -> Unit) {
    Text(
        text = label.uppercase(),
        fontSize = 10.sp,
        fontWeight = FontWeight.Medium,
        color = SecondaryText,
        letterSpacing = 1.sp,
        modifier = Modifier.padding(bottom = 8.dp)
    )
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        times.forEach { t ->
            val isSelected = selected == t
            Surface(
                onClick = { onSelect(t) },
                shape = RoundedCornerShape(10.dp),
                color = if (isSelected) OxfordBlue else Color(0xFFF2F4F3),
                border = if (isSelected) null else BorderStroke(1.dp, Color(0xFFDDE0DF))
            ) {
                Text(
                    text = t,
                    fontSize = 14.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    color = if (isSelected) Color.White else OxfordBlue,
                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp)
                )
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text.uppercase(),
        fontSize = 10.sp,
        fontWeight = FontWeight.Medium,
        color = CambridgeBlue,
        letterSpacing = 1.5.sp
    )
}
