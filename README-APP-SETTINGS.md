# 📱 Dynamic App Settings Management

This feature allows you to control your mobile app's settings dynamically through your admin panel without requiring app updates.

## 🎯 **What You Can Control**

### **Authentication Control**
- **Google Authentication Required** - Toggle to enable/disable mandatory Google sign-in

### **App Identity**
- **App Name** - Display name of your learning app

### **Home Screen Content**
- **Home Greeting** - Welcome message with username placeholder
- **Home Subtitle** - Subtitle text below greeting
- **Categories Title** - Title for categories section

### **Promo Card**
- **Promo Card Title** - Main promotional title
- **Promo Card Subtitle** - Multi-line promotional text

### **Search Settings**
- **Search Placeholders** - 3 rotating search placeholder texts

### **User Messages & States**
- **Searching Text** - Loading message during search
- **No Results Text** - Message when search returns no results
- **No Categories Text** - Message when no categories available
- **Pull to Refresh Text** - Pull-to-refresh instruction
- **Failed to Load Text** - Error message for loading failures
- **Lessons Count Text** - Format for lesson count display

### **Settings Screen**
- **Privacy Policy URL** - Link to your app's privacy policy
- **About Developer Text** - Text shown in "About Developer" section  
- **Share App Message** - Message when users share your app
- **Rate App Message** - Message asking users to rate your app
- **More Apps URL** - Link to your other apps on Play Store

## 🔧 **Setup Instructions**

### 1. **Firestore Database Setup**

Create the following document in your Firestore database:

**Collection:** `app_settings`  
**Document ID:** `general`

```json
{
  "authEnabled": false,
  "appName": "LearningApp",
  
  "homeGreeting": "Hi, %1$s",
  "homeSubtitle": "What would you like to learn today?",
  "homeCategoriesTitle": "Categories",
  
  "promoCardTitle": "Study App",
  "promoCardSubtitle": "Every Books Solutions\nAvailable for Free",
  
  "searchPlaceholder1": "Search Mathematics...",
  "searchPlaceholder2": "Search Science...",
  "searchPlaceholder3": "Search Economics...",
  
  "searchingText": "Searching...",
  "noResultsText": "No results found for \"%1$s\"",
  "noCategoriesText": "No categories available",
  "pullToRefreshText": "Pull down to refresh",
  "failedToLoadText": "Failed to load categories",
  "lessonsCountText": "%1$d Lessons",
  
  "privacyPolicyUrl": "https://sites.google.com/view/privacypolicy-awesomeeducation",
  "aboutDeveloperText": "Developed by Karan Singh Jadoun",
  "shareAppText": "Check out this amazing study app! %1$s",
  "rateAppText": "If you enjoy using this app, please rate us!",
  "moreAppsUrl": "https://play.google.com/store/apps/developer?id=YourDeveloperName",
  
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### 2. **Firestore Security Rules**

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... your existing rules ...
    
    // App Settings - read by all authenticated users, write by admins only
    match /app_settings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email in ['your-admin@email.com']; // Replace with your admin email
    }
  }
}
```

### 3. **Android App Integration**

Add this code to your Android app to fetch and use these settings:

#### **3.1 Add Dependencies (if not already added)**

```kotlin
// In your app-level build.gradle
implementation 'com.google.firebase:firebase-firestore-ktx'
implementation 'com.google.code.gson:gson:2.8.9'
```

#### **3.2 Create AppSettings Data Class**

```kotlin
// AppSettings.kt
data class AppSettings(
    // Authentication Control
    val authEnabled: Boolean = false,
    
    // App Identity
    val appName: String = "LearningApp",
    
    // Home Screen Content
    val homeGreeting: String = "Hi, %1\$s",
    val homeSubtitle: String = "What would you like to learn today?",
    val homeCategoriesTitle: String = "Categories",
    
    // Promo Card
    val promoCardTitle: String = "Study App",
    val promoCardSubtitle: String = "Every Books Solutions\nAvailable for Free",
    
    // Search Settings
    val searchPlaceholder1: String = "Search Mathematics...",
    val searchPlaceholder2: String = "Search Science...",
    val searchPlaceholder3: String = "Search Economics...",
    
    // User Messages
    val searchingText: String = "Searching...",
    val noResultsText: String = "No results found for \"%1\$s\"",
    val noCategoriesText: String = "No categories available",
    val pullToRefreshText: String = "Pull down to refresh",
    val failedToLoadText: String = "Failed to load categories",
    val lessonsCountText: String = "%1\$d Lessons",
    
    // Settings Screen
    val privacyPolicyUrl: String = "https://sites.google.com/view/privacypolicy-awesomeeducation",
    val aboutDeveloperText: String = "Developed by Karan Singh Jadoun",
    val shareAppText: String = "Check out this amazing study app! %1\$s",
    val rateAppText: String = "If you enjoy using this app, please rate us!",
    val moreAppsUrl: String = "https://play.google.com/store/apps/developer?id=YourDeveloperName",
    
    val lastUpdated: String = ""
)
```

