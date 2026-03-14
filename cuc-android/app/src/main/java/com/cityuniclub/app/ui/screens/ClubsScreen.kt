package com.cityuniclub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.cityuniclub.app.network.ApiService
import com.cityuniclub.app.network.ReciprocalClub
import com.cityuniclub.app.ui.theme.CambridgeBlue
import com.cityuniclub.app.ui.theme.CardWhite
import com.cityuniclub.app.ui.theme.OxfordBlue
import com.cityuniclub.app.ui.theme.SecondaryText
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private sealed class ClubNavState {
    object Regions : ClubNavState()
    data class Countries(val regions: List<String>) : ClubNavState()
    data class Cities(val regions: List<String>, val country: String) : ClubNavState()
    data class ClubList(val regions: List<String>, val country: String, val city: String?) : ClubNavState()
}

private val regionGroups = linkedMapOf(
    "UK & Ireland"          to listOf("United Kingdom", "Ireland"),
    "Europe"                to listOf("Europe"),
    "Americas"              to listOf("USA", "Canada", "Americas", "South America"),
    "Asia Pacific"          to listOf("Asia", "Australia", "Oceania"),
    "Middle East & Africa"  to listOf("Middle East", "Africa")
)

@Composable
fun ClubsScreen(token: String) {
    var navState by remember { mutableStateOf<ClubNavState>(ClubNavState.Regions) }
    var searchQuery by remember { mutableStateOf("") }
    var isSearching by remember { mutableStateOf(false) }
    var searchResults by remember { mutableStateOf<List<ReciprocalClub>>(emptyList()) }
    var searchError by remember { mutableStateOf<String?>(null) }
    var totalCount by remember { mutableStateOf<Int?>(null) }
    val scope = rememberCoroutineScope()

    var loiClub by remember { mutableStateOf<ReciprocalClub?>(null) }

    Column(
        modifier = Modifier.fillMaxSize().background(OxfordBlue)
    ) {
        Column(modifier = Modifier.padding(horizontal = 20.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 24.dp, bottom = 16.dp)
            ) {
                if (navState !is ClubNavState.Regions) {
                    IconButton(
                        onClick = {
                            navState = when (val s = navState) {
                                is ClubNavState.Countries -> ClubNavState.Regions
                                is ClubNavState.Cities -> ClubNavState.Countries(s.regions)
                                is ClubNavState.ClubList -> if (s.city != null)
                                    ClubNavState.Cities(s.regions, s.country)
                                else
                                    ClubNavState.Countries(s.regions)
                                else -> ClubNavState.Regions
                            }
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, null, tint = Color.White)
                    }
                    Spacer(Modifier.width(8.dp))
                }
                Text(
                    text = when (val s = navState) {
                        is ClubNavState.Regions ->
                            if (totalCount != null) "Reciprocal Clubs ($totalCount)" else "Reciprocal Clubs"
                        is ClubNavState.Countries -> s.regions.joinToString(" & ")
                        is ClubNavState.Cities -> s.country
                        is ClubNavState.ClubList -> s.city ?: s.country
                    },
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Light,
                    color = Color.White,
                    modifier = Modifier.weight(1f)
                )
            }

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { q ->
                    searchQuery = q
                    if (q.length >= 2) {
                        isSearching = true
                        searchError = null
                        scope.launch {
                            try {
                                searchResults = withContext(Dispatchers.IO) { ApiService.searchClubs(token, q) }
                            } catch (e: Exception) {
                                searchError = e.message
                            } finally {
                                isSearching = false
                            }
                        }
                    } else {
                        searchResults = emptyList()
                    }
                },
                placeholder = { Text("Search clubs…", color = SecondaryText, fontSize = 14.sp) },
                leadingIcon = { Icon(Icons.Default.Search, null, tint = SecondaryText) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = ""; searchResults = emptyList() }) {
                            Icon(Icons.Default.Close, null, tint = SecondaryText)
                        }
                    }
                },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CambridgeBlue.copy(alpha = 0.4f),
                    unfocusedBorderColor = CambridgeBlue.copy(alpha = 0.2f),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    cursorColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp)
            )
        }

        if (searchQuery.length >= 2) {
            SearchResultsPanel(
                isLoading = isSearching,
                results = searchResults,
                error = searchError,
                onLoiClick = { loiClub = it }
            )
        } else {
            when (val s = navState) {
                is ClubNavState.Regions -> RegionsPanel(
                    token,
                    onRegionSelected = { regions -> navState = ClubNavState.Countries(regions) },
                    onTotalLoaded = { totalCount = it }
                )
                is ClubNavState.Countries -> CountriesPanel(token, s.regions,
                    onCountrySelected = { country -> navState = ClubNavState.Cities(s.regions, country) })
                is ClubNavState.Cities -> CitiesPanel(token, s.regions, s.country,
                    onCitySelected = { city -> navState = ClubNavState.ClubList(s.regions, s.country, city) })
                is ClubNavState.ClubList -> ClubListPanel(
                    token, s.regions, s.country, s.city, onLoiClick = { loiClub = it })
            }
        }
    }

    loiClub?.let { club ->
        LoiDialog(club = club, token = token, onDismiss = { loiClub = null })
    }
}

