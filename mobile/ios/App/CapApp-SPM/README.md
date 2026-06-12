# CapApp-SPM

This package is used to host SPM dependencies for your Capacitor project

Do not modify the contents of it or there may be unintended consequences.

---

# Doc Vault iOS — Setup Guide

## Step 1 — Install dependencies

```bash
cd mobile
npm install
```

## Step 2 — Build web assets

```bash
CAPACITOR=1 npm run build
```

## Step 3 — Sync to iOS

```bash
npx cap sync ios
```

## Step 4 — Open in Xcode

```bash
npx cap open ios
```

If you get `npm error could not determine executable to run`, make sure you are inside the `mobile/` directory.

## Step 5 — Run on device or Simulator

**Simulator:**
- Select any iPhone Simulator from the device picker in Xcode
- Press `Cmd + R` to build and run
- To add photos for testing: drag image files onto the Simulator window

**Physical iPhone:**
- Connect via USB cable the first time
- In Xcode: `App` target → `Signing & Capabilities` → set your Team (Apple ID)
- Press `Cmd + R` — Xcode installs the app on your iPhone
- On iPhone: `Settings → General → VPN & Device Management` → trust your developer certificate
- For wireless after first setup: `Window → Devices and Simulators` → check "Connect via network"

---

## Re-deploy after code changes

```bash
CAPACITOR=1 npm run build && npx cap sync ios
```

Then press `Cmd + R` in Xcode.
