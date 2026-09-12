# 📱 Bindu APK Build Guide

## Prerequisites

Before building the standalone APK, you need:

1. **Expo Account** (free)
   - Create one at: https://expo.dev/signup
   
2. **EAS CLI** ✅ Already installed
   ```bash
   eas --version  # Should show version number
   ```

## Step-by-Step Build Process

### 1. Login to Expo Account

```bash
eas login
```

Enter your Expo username and password when prompted.

### 2. Configure Your Project

```bash
eas build:configure
```

This will:
- Link your project to your Expo account
- Create an app slug if needed
- Confirm the `eas.json` configuration

### 3. Build the Preview APK

```bash
eas build -p android --profile preview
```

**What happens:**
- Your code is uploaded to Expo's build servers
- Android APK is built in the cloud (takes 5-15 minutes)
- You'll get a download link when complete

**Build profiles available:**
- `preview` — Internal distribution APK (recommended for testing)
- `production` — Production-ready APK
- `development` — Development build with Expo Go features

### 4. Download and Install

Once the build completes:
1. You'll receive a download URL in the terminal
2. Download the APK file to your Android device
3. Enable "Install from unknown sources" in Android settings
4. Install the APK
5. Open Bindu and complete the onboarding

### 5. Test Notifications

After installing:
1. Complete the setup flow (name, goal, interval, active hours)
2. Grant notification permission when prompted
3. Notifications will fire at scheduled intervals within your active hours
4. Test interactive actions:
   - **Drink** button logs water without opening the app
   - **Snooze** button reschedules for +10 minutes

## Build Status Monitoring

Track your build progress:
```bash
eas build:list
```

Or visit: https://expo.dev/accounts/[your-username]/projects/bindu/builds

## Common Issues & Solutions

### "Not logged in"
```bash
eas login
```

### "Project not linked"
```bash
eas build:configure
```

### "Android package name conflict"
Edit `app.json`:
```json
"android": {
  "package": "com.yourname.bindu"
}
```

### Build fails
Check build logs on Expo dashboard or run:
```bash
eas build:view [build-id]
```

## Local Development (Continue Testing in Expo Go)

While the build is processing, you can continue testing in Expo Go:

```bash
npm start
```

**Note:** Notifications in Expo Go will show permission stubs. Full notification functionality only works in the standalone APK.

## APK File Location

After download, your APK will be named something like:
```
bindu-[build-hash].apk
```

Transfer it to your Android device via:
- USB cable
- Email
- Cloud storage (Google Drive, Dropbox)
- Direct download on device

## Notification Permissions on Android 14

The first time you open the app after installation:
1. You'll be prompted for notification permission
2. Tap "Allow" to enable reminders
3. If you accidentally deny, go to:
   - Settings → Apps → Bindu → Notifications → Enable

## Next Build (After Changes)

Whenever you make code changes:

1. Test in Expo Go first
2. Commit your changes:
   ```bash
   git add -A
   git commit -m "your message"
   ```
3. Build new APK:
   ```bash
   eas build -p android --profile preview
   ```

## App Distribution

**Internal Testing:**
- Share APK link directly with testers
- No Play Store needed

**Public Release (Future):**
```bash
eas build -p android --profile production
eas submit -p android
```

## Troubleshooting

If you encounter any issues during the build process:

1. Check EAS documentation: https://docs.expo.dev/build/setup/
2. Verify all dependencies are compatible with Expo SDK 57
3. Review build logs for specific error messages
4. Ensure `app.json` and `eas.json` are properly configured

---

**Current Status:** ✅ Ready to build
**Estimated build time:** 5-15 minutes
**APK size:** ~50-70 MB (estimated)

**Start building now:**
```bash
eas login
eas build -p android --profile preview
```