@Composable
private fun RegionsPanel(
    token: String,
    onRegionSelected: (List<String>) -> Unit,
    onTotalLoaded: (Int) -> Unit
) {
    var regionCounts by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            regionCounts = withContext(Dispatchers.IO) { ApiService.getClubRegionCounts(token) }
            onTotalLoaded(regionCounts.values.sum())
        } catch (e: Exception) {
            error = e.message
        } finally {
            isLoading = false
        }
    }

    LoadingOrError(isLoading, error) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(regionGroups.entries.toList()) { (label, keys) ->
                val count = keys.sumOf { regionCounts[it] ?: 0 }
                DrillDownCard(
                    title = if (count > 0) "$label ($count)" else label,
                    onClick = { onRegionSelected(keys) }
                )
            }
            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun CountriesPanel(token: String, regions: List<String>, onCountrySelected: (String) -> Unit) {
    var countries by remember { mutableStateOf<List<com.cityuniclub.app.network.CountryCount>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(regions) {
        try {
            countries = withContext(Dispatchers.IO) { ApiService.getClubCountryCounts(token, regions) }
        } catch (e: Exception) {
            error = e.message
        } finally {
            isLoading = false
        }
    }

    LoadingOrError(isLoading, error) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(countries) { c ->
                DrillDownCard(
                    title = if (c.count > 0) "${c.country} (${c.count})" else c.country,
                    onClick = { onCountrySelected(c.country) }
                )
            }
            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun CitiesPanel(token: String, regions: List<String>, country: String, onCitySelected: (String?) -> Unit) {
    var cities by remember { mutableStateOf<List<com.cityuniclub.app.network.CityCount>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(country) {
        try {
            cities = withContext(Dispatchers.IO) { ApiService.getClubCityCounts(token, regions, country) }
        } catch (e: Exception) {
            error = e.message
        } finally {
            isLoading = false
        }
    }

    LoadingOrError(isLoading, error) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (cities.size == 1) {
                item { LaunchedEffect(Unit) { onCitySelected(null) } }
            } else {
                items(cities) { c ->
                    DrillDownCard(
                        title = if (c.count > 0) "${c.city} (${c.count})" else c.city,
                        onClick = { onCitySelected(c.city) }
                    )
                }
            }
            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun ClubListPanel(
    token: String, regions: List<String>, country: String, city: String?,
    onLoiClick: (ReciprocalClub) -> Unit
) {
    var clubs by remember { mutableStateOf<List<ReciprocalClub>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(city) {
        try {
            clubs = withContext(Dispatchers.IO) {
                if (city != null) ApiService.getClubsByCity(token, regions, country, city)
                else ApiService.getClubsByCountry(token, regions, country)
            }
        } catch (e: Exception) {
            error = e.message
        } finally {
            isLoading = false
        }
    }

    LoadingOrError(isLoading, error) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(clubs) { club -> ClubCard(club = club, onLoiClick = { onLoiClick(club) }) }
            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun SearchResultsPanel(
    isLoading: Boolean, results: List<ReciprocalClub>,
    error: String?, onLoiClick: (ReciprocalClub) -> Unit
) {
    LoadingOrError(isLoading, error) {
        if (results.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No clubs found", color = SecondaryText, textAlign = TextAlign.Center)
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(results) { club -> ClubCard(club = club, onLoiClick = { onLoiClick(club) }) }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@Composable
private fun DrillDownCard(title: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.06f)),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.Normal, color = Color.White)
            Icon(Icons.Default.ChevronRight, null, tint = SecondaryText, modifier = Modifier.size(20.dp))
        }
    }
}

@Composable
private fun ClubCard(club: ReciprocalClub, onLoiClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(club.name, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue)
            Spacer(Modifier.height(4.dp))
            Text(club.location, fontSize = 12.sp, color = SecondaryText)
            if (!club.note.isNullOrBlank()) {
                Spacer(Modifier.height(6.dp))
                Text(club.note, fontSize = 12.sp, color = Color(0xFF4A4A4A), lineHeight = 16.sp)
            }
            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = onLoiClick,
                modifier = Modifier.fillMaxWidth().height(40.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = OxfordBlue),
                border = ButtonDefaults.outlinedButtonBorder
            ) {
                Icon(Icons.Default.Mail, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Request Letter of Introduction", fontSize = 13.sp)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LoiDialog(club: ReciprocalClub, token: String, onDismiss: () -> Unit) {
    val scope = rememberCoroutineScope()
    var message by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }
    var submitted by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = CardWhite),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp).verticalScroll(rememberScrollState())
            ) {
                Text("Letter of Introduction", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = OxfordBlue)
                Spacer(Modifier.height(4.dp))
                Text(club.name, fontSize = 14.sp, color = SecondaryText)

                if (submitted) {
                    Spacer(Modifier.height(20.dp))
                    Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF27AE60),
                        modifier = Modifier.size(48.dp).align(Alignment.CenterHorizontally))
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Your request has been submitted. The club secretary will be in touch.",
                        fontSize = 14.sp, color = OxfordBlue, textAlign = TextAlign.Center
                    )
                    Spacer(Modifier.height(20.dp))
                    Button(onClick = onDismiss, modifier = Modifier.fillMaxWidth().height(46.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OxfordBlue),
                        shape = RoundedCornerShape(12.dp)) {
                        Text("Close", color = Color.White)
                    }
                } else {
                    Spacer(Modifier.height(20.dp))
                    Text("An introduction request will be sent on your behalf to ${club.name}.",
                        fontSize = 13.sp, color = Color(0xFF4A4A4A), lineHeight = 18.sp)
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(
                        value = message, onValueChange = { message = it },
                        label = { Text("Personal Message (optional)") },
                        minLines = 3, maxLines = 6,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = OxfordBlue.copy(alpha = 0.4f),
                            unfocusedBorderColor = Color(0xFFCCCCCC),
                            focusedTextColor = OxfordBlue,
                            unfocusedTextColor = OxfordBlue,
                            cursorColor = OxfordBlue
                        ),
                        shape = RoundedCornerShape(10.dp)
                    )
                    errorMsg?.let {
                        Spacer(Modifier.height(8.dp))
                        Text(it, color = Color(0xFFEB5757), fontSize = 12.sp)
                    }
                    Spacer(Modifier.height(20.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f).height(46.dp),
                            shape = RoundedCornerShape(12.dp)) {
                            Text("Cancel", color = OxfordBlue)
                        }
                        Button(
                            onClick = {
                                isSubmitting = true; errorMsg = null
                                scope.launch {
                                    try {
                                        val request = mapOf<String, Any?>(
                                            "club_id" to club.id, "club_name" to club.name,
                                            "personal_message" to message.trim().ifBlank { null }
                                        )
                                        withContext(Dispatchers.IO) { ApiService.createLoiRequest(token, request) }
                                        submitted = true
                                    } catch (e: Exception) {
                                        errorMsg = e.message ?: "Request failed. Please try again."
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
                                modifier = Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
                            else Text("Send Request", color = Color.White, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LoadingOrError(isLoading: Boolean, error: String?, content: @Composable () -> Unit) {
    when {
        isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = CambridgeBlue)
        }
        error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(error, color = SecondaryText, textAlign = TextAlign.Center, modifier = Modifier.padding(32.dp))
        }
        else -> content()
    }
}