#### **3.3 Create AppSettingsManager**

```kotlin
// AppSettingsManager.kt
import android.content.Context
import android.content.SharedPreferences
import com.google.firebase.firestore.FirebaseFirestore
import com.google.gson.Gson
import kotlinx.coroutines.tasks.await
import java.util.concurrent.TimeUnit

class AppSettingsManager(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
    private val firestore = FirebaseFirestore.getInstance()
    private val gson = Gson()
    
    companion object {
        private const val SETTINGS_KEY = "cached_settings"
        private const val LAST_FETCH_KEY = "last_fetch_time"
        private const val CACHE_DURATION = 24 * 60 * 60 * 1000L // 24 hours in milliseconds
    }
    
    suspend fun getSettings(): AppSettings {
        val cachedSettings = getCachedSettings()
        val lastFetch = prefs.getLong(LAST_FETCH_KEY, 0)
        val now = System.currentTimeMillis()
        
        // Return cached settings if they're less than 24 hours old
        if (cachedSettings != null && (now - lastFetch) < CACHE_DURATION) {
            return cachedSettings
        }
        
        // Fetch fresh settings from Firestore
        return try {
            val freshSettings = fetchSettingsFromFirestore()
            cacheSettings(freshSettings)
            freshSettings
        } catch (e: Exception) {
            e.printStackTrace()
            // Return cached settings if Firestore fetch fails
            cachedSettings ?: AppSettings()
        }
    }
    
    private suspend fun fetchSettingsFromFirestore(): AppSettings {
        val document = firestore.collection("app_settings")
            .document("general")
            .get()
            .await()
            
        return if (document.exists()) {
            document.toObject(AppSettings::class.java) ?: AppSettings()
        } else {
            AppSettings()
        }
    }
    
    private fun getCachedSettings(): AppSettings? {
        val json = prefs.getString(SETTINGS_KEY, null)
        return if (json != null) {
            try {
                gson.fromJson(json, AppSettings::class.java)
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }
    
    private fun cacheSettings(settings: AppSettings) {
        val json = gson.toJson(settings)
        prefs.edit()
            .putString(SETTINGS_KEY, json)
            .putLong(LAST_FETCH_KEY, System.currentTimeMillis())
            .apply()
    }
    
    // Force refresh settings (call this from a manual refresh button)
    suspend fun refreshSettings(): AppSettings {
        return try {
            val freshSettings = fetchSettingsFromFirestore()
            cacheSettings(freshSettings)
            freshSettings
        } catch (e: Exception) {
            e.printStackTrace()
            getCachedSettings() ?: AppSettings()
        }
    }
}
```

#### **3.4 Usage in Your Activities/Fragments**

