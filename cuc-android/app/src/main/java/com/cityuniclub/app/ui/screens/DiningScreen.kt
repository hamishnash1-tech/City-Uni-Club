package com.cityuniclub.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.cityuniclub.app.network.ApiService
import com.cityuniclub.app.network.Member
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.SecondaryText
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.TimeZone

private val lunchTimes  = listOf("12:00", "12:30", "13:00", "13:30", "14:00", "14:30")
private val dinnerTimes = listOf("18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30")

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun DiningScreen(token: String, member: Member) {
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    var name by remember { mutableStateOf(member.fullName) }
    var email by remember { mutableStateOf(member.email) }
    var date by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var partySize by remember { mutableStateOf("2") }
    var notes by remember { mutableStateOf("") }

    var isSubmitting by remember { mutableStateOf(false) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }
    var pendingTime by remember { mutableStateOf("") }
    val datePickerState = rememberDatePickerState()

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = CambridgeBlue.copy(alpha = 0.5f),
        unfocusedBorderColor = CambridgeBlue.copy(alpha = 0.2f),
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White,
        focusedLabelColor = CambridgeBlue,
        unfocusedLabelColor = SecondaryText,
        cursorColor = Color.White
    )

    // Date picker dialog
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

    // Time picker — quick-select chips for common dining slots
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
                        label = "Lunch",
                        times = lunchTimes,
                        selected = pendingTime,
                        onSelect = { pendingTime = it }
                    )

                    Spacer(Modifier.height(16.dp))

                    TimeSlotGroup(
                        label = "Dinner",
                        times = dinnerTimes,
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
                            onClick = {
                                time = pendingTime
                                showTimePicker = false
                            },
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

        SectionLabel("Your Details")
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Full Name") },
            leadingIcon = { Icon(Icons.Default.Person, null, tint = SecondaryText) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = fieldColors,
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            leadingIcon = { Icon(Icons.Default.Email, null, tint = SecondaryText) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = fieldColors,
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(Modifier.height(20.dp))
        SectionLabel("Reservation Details")
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

        OutlinedTextField(
            value = partySize,
            onValueChange = { if (it.all(Char::isDigit)) partySize = it },
            label = { Text("Party Size") },
            leadingIcon = { Icon(Icons.Default.Group, null, tint = SecondaryText) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = fieldColors,
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Special Requests / Dietary Requirements") },
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
                            "name" to name.trim(),
                            "email" to email.trim(),
                            "date" to date.trim(),
                            "time" to time.trim(),
                            "party_size" to (partySize.toIntOrNull() ?: 2),
                            "notes" to notes.trim().ifBlank { null }
                        )
                        withContext(Dispatchers.IO) {
                            ApiService.createDiningReservation(token.ifBlank { null }, reservation)
                        }
                        successMessage = "Your reservation request has been submitted. The club will be in touch."
                        date = ""; time = ""; notes = ""
                    } catch (e: Exception) {
                        errorMessage = e.message ?: "Submission failed. Please try again."
                    } finally {
                        isSubmitting = false
                    }
                }
            },
            enabled = !isSubmitting && name.isNotBlank() && email.isNotBlank() && date.isNotBlank() && time.isNotBlank(),
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
