package uk.co.cityuniversityclub.util

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private val displayFormatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.UK)

fun formatMonthYear(isoDate: String?): String {
    if (isoDate.isNullOrBlank()) return ""
    return try {
        LocalDate.parse(isoDate).format(displayFormatter)
    } catch (_: Exception) {
        ""
    }
}
