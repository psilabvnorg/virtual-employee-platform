# App Store Submission Checklist — Doc Vault (`com.psi.docvault`)

## Apple Developer Account
- [x] Team ID `59TK72Z3PP` confirmed — belongs to Nathan Cheng's Apple Developer account ✅
- [x] Assigned **Admin** role in App Store Connect ✅
- [ ] TODO: Confirm bundle ID `com.psi.docvault` is registered under their team in the Apple Developer portal
- [ ] TODO: App registered in App Store Connect under their account with bundle ID `com.psi.docvault`
- [ ] TODO: Distribution certificate + provisioning profile created (Automatic signing is already configured — make sure it resolves against their team)
- [ ] Note: the app will appear in the App Store under your friend's developer account name; to change this later requires an app transfer

---

## App Store Connect Metadata

- [x] **App name**: `Doc Vault` — 9 chars, within 30-char limit; verify it's not already taken before submitting
- [x] **Subtitle**: `Scan & Store to Google Drive` — 28 chars ✓
- [x] **Description**: see draft below
- [x] **Keywords**: `document scanner,google drive,scan,invoice,receipt,contract,ocr,vault,storage` — 76 chars ✓
- [x] **Support URL**: `https://psilabvnorg.github.io/virtual-employee-platform` — live on GitHub Pages
- [ ] **Marketing URL**: optional — leave blank for first submission
- [x] **Privacy Policy URL**: `https://psilabvnorg.github.io/virtual-employee-platform/privacy-policy.html` — live on GitHub Pages
  > TODO: paste both URLs into App Store Connect → App Information
- [x] **Copyright**: `© 2026 PSI`
- [x] **Category**: Primary — **Productivity** / Secondary — **Business**
- [ ] TODO: **Age Rating** — complete the questionnaire in App Store Connect; expected result is **4+**

### Description Draft

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

Doc Vault is ideal for freelancers, small business owners, and anyone who needs a reliable, private place to keep important paperwork.
```

### What's New (for version 1.0)

```
Initial release.
```

---

## Screenshots (must show app in use, not just login/splash screen)

- [x] **iPhone 6.9"** (iPhone 16 Pro Max): 1320×2868 px — 7 screenshots at `/Users/CuongPhan/Desktop/Simulator 16 Pro Max`
- [x] **iPhone 6.5"** (iPhone 14 Plus): 1284×2778 px — 12 screenshots at `/Users/CuongPhan/Desktop/Simulator 14 Plus`
- [ ] TODO: **iPad 13"** — skip unless you want to support iPad (not required for iPhone-only submission)

> Recommended upload order: (1) Use - Category Selection, (2) Use - Review and Upload Receipt Image, (3) Use - Receipt Text Extracted, (4) Use - Drive Storage Selected, (5) Use - Setting Screenshot
> Skip onboarding screens (Choose Language, Connect to Drive) — Apple flags them as weak.

---

## App Icon

- [x] Verify `AppIcon-512@2x.png` (1024×1024) renders correctly on device ✅
- [x] Confirm icon meets 4+ age rating standards (no weapons, violence, etc.) ✅
- [x] Confirm icon does not infringe any trademarks ✅

---

## Technical Requirements

- [x] No crashes — tested on physical device ✅
- [x] IPv6 compatibility — tested on 4G/LTE network ✅
- [x] `NSAllowsArbitraryLoadsInWebContent` restored — required for Capacitor's WKWebView to make JavaScript `fetch()` calls from the `capacitor://localhost` custom scheme; removing it blocks all Drive API calls even though they are HTTPS
- [x] `UIRequiredDeviceCapabilities` updated from `armv7` to `arm64`
- [x] Google OAuth URL scheme registered in `Info.plist`
- [x] Marketing version `1.0` and build number `1` set in `project.pbxproj`
- [ ] TODO: **Export Compliance** — when uploading build in Xcode, select: "Does your app use encryption? → Yes (HTTPS only) → Is it exempt? → Yes (standard HTTPS/TLS)" — this is a required declaration, not a rejection risk

---

## Privacy Requirements

