# Google Play Store Submission Checklist — Doc Vault (`com.psi.docvault`)

## Google Play Developer Account
- [ ] TODO: Confirm friend's Google Play Developer account is active (one-time $25 fee paid)
- [ ] TODO: Ask friend to add you as a user in Play Console → Users and Permissions → Invite user → role: **Release Manager** or **Admin**
- [ ] TODO: Accept invitation email from Play Console
- [ ] Note: app will appear under friend's developer account; transfer requires contacting Google Play support

---

## Technical Requirements

### SDK Versions
- [x] `targetSdkVersion = 36` — meets Google Play requirement (API 35+ required as of Aug 2025) ✅
- [x] `compileSdkVersion = 36` ✅
- [x] `minSdkVersion = 24` (Android 7.0) ✅
- [x] `versionCode = 1`, `versionName = "1.0"` set in `app/build.gradle` ✅
- [x] Package ID `com.psi.docvault` set ✅
- [x] Google OAuth redirect scheme registered in `AndroidManifest.xml` ✅

### App Signing (Release Keystore)
- [ ] TODO: **Generate a release keystore** — run this command (save the keystore file securely):
  ```bash
  keytool -genkeypair -v \
    -keystore docvault-release.jks \
    -alias docvault \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
  ```
  Store `docvault-release.jks` somewhere safe — losing it means you can never update the app.

- [ ] TODO: **Create `keystore.properties`** in `/mobile/android/` (already referenced in `build.gradle`):
  ```
  storeFile=../docvault-release.jks
  storePassword=YOUR_STORE_PASSWORD
  keyAlias=docvault
  keyPassword=YOUR_KEY_PASSWORD
  ```
  Add `keystore.properties` and `docvault-release.jks` to `.gitignore` — never commit these.

- [ ] TODO: **Register SHA-256 fingerprint with Google Cloud Console** — required for Google OAuth to work on release builds:
  ```bash
  keytool -list -v -keystore docvault-release.jks -alias docvault
  ```
  Copy the SHA-256 fingerprint → go to Google Cloud Console → your OAuth project → Credentials → Android OAuth client → paste the fingerprint + package name `com.psi.docvault`.

### Permissions
- [x] `INTERNET` declared in `AndroidManifest.xml` ✅
- [ ] TODO: Verify Capacitor Camera plugin injects `CAMERA` and `READ_MEDIA_IMAGES` permissions at build time — confirm by checking the merged manifest after `./gradlew assembleRelease`

### Build Format
- [ ] TODO: Build an **Android App Bundle (AAB)** — Google Play requires AAB for new apps:
  ```bash
  cd /Users/CuongPhan/virtual-employee-platform/mobile
  npm run build
  npx cap sync android
  npx cap open android
  ```
  Then in Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle** → select your keystore → build.

---

## Google Play Console — Store Listing Metadata

- [ ] TODO: **App name**: `Doc Vault` — verify not already taken on Play Store
- [ ] TODO: **Short description** (80 chars max):
  ```
  Scan documents & save them directly to your Google Drive.
  ```
- [ ] TODO: **Full description** — paste this:
  ```
  Doc Vault turns your phone into a portable document scanner that saves everything straight to your Google Drive — no new accounts, no extra storage, no monthly fees.

  CAPTURE & ORGANISE
  Photograph documents with your camera or import from your photo library. Every file is automatically sorted into categories: Invoices, Contracts, Certificates, Government IDs, Receipts, and more.

  YOUR DATA, YOUR DRIVE
  Files go directly into your own Google Drive folder — Doc Vault has no servers and stores nothing on our end. You stay in full control of your documents at all times.

  WORKS OFFLINE TOO
  No internet? No problem. Doc Vault queues your uploads and syncs them automatically the moment you're back online.

  TEXT RECOGNITION
  Extract text from scanned documents with built-in OCR, making your files searchable.

  SIMPLE & PRIVATE
  • Sign in once with Google — no separate account needed
  • Choose exactly which Google Drive folder receives your files
  • Delete all app data at any time from Settings
  • Available in English and Vietnamese
  ```
- [ ] TODO: **Category**: Productivity
- [ ] TODO: **Contact email**: `nhtoan611@gmail.com`
- [ ] TODO: **Privacy Policy URL**: `https://psilabvnorg.github.io/virtual-employee-platform/privacy-policy.html`
- [ ] TODO: **Website** (optional): `https://psilabvnorg.github.io/virtual-employee-platform`

---

## Visual Assets

### App Icon
- [ ] TODO: **512×512 PNG icon** — create from the existing `AppIcon-512@2x.png` (1024×1024):
  ```bash
  sips -z 512 512 \
    /Users/CuongPhan/virtual-employee-platform/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png \
    --out /Users/CuongPhan/Desktop/docvault-play-icon-512.png
  ```
  Upload `docvault-play-icon-512.png` to Play Console.

### Feature Graphic (Required)
- [ ] TODO: **Feature graphic — 1024×500 PNG/JPG** — this is the banner shown at the top of your Play Store listing.
  Create a simple banner: app name + tagline + icon on a solid background color.
  Minimum content: "Doc Vault — Scan & Store to Google Drive"

### Screenshots
- [ ] TODO: **Phone screenshots** — minimum 2, recommended 4-8 (same content as iOS screenshots but taken from Android device or emulator)
  - Resolution: at least 320px on shortest side, max 3840px
  - Format: JPG or PNG
  - Recommended: run on an Android emulator (Pixel 7 or Pixel 8) and take screenshots of the same key screens as iOS