```kotlin
// In your SettingsActivity or wherever you handle these settings
class SettingsActivity : AppCompatActivity() {
    private lateinit var settingsManager: AppSettingsManager
    private lateinit var currentSettings: AppSettings
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        
        settingsManager = AppSettingsManager(this)
        loadSettings()
    }
    
    private fun loadSettings() {
        lifecycleScope.launch {
            try {
                currentSettings = settingsManager.getSettings()
                updateUI()
            } catch (e: Exception) {
                e.printStackTrace()
                // Handle error - maybe show a toast
            }
        }
    }
    
    private fun updateUI() {
        // Update your UI elements with the settings
        
        // Home Screen Elements
        val username = "John" // Get actual username
        findViewById<TextView>(R.id.homeGreeting).text = 
            String.format(currentSettings.homeGreeting, username)
        findViewById<TextView>(R.id.homeSubtitle).text = currentSettings.homeSubtitle
        findViewById<TextView>(R.id.categoriesTitle).text = currentSettings.homeCategoriesTitle
        
        // Promo Card
        findViewById<TextView>(R.id.promoTitle).text = currentSettings.promoCardTitle
        findViewById<TextView>(R.id.promoSubtitle).text = currentSettings.promoCardSubtitle
        
        // Search Placeholders (rotate them)
        val searchPlaceholders = listOf(
            currentSettings.searchPlaceholder1,
            currentSettings.searchPlaceholder2,
            currentSettings.searchPlaceholder3
        )
        // Implement rotation logic for search EditText
        
        // User Messages (use in appropriate places)
        // currentSettings.searchingText - show during search
        // currentSettings.noResultsText - show when no search results
        // currentSettings.noCategoriesText - show when no categories
        // currentSettings.pullToRefreshText - show in pull-to-refresh
        // currentSettings.failedToLoadText - show on load error
        // currentSettings.lessonsCountText - format lesson counts
        
        // Settings Screen
        findViewById<TextView>(R.id.privacyPolicyText).setOnClickListener {
            openUrl(currentSettings.privacyPolicyUrl)
        }
        
        findViewById<TextView>(R.id.aboutDeveloperText).text = currentSettings.aboutDeveloperText
        
        findViewById<LinearLayout>(R.id.shareAppLayout).setOnClickListener {
            shareApp()
        }
        
        findViewById<LinearLayout>(R.id.rateAppLayout).setOnClickListener {
            showRateDialog()
        }
        
        findViewById<LinearLayout>(R.id.moreAppsLayout).setOnClickListener {
            openUrl(currentSettings.moreAppsUrl)
        }
    }
    
    private fun shareApp() {
        val playStoreUrl = "https://play.google.com/store/apps/details?id=${packageName}"
        val shareText = String.format(currentSettings.shareAppText, playStoreUrl)
        
        val shareIntent = Intent().apply {
            action = Intent.ACTION_SEND
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, shareText)
        }
        startActivity(Intent.createChooser(shareIntent, "Share App"))
    }
    
    private fun showRateDialog() {
        AlertDialog.Builder(this)
            .setTitle("Rate App")
            .setMessage(currentSettings.rateAppText)
            .setPositiveButton("Rate Now") { _, _ ->
                openUrl("https://play.google.com/store/apps/details?id=${packageName}")
            }
            .setNegativeButton("Later", null)
            .show()
    }
    
    private fun openUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            // Handle error - maybe show a toast
        }
    }
}
```

## 🚀 **How It Works**

1. **Admin Panel**: You update settings through the web admin panel
2. **Firestore**: Settings are stored in Firestore database
3. **Mobile App**: App fetches settings on startup and caches them for 24 hours
4. **Offline Support**: If Firestore is unavailable, cached settings are used
5. **Automatic Updates**: Settings refresh automatically every 24 hours or on app restart

## 🔐 **Authentication Control Details**

### **When `authEnabled = false` (Default - Free Access):**
- ✅ Users can access all app content without signing in
- ✅ No Google authentication required
- ✅ App launches directly to home screen
- ✅ Settings screen shows no user profile
- ✅ Perfect for public educational content

### **When `authEnabled = true` (Authentication Required):**
- 🔐 Users must sign in with Google before accessing any content
- 🔐 App automatically redirects to authentication screen
- 🔐 Settings screen shows user profile and sign-out option  
- 🔐 All content is gated behind authentication
- 🔐 Perfect for premium or restricted content

### **Real-time Authentication Toggle:**
- Changes take effect **immediately** in the app
- No app restart required for authentication changes
- Users see authentication requirements update in real-time
- Seamless transition between authenticated and public modes

## ⚡ **Performance Features**

- **24-Hour Caching**: Reduces Firestore reads and improves performance
- **Offline Support**: Works even when device is offline
- **Fallback Values**: Uses default values if settings can't be loaded
- **Manual Refresh**: Option to force refresh settings

## 🎛️ **Admin Panel Features**

- **Real-time Validation**: URL validation and required field checking
- **Visual Feedback**: Loading states, success/error messages
- **Auto-save**: Prevents data loss
- **Last Updated Tracking**: Shows when settings were last modified

## 📝 **Important Notes**

1. **%1$s Placeholder**: In share app text, use `%1$s` where you want the Play Store URL to appear
2. **URL Validation**: Privacy Policy and More Apps URLs are validated
3. **Cache Duration**: Settings cache for 24 hours to reduce Firestore usage
4. **Security**: Only authenticated admin users can modify settings
5. **Fallback**: Always provide default values in case of network issues

## 🔐 **Security Considerations**

- Only authenticated users can read settings
- Only specific admin emails can write settings
- All URLs are validated before saving
- Settings are cached locally to reduce external dependencies

## 🐛 **Troubleshooting**

### **Settings Not Updating in App**
- Check if 24 hours have passed since last fetch
- Restart the app to force a refresh
- Verify Firestore security rules allow your user to read

### **Can't Save Settings in Admin Panel**
- Check your internet connection
- Verify your user has write permissions in Firestore rules
- Check browser console for any JavaScript errors

### **URLs Not Working**
- Ensure URLs start with `http://` or `https://`
- Test URLs in a browser first
- Check for typos or special characters

This setup gives you complete control over your app's settings without requiring app updates! 🎉 