- [x] `NSCameraUsageDescription` — set with concrete example (see below)
- [x] `NSPhotoLibraryUsageDescription` — set with concrete example
- [x] `NSPhotoLibraryAddUsageDescription` — set
- [x] In-app link to Privacy Policy — linked from Settings → About section
- [x] Account deletion flow — "Delete All App Data" in Settings; clears localStorage + IndexedDB, signs out, navigates to onboarding
- [ ] TODO: **App Privacy nutrition label** — fill in App Store Connect; declare: Google identity (name, email), photos/documents (uploaded to user's own Drive), no third-party analytics
- [x] No third-party analytics or advertising SDKs — nothing to declare
- [x] Privacy Policy covers: data retention, consent revocation, deletion instructions — verified in `privacy-policy.html`

---

## Capacitor / Web Wrapper Considerations

- [x] Native plugins in use: Camera, Filesystem, Browser — not a bare web wrapper
- [x] No backend required — app works entirely via Google APIs; reviewers do not need a server to be live
- [x] **Demo Google account** — real Google account with sample documents in Drive ready for Apple reviewers ✅

---

## App Review Information (fill in App Store Connect before submitting)

> Apple says 40% of rejections are App Completeness issues — most caused by missing info here.

- [ ] TODO: **Demo account credentials** — provide the demo Google account email + password
- [ ] TODO: **Special configuration notes** — tell reviewers: sign in with the demo Google account, grant Drive permission, the app will upload to that account's Drive
- [ ] TODO: **Contact information** — must be a current, monitored email address
- [ ] TODO: **Review notes** — paste this text:
  ```
  This app is built with Capacitor 8 and uses native Camera and Filesystem plugins
  — it is not a basic web wrapper. All user files are stored in the user's own
  Google Drive; the app has no backend servers. To test: sign in with the provided
  demo Google account and grant Drive access when prompted.
  ```

---

## Pre-Submission Testing

- [x] Test on a physical iPhone with the latest iOS version ✅
- [x] Test all permission prompts (camera, photo library) ✅
- [x] Test Google Sign-In flow end-to-end — tested on physical device ✅
- [x] IPv6 compatibility — tested on 4G/LTE network ✅
- [x] Verify all public links work: support URL, privacy policy URL ✅
- [ ] TODO: Upload to TestFlight first — have at least one external tester verify before App Store submission

---

## After Submission — Good to Know

- 90% of apps reviewed within **24 hours** — check status in App Store Connect
- If rejected: respond in App Store Connect, fix, resubmit — do not create a new listing
- One **appeal** allowed per rejection at developer.apple.com/contact/app-store
- **Expedited review** available for critical bugs or time-sensitive releases
- If extra issues found during a bug-fix review, you can defer non-critical ones to next submission

---

## Biggest Gaps (Priority Order)

| # | Gap | Risk | Status |
|---|-----|------|--------|
| 1 | Privacy Policy public URL | Fixed | ✅ https://psilabvnorg.github.io/virtual-employee-platform/privacy-policy.html |
| 2 | No App Store screenshots | Fixed | ✅ Done |
| 3 | No App Store Connect listing created | Hard blocker | TODO (needs account access) |
| 4 | App Privacy nutrition label not filled | Hard blocker | TODO (needs App Store Connect) |
| 5 | No demo Google account for reviewers | High | TODO: prepare test account |
| 6 | `armv7` → `arm64` | Fixed | ✅ Done |
| 7 | `NSAllowsArbitraryLoadsInWebContent` | Restored — required for Capacitor WKWebView fetch | ✅ Done |
| 8 | Account deletion flow | Fixed | ✅ Done |
| 9 | Privacy Policy content + in-app link | Fixed | ✅ Done |
| 10 | Permission purpose strings | Fixed | ✅ Done |

---

## Next Steps

| # | TODO | Who |
|---|---|---|
| 1 | Register `com.psi.docvault` on developer.apple.com | **Nathan** |
| 2 | Accept Program License Agreement (yellow banner in App Store Connect) | ✅ Done |
| 3 | Create app listing in App Store Connect | You (after #1) |
| 4 | Paste Support URL + Privacy Policy URL into listing | You (after #3) |
| 5 | Fill Age Rating questionnaire (expected 4+) | You (after #3) |
| 6 | Fill App Privacy nutrition label | You (after #3) |
| 7 | Fill App Review Information (demo credentials, review notes) | You (after #3) |
| 8 | Archive + upload build via Xcode | You (after #1) |
| 9 | Upload to TestFlight, run one test | You (after #8) |
| 10 | Submit for App Store review | You (after all above) |

---

### Step 1 — Register Bundle ID (Nathan)
Nathan goes to **developer.apple.com/account/resources/identifiers** → **+** → **App IDs** → **App** → fill in:
- Description: `Doc Vault`
- Bundle ID: **Explicit** → `com.psi.docvault`
- No capabilities needed → click **Register**

---

### Step 3 — Create app listing in App Store Connect
Go to **appstoreconnect.apple.com** → Apps → **+** → **New App** and fill in:

| Field | Value |
|---|---|
| Platform | iOS |
| Name | `Doc Vault` |
| Primary Language | English (U.S.) |
| Bundle ID | `com.psi.docvault` (select from dropdown) |
| SKU | `docvault-001` |
| User Access | Full Access |

Click **Create**.

---

### Step 4 — Paste URLs into App Information
In the listing → **App Information** section:
- **Privacy Policy URL**: `https://psilabvnorg.github.io/virtual-employee-platform/privacy-policy.html`
- **Support URL**: `https://psilabvnorg.github.io/virtual-employee-platform`
- **Copyright**: `© 2026 PSI`
- **Category**: Primary — Productivity / Secondary — Business

---

### Step 5 — Age Rating questionnaire
In the listing → **Age Rating** → **Edit** → answer all questions:
- Cartoon or fantasy violence: **None**
- Realistic violence: **None**
- Sexual content: **None**
- Profanity: **None**
- Gambling: **None**
- Horror/fear: **None**
- Medical/treatment info: **None**
- Alcohol/tobacco/drugs: **None**

Expected result: **4+** — click **Done**.

---

### Step 6 — App Privacy nutrition label
In the listing → **App Privacy** → **Get Started**:

**Data Used to Track You**: None

**Data Linked to You**:
- **Contact Info → Email Address** — used for: App Functionality (sign-in via Google)
- **Identifiers → User ID** — used for: App Functionality (Google user ID)

**Data Not Linked to You**:
- **Photos or Videos** — used for: App Functionality (documents uploaded to user's own Drive)

Check **"We do not sell or share data with third parties"**.
Click **Publish**.

---

### Step 7 — App Review Information
In the listing → **App Review Information**:

**Sign-in required**: Yes
- Username/Email: `[your demo Google account email]`
- Password: `[demo account password]`

**Notes**:
```
This app is built with Capacitor 8 and uses native Camera and Filesystem plugins
— it is not a basic web wrapper. All user files are stored in the user's own
Google Drive; the app has no backend servers. NSAllowsArbitraryLoadsInWebContent
is required for Capacitor's WKWebView to make JavaScript fetch() calls from the
capacitor://localhost custom scheme — removing it blocks all Drive API calls
even though they are HTTPS.

Sign in with Apple is not implemented because Doc Vault is a dedicated client
for Google Drive — the app's entire functionality depends on Google Drive access
and is meaningless without it. This qualifies under the App Store guideline 4.8
exception for "client apps for a specific third-party service."

To test: sign in with the provided demo Google account and grant Drive access when prompted.
```

**Contact Information**:
- First Name: Cuong
- Last Name: Phan
- Email: `phancuong1203@gmail.com`
- Phone: `(+84) 865960995`

---

### Step 8 — Archive + upload build via Xcode

1. In terminal:
   ```bash
   cd /Users/CuongPhan/virtual-employee-platform/mobile
   npm run build
   npx cap sync ios
   npx cap open ios
   ```
2. In Xcode: select **Any iOS Device (arm64)** as the target (not a simulator)
3. Menu → **Product → Archive**
4. When Archive finishes, the Organizer window opens automatically
5. Click **Distribute App** → **App Store Connect** → **Upload** → Next through all defaults
6. Click **Upload** — Xcode sends the build to App Store Connect

---

### Step 9 — TestFlight
1. Go to **appstoreconnect.apple.com** → your app → **TestFlight**
2. Wait for the build to finish processing (~10 min)
3. Add yourself as an **Internal Tester**
4. Install TestFlight app on your iPhone → install the build
5. Run through the full flow once to confirm everything works in the production build

---

### Step 10 — Submit for App Store Review
1. Go to the listing → **iOS App** section → select the build you uploaded
2. Upload screenshots (iPhone 6.9" and 6.5" sets from your Desktop folders)
3. Fill in **What's New**: `Initial release.`
4. Click **Add for Review** → **Submit to App Review**