- [ ] TODO: **7-inch tablet** — optional, skip for first release
- [ ] TODO: **10-inch tablet** — optional, skip for first release

> Recommended screens: (1) Category selection, (2) Review & upload document, (3) OCR text extracted, (4) Drive folder selected, (5) Settings

---

## Privacy & Data Safety

### Privacy Policy
- [x] Privacy Policy URL live: `https://psilabvnorg.github.io/virtual-employee-platform/privacy-policy.html` ✅
- [ ] TODO: Paste URL into Play Console → App Content → Privacy Policy

### Data Safety Section
Go to Play Console → **Policy → App Content → Data Safety** and fill in:

**Data collected and shared:**

| Data type | Collected? | Shared? | Purpose | Required? |
|---|---|---|---|---|
| Email address | Yes | No | App functionality (Google sign-in) | Yes |
| User ID (Google ID) | Yes | No | App functionality | Yes |
| Photos/videos | Yes | No | App functionality (upload to Drive) | Yes |
| Other app performance data | No | — | — | — |

**Security practices:**
- Data is encrypted in transit (HTTPS/TLS): **Yes**
- You provide a way to request data deletion: **Yes** (Settings → Delete All App Data)
- Data is not sold to third parties: **Yes**

---

## Content Rating

- [ ] TODO: Complete **IARC Content Rating Questionnaire** in Play Console → Policy → App Content → Content Rating
  - Expected answers: No violence, No sexual content, No profanity, No gambling, No drugs → expected rating: **Everyone (E)** / PEGI 3

---

## Ad Declaration
- [ ] TODO: In Play Console → Policy → App Content → Ads:
  - Select: **"This app does not contain ads"**

---

## Pre-Submission Testing

- [ ] TODO: **Test on a physical Android device** — install the debug build and run through:
  - Camera permission prompt appears
  - Google Sign-In flow works end-to-end
  - Folder picker loads Drive folders
  - Upload a photo — confirm it appears in Google Drive
  - Offline mode — queue upload, reconnect, confirm sync
  - Settings → Delete All App Data → returns to onboarding
- [ ] TODO: **Test on Android emulator** (Pixel 8, API 35+) — run in Android Studio
- [ ] TODO: **Internal test track** — upload AAB to Play Console → Testing → Internal Testing → invite yourself → install via Play Store link → test the release build

---

## Next Steps (in order)

| # | TODO | Who |
|---|---|---|
| 1 | Create Google Play Developer account or get invited to friend's | Friend |
| 2 | Generate release keystore + create `keystore.properties` | You |
| 3 | Register SHA-256 fingerprint in Google Cloud Console | You |
| 4 | Create 512×512 icon and 1024×500 feature graphic | You |
| 5 | Take Android screenshots (emulator or device) | You |
| 6 | Create app listing in Play Console | You |
| 7 | Fill store listing metadata (description, category, contact) | You |
| 8 | Fill Data Safety section | You |
| 9 | Complete Content Rating questionnaire | You |
| 10 | Build signed AAB in Android Studio | You |
| 11 | Upload to Internal Test track — test release build | You |
| 12 | Promote to Production | You |

---

### Step 2 — Generate Release Keystore

```bash
cd /Users/CuongPhan/virtual-employee-platform/mobile/android
keytool -genkeypair -v \
  -keystore docvault-release.jks \
  -alias docvault \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```
Fill in the prompts (name, org, city, country). Set a strong password.
Then create `keystore.properties`:
```
storeFile=docvault-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=docvault
keyPassword=YOUR_KEY_PASSWORD
```
Add both files to `.gitignore`.

---

### Step 3 — Register SHA-256 with Google Cloud Console

```bash
keytool -list -v -keystore /Users/CuongPhan/virtual-employee-platform/mobile/android/docvault-release.jks -alias docvault
```
Copy the `SHA256:` fingerprint line.
1. Go to **console.cloud.google.com** → select your project
2. APIs & Services → Credentials
3. Click your existing **Android OAuth 2.0 Client** (or create one)
4. Add package name: `com.psi.docvault`
5. Add SHA-256 fingerprint: paste from above
6. Save

---

### Step 4 — Create 512×512 Icon

```bash
sips -z 512 512 \
  /Users/CuongPhan/virtual-employee-platform/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png \
  --out /Users/CuongPhan/Desktop/docvault-play-icon-512.png
```

---

### Step 10 — Build Signed AAB

1. In terminal:
   ```bash
   cd /Users/CuongPhan/virtual-employee-platform/mobile
   npm run build && npx cap sync android && npx cap open android
   ```
2. In Android Studio: **Build → Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Select keystore → enter passwords → Next
5. Choose **release** build variant → **Create**
6. AAB will be at `android/app/release/app-release.aab`

---

### Step 11 — Upload to Internal Test Track

1. Play Console → your app → Testing → **Internal Testing**
2. Click **Create new release** → upload `app-release.aab`
3. Add release notes: `Initial release.`
4. Save → **Review release** → **Start rollout to Internal Testing**
5. Add your Gmail as tester → open the opt-in link on your Android device
6. Install from Play Store → test the full flow

---

## After Submission — Good to Know

- Play Store reviews usually complete within **a few hours** for initial submissions
- If rejected: fix the issue and re-submit — do not create a new listing
- Version code must be **incremented** for every new build upload
- Use **staged rollout** (10% → 50% → 100%) for production releases to catch issues early
- Monitor **Android Vitals** in Play Console after launch (crash rate, ANR rate)
