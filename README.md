<div align="center">
<img alt="FacePlugin" src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/brand/logo.png" width="400"/>
</div>

#### 🌐 Company Site - [Here](https://faceplugin.com)
#### 🤗 Hugging Face - [Here](https://huggingface.co/FacePlugin-Ltd)
#### 🛟 Help Center - [Here](https://doc.faceplugin.com)
#### 🐳 Docker Hub - [Here](https://hub.docker.com/u/faceplugin)

# FacePlugin Face Recognition SDK — React Native (Fully On-Premise)

> **Ready in ~15 minutes (after runtime download):**
> Drop Android AAR + iOS frameworks → Run the example on a phone
> Jump: [Quick start](#quick-start-checklist) · [Get the runtimes](#get-the-runtimes) · [Run the demo](#run-the-demo) · [Setup](#setup-on-your-own-app) · [About SDK](#about-sdk) · [Troubleshooting](#troubleshooting)

Customer repo: [`FaceRecognition-React-Native`](https://github.com/Faceplugin-ltd/FaceRecognition-React-Native) · Help Center: [doc.faceplugin.com](https://doc.faceplugin.com)

## Quick start checklist

Use this for the **example app** (check each box in order):

- [ ] Clone `https://github.com/Faceplugin-ltd/FaceRecognition-React-Native` and run `yarn` (root) + `yarn` (`example/`)
- [ ] Download runtimes from [Google Drive](#get-the-runtimes)
- [ ] Android: copy `facerecognitionsdk.aar` → `example/android/libfacesdk/`
- [ ] iOS: unzip frameworks → `ios/Frameworks/` (`facerecognitionsdk`, `FaceRecognitionEngine`, `onnxruntime`)
- [ ] iOS: `cd example && bundle install && cd ios && pod install`
- [ ] Run the example on a physical phone:
  - **Android:** `cd example && yarn android`
  - **iOS (macOS):** `cd example && yarn ios --device`
- [ ] Home screen status bar shows **Ready** → Enroll / Identify / Capture / Attribute

> **Integrating into your own app?** Skip to [Setup on your own app](#setup-on-your-own-app) — Android AAR path is different (`node_modules/.../android/libs/`). Full API and layer guide: [doc.faceplugin.com](https://doc.faceplugin.com).

## Introduction

FacePlugin **Face Recognition SDK for React Native** is a fully on-device biometric library for Android and iOS. Enroll faces, identify in 1:N with VideoWorker, capture with an oval coach, and read attributes with 2D liveness — all on the phone. The npm package `face-recognition-sdk` wraps the same native engines as our FaceRecognitionSDK Android and iOS apps.

All processing stays on the device. **No** biometric data is sent to FacePlugin cloud — built for KYC, eKYC, and cross-platform mobile onboarding.

This repository contains:

| Folder | Purpose |
| ------ | ------- |
| Repository root | `face-recognition-sdk` — the React Native library you install in your app |
| `example/` | Full demo (Enroll, Identify, Capture, Attribute, Settings, About) |

Native binaries are **not** on GitHub (too large). Download them from Google Drive (links below) and copy into the paths shown.

> **Expo Go is not supported.** You need a development build (bare React Native or Expo prebuild) because this package includes native Android / iOS code.

### Main Functionalities

| Demo tile | What it does |
| --------- | ------------ |
| **Enroll** | Enroll a person from a gallery photo (exactly one face) into the on-device database |
| **Identify** | Live 1:N camera match (VideoWorker) with 2D liveness / anti-spoofing |
| **Capture** | Oval coach capture → still with attributes → optional enroll |
| **Attribute** | Gallery analysis: landmarks, liveness, pose, quality, age, gender, emotion |
| **Settings** | Camera lens, identify / liveness / pose / eye-close thresholds, clear DB |
| **About** | FacePlugin Face Recognition SDK — on-device identity |

### Product List

| Platform | Repository |
|----------|------------|
| Android (Recognition) | [FaceRecognition-Android](https://github.com/Faceplugin-ltd/FaceRecognition-Android) |
| iOS (Recognition) | [FaceRecognition-iOS](https://github.com/Faceplugin-ltd/FaceRecognition-iOS) |
| **React Native (Recognition)** | **[FaceRecognition-React-Native](https://github.com/Faceplugin-ltd/FaceRecognition-React-Native)** (**this repo**) |
| Flutter (Recognition) | [FaceRecognition-Flutter](https://github.com/Faceplugin-ltd/FaceRecognition-Flutter) |
| Ionic Capacitor (Recognition) | [FaceRecognition-Ionic-Capacitor](https://github.com/Faceplugin-ltd/FaceRecognition-Ionic-Capacitor) |
| Ionic Cordova (Recognition) | [FaceRecognition-Ionic-Cordova](https://github.com/Faceplugin-ltd/FaceRecognition-Ionic-Cordova) |
| Windows (Recognition) | [FaceRecognition-Windows](https://github.com/Faceplugin-ltd/FaceRecognition-Windows) |
| Linux / Docker (Recognition) | [FaceRecognition-Docker](https://github.com/Faceplugin-ltd/FaceRecognition-Docker) |
| Android (Liveness) | [FaceLivenessDetection-Android](https://github.com/Faceplugin-ltd/FaceLivenessDetection-Android) |
| iOS (Liveness) | [FaceLivenessDetection-iOS](https://github.com/Faceplugin-ltd/FaceLivenessDetection-iOS) |
| Windows (Liveness) | [FaceLivenessDetection-Windows](https://github.com/Faceplugin-ltd/FaceLivenessDetection-Windows) |
| Linux / Docker (Liveness) | [FaceLivenessDetection-Docker](https://github.com/Faceplugin-ltd/FaceLivenessDetection-Docker) |


## Before you start

| Step | What you need |
| ---- | ------------- |
| 1 | **Node.js 18+**, **Yarn**, React Native environment ([setup guide](https://reactnative.dev/docs/environment-setup)) |
| 2 | **Physical device** recommended (camera / liveness; emulator is limited) |
| 3 | Android `facerecognitionsdk.aar` and iOS frameworks — see [Get the runtimes](#get-the-runtimes) |
| 4 | Demo licenses are in `example/src/license.ts` (bound to `com.faceplugin.facerecognitionsdk`). Request a new key only if you change `applicationId` / bundle id — see [SDK License](#sdk-license) |

You can run the **example** app as-is after placing the runtimes. Home tiles unlock when the status bar shows **Ready**.

### System requirements

| Platform | Requirement |
| -------- | ----------- |
| React Native | 0.74.x (example ships 0.74.5) |
| Android | minSdk 24, physical device recommended |
| iOS | iOS 13+, A12+ recommended, physical device |
| Node | 18+ |

## Get the runtimes

Same Google Drive packs as FaceRecognitionSDK Android / iOS (includes `frc.fpk` models inside the runtime).

### Android

[Google Drive — Android](https://drive.google.com/drive/folders/1kpzYVv9Gbm_pEpDe9-x7FGB4NWZzvez0)

| File | Example path | Customer path (your app) |
| ---- | ------------ | ------------------------ |
| `facerecognitionsdk.aar` | `example/android/libfacesdk/facerecognitionsdk.aar` | `node_modules/face-recognition-sdk/android/libs/facerecognitionsdk.aar` |

### iOS

[Google Drive — iOS](https://drive.google.com/drive/folders/1PKmV-o7gq7s7dDtiNgXPfCi2ZlWaRy5H)

Unzip into `ios/Frameworks/`:

| Archive | Place at |
| ------- | -------- |
| `facerecognitionsdk.framework.zip` | `ios/Frameworks/facerecognitionsdk.framework` |
| `FaceRecognitionEngine.framework.zip` | `ios/Frameworks/FaceRecognitionEngine.framework` |
| `onnxruntime.framework.zip` | `ios/Frameworks/onnxruntime.framework` |

Then run `pod install` in `example/ios`.

> Person enrollment data is **local** (`AsyncStorage` in the example). Drive holds the **native runtime only**, not the enrolled person gallery.

## Run the demo

```bash
git clone https://github.com/Faceplugin-ltd/FaceRecognition-React-Native.git
cd FaceRecognition-React-Native
yarn
cd example && yarn
# place AAR + frameworks (see above)
cd ios && pod install && cd ..
yarn android          # Android
# or, on macOS:
yarn ios --device     # iOS
```

Keep demo ids for the included license: Android `applicationId` and iOS bundle id are both **`com.faceplugin.facerecognitionsdk`**.

1. Wait until the home status bar shows **Ready**
2. **ENROLL** — pick a gallery photo with exactly one face to save an on-device template
3. **IDENTIFY** — live camera 1:N match with 2D liveness / anti-spoofing → result
4. **CAPTURE** — oval coach capture → optional enroll
5. **ATTRIBUTE** — gallery → landmarks, liveness, pose, quality, age, gender, emotion
6. **SETTINGS** — thresholds, clear persons
7. **ABOUT**

### Screenshots

| Home | Identify | Capture |
| ---- | -------- | ------- |
| <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/home.png" alt="FacePlugin Face Recognition — Home with Enroll, Identify, Capture, Attribute, Settings, About" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/identify.png" alt="FacePlugin Face Recognition — live 1:N identify with face box, landmarks, and liveness" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/capture.png" alt="FacePlugin Face Recognition — oval capture coach with Move closer" width="240"/></p> |

| Capture result | Attribute | Attribute (emotion) |
| -------------- | --------- | ------------------- |
| <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/capture-result.png" alt="FacePlugin Face Recognition — capture result with liveness, quality, and Enroll" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/attribute.png" alt="FacePlugin Face Recognition — attributes: 14 landmarks, liveness, age, gender" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/attribute-emotion.png" alt="FacePlugin Face Recognition — attributes: landmarks, age, gender, emotion" width="240"/></p> |

| Attribute (quality) | Settings | About |
| ------------------- | -------- | ----- |
| <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/attribute-quality.png" alt="FacePlugin Face Recognition — quality: blur, noise, pose, bounding box" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/settings.png" alt="FacePlugin Face Recognition — Settings for camera lens and thresholds" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/about.png" alt="FacePlugin Face Recognition SDK — About, on-device identity" width="240"/></p> |

| Home (tiles) | Attribute (liveness) |
| ------------ | -------------------- |
| <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/home-tiles.png" alt="FacePlugin Face Recognition — six home action tiles" width="240"/></p> | <p align="center"><img src="https://raw.githubusercontent.com/Faceplugin-ltd/faceplugin-assets/main/screenshots/face-recognition/android/attribute-liveness.png" alt="FacePlugin Face Recognition — liveness spoof score, age, gender" width="240"/></p> |

## SDK License

Licenses are **offline** and bound to your `applicationId` / bundle identifier.

The sample app already includes a valid key for `com.faceplugin.facerecognitionsdk`. You only need a new key if you use a different id.

### How to get a license

The code below shows how to use the license:

[https://github.com/Faceplugin-ltd/FaceRecognition-React-Native/blob/2fbb291298079502965c71833057b2465903e32b/example/src/license.ts#L11-L18](https://github.com/Faceplugin-ltd/FaceRecognition-React-Native/blob/2fbb291298079502965c71833057b2465903e32b/example/src/license.ts#L11-L18)

[https://github.com/Faceplugin-ltd/FaceRecognition-React-Native/blob/2fbb291298079502965c71833057b2465903e32b/example/src/SdkContext.tsx#L60-L75](https://github.com/Faceplugin-ltd/FaceRecognition-React-Native/blob/2fbb291298079502965c71833057b2465903e32b/example/src/SdkContext.tsx#L60-L75)

Please [contact us](#contact) to get a license for **your own app**.

## Setup on your own app

```bash
yarn add github:Faceplugin-ltd/FaceRecognition-React-Native
```

1. Copy `facerecognitionsdk.aar` into `node_modules/face-recognition-sdk/android/libs/`
2. Copy the three iOS frameworks into `node_modules/face-recognition-sdk/ios/Frameworks/` and `pod install`
3. Activate + init before calling detect / VideoWorker APIs
4. For **Capture UI** (`FaceCapture`), also install peers: `react-native-vision-camera`, `react-native-svg` (and camera permissions)

```ts
import {
  setActivation,
  init,
  faceDetection,
  templateExtraction,
  SDK_SUCCESS,
} from 'face-recognition-sdk';

const code = await setActivation('FP1.…');
if (code === SDK_SUCCESS) {
  await init();
}
```

Full API: [doc.faceplugin.com](https://doc.faceplugin.com).

## About SDK

Fully on-device face recognition for React Native — **no cloud round-trip**. One TypeScript API for Android and iOS; results use the **same FaceBox shape** on both platforms (Android is normalized for you). All methods return **Promises**. Status `0` (`SDK_SUCCESS`) means activate / init succeeded.

| You want to… | Use |
| ------------ | --- |
| Start the engine | `setActivation` → `init` |
| Find a face / attributes | `faceDetection` (`allAttributes: true`) |
| Enroll / 1:1 / 1:N | `templateExtraction` + `similarity` |
| Live 1:N from camera | `startVideoWorker` + `ingestLiveCameraFrame` |
| Ready-made oval UI | `FaceCapture` from `face-recognition-sdk/capture` |

```ts
const faces = await faceDetection(uri, { allAttributes: true, check_liveness: true });
const probe = await templateExtraction(uri, faces[0]);
const score = await similarity(probe, enrolledTemplateB64);
```

Live frames: pass `ingestLiveCameraFrame(photo, { frontCamera: true })` so Android and iOS share one orientation policy.

Optional Capture UI (peers: `react-native-vision-camera` + `react-native-svg`):

```ts
import { FaceCapture } from 'face-recognition-sdk/capture';

<FaceCapture
  settings={{ camera_lens: 'front', liveness_threshold: 0.5, liveness_level: 0 }}
  onCancel={() => navigation.goBack()}
  onCaptured={(result) => { /* result.uri, result.faceBox, result.cropB64 */ }}
/>
```

`FaceBox` includes `x1,y1,x2,y2`, `liveness` / `livenessLabel`, age / gender / emotion, glasses / mask, `attributes`, and `landmarks`. Optional: `normalizeFaceBox` if you parse raw bridge JSON yourself.

| Code | Meaning |
| ---- | ------- |
| 0 | Success |
| 1 | License invalid |
| 2 | License expired |
| 3 | Not activated |
| 4 | Init failed |

| Method | Role |
| ------ | ---- |
| `getMachineCode` / `setActivation` / `init` / `deinit` | License + engine lifecycle |
| `faceDetection` / `detect` | Faces + attributes |
| `templateExtraction` / `similarity` / `cropFace` | Enroll / match / thumbnail |
| `startVideoWorker` / `syncVideoWorkerDatabase` / `ingestLiveCameraFrame` / `addVideoWorkerListener` / `stopVideoWorker` | Live 1:N |
| `FaceCapture` (`face-recognition-sdk/capture`) | Oval capture UI (needs VisionCamera + SVG) |
| `lastLicenseError` | Human-readable license failure |

## Contact

<div align="left">
<a target="_blank" href="mailto:info@faceplugin.com"><img src="https://img.shields.io/badge/email-info@faceplugin.com-blue.svg?logo=gmail" alt="faceplugin.com"></a>&emsp;
<a target="_blank" href="https://wa.me/+14692784822"><img src="https://img.shields.io/badge/whatsapp-faceplugin-blue.svg?logo=whatsapp" alt="faceplugin.com"></a>
</div>
