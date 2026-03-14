package com.cityuniclub.app

import android.content.Context

class UserPreferences(context: Context) {

    companion object {
        private const val PREFS_NAME = "cuc_user_prefs"
        private const val KEY_DISPLAY_NAME = "display_name"
    }

    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getDisplayName(): String = prefs.getString(KEY_DISPLAY_NAME, "") ?: ""

    fun setDisplayName(name: String) {
        prefs.edit().putString(KEY_DISPLAY_NAME, name).apply()
    }
}
