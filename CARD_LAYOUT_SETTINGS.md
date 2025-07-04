# Card Layout Settings

## Overview
The Card Layout Settings allow you to control how content is displayed in different screens of your mobile app. These settings are stored in Firestore under `app_settings/general` and are applied in real-time.

## Available Settings

### 1. Home Screen Card Layout (`homeCardLayout`)
- **Purpose**: Controls how categories are displayed on the home screen
- **Options**: 
  - `grid` - Categories displayed in a grid format (default)
  - `list` - Categories displayed in a list format
- **Firestore Field**: `homeCardLayout`

### 2. Categories Screen Card Layout (`categoryCardLayout`)
- **Purpose**: Controls how topics are displayed in category screens
- **Options**:
  - `grid` - Topics displayed in a grid format (default)
  - `list` - Topics displayed in a list format
- **Firestore Field**: `categoryCardLayout`

### 3. Node Screen Card Layout (`nodeCardLayout`)
- **Purpose**: Controls how content items are displayed in topic screens
- **Options**:
  - `grid` - Content items displayed in a grid format
  - `list` - Content items displayed in a list format (default)
- **Firestore Field**: `nodeCardLayout`

## Firestore Structure
```json
{
  "homeCardLayout": "grid",
  "categoryCardLayout": "list", 
  "nodeCardLayout": "grid"
}
```

## Implementation Details

### Admin Panel
- Location: `src/pages/AppSettings.tsx`
- UI Components: Material-UI Select dropdowns
- Real-time updates: Changes are saved to Firestore immediately
- Validation: All fields are required and have default values

### Mobile App Integration
The mobile app should read these fields from Firestore and apply the layout accordingly:

1. **Grid Layout**: Display items in a responsive grid (e.g., 2-3 columns)
2. **List Layout**: Display items in a vertical list format

### Default Values
- `homeCardLayout`: "grid"
- `categoryCardLayout`: "grid" 
- `nodeCardLayout`: "list"

## Usage Instructions

1. Navigate to the App Settings page in the admin panel
2. Find the "Card Layout Settings" section
3. Use the dropdown menus to select your preferred layout for each screen
4. Click "Save All Settings" to persist changes
5. Changes will be reflected in the mobile app within 24 hours or on next app restart

## Benefits
- **Flexibility**: Different layouts for different content types
- **User Experience**: Optimize display based on content characteristics
- **Real-time Control**: Make changes without app updates
- **Consistency**: Maintain consistent layout across all users 