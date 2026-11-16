# AULA SC900 Pro — WebHID & Web Bluetooth Studio

An Apple Human Interface Guidelines (HIG) browser-based configurator for the **AULA SC900 Pro** gaming mouse (and compatible Telink / Compx / PixArt revisions), built with TypeScript, Vite, WebHID, and Web Bluetooth.

![WebHID](https://img.shields.io/badge/WebHID-Supported-30D158?style=flat-square)
![Web Bluetooth](https://img.shields.io/badge/Web_Bluetooth-Supported-0A84FF?style=flat-square)
![Polling Rate](https://img.shields.io/badge/Max_Rate-8000Hz_PRO-FF9F0A?style=flat-square)
![DPI Sensor](https://img.shields.io/badge/Max_DPI-26000-BF5AF2?style=flat-square)

---

## Features

- **Apple macOS-Inspired Glassmorphism UI**:
  - Translucent vibrancy, segmented controls, desktop navigation rail, and responsive mobile tab bar.
  - Full Dark Mode & Light Mode support.
  - Interactive mouse visualizer synced to active chassis RGB lighting, DPI stage color, and button click feedback.
- **Multi-Transport Hardware Connectivity (No Driver Required)**:
  - **Wired USB** & **2.4G Wireless Dongle** via the **WebHID API** (`UsagePage: 0xFF05`, `Usage: 0x0004`).
  - **Bluetooth LE (GATT)** & **Bluetooth HID** support for wireless battery/status monitoring and configuration.
  - **Built-in Demo Mode**: Explore all UI controls, lighting animations, macro editing, and profiles without hardware connected.
- **Buttons & Key Combinations**:
  - Remap 6 mouse buttons (`Left`, `Right`, `Middle`, `Forward`, `Backward`, `DPI Loop`).
  - Assign standard clicks, DPI controls (`DPI +`, `DPI -`, `DPI Loop`), Double Click, **Fire Key** (configurable repeat count and ms interval), multimedia & browser shortcuts, custom key combinations (`Ctrl`/`Shift`/`Alt`/`Win` + up to 3 USB HID keys), or hardware macros.
- **DPI & Sensor Tuning**:
  - Up to **6 DPI stages** configurable from **50 to 26,000 DPI** (50-DPI steps) with per-stage color indicators.
  - **Lift-Off Distance (LOD)**: `0.7 mm` (PAW3950), `1.0 mm`, or `2.0 mm`.
  - **Sensor Features**: Ripple Control, Angle Snapping, Motion Sync, and Sensor Power Mode (`LP` Low Power, `HP` High Performance, `Corded` Max Gaming).
- **Performance & Battery Telemetry**:
  - **Polling Rate**: `125 Hz`, `250 Hz`, `500 Hz`, `1,000 Hz`, `2,000 Hz`, `4,000 Hz`, and `8,000 Hz PRO`.
  - **Timing & Power**: Button debounce (`1–20 ms`) and auto sleep timeout.
  - **Real-time Battery**: Percentage readout, 5-bar indicator, and charging status detection.
- **Lighting**:
  - **Chassis RGB Effects**: Ambilight (Rainbow), Flow Water, Battery Status, Connection & Polling, Battery Warning Only, or Off.
  - **DPI Indicator LED**: Steady, Breathing, or Off.
- **Hardware Macro Editor**:
  - Full binary macro codec (320-byte / 10-chunk hardware buffer, up to 71 step slots).
  - Supports keyboard (`keyDown`/`keyUp`), mouse (`mouseDown`/`mouseUp`), and delay (`1–65,535 ms`) steps.
  - Playback modes: Loop fixed times (`1–65,533`), Hold to repeat, and Toggle repeat.
- **Profiles & Inspector**:
  - Save, load, apply, and manage configuration profiles (`MouseProfile`), plus factory reset.
  - Hardware/firmware version readout, sensor detection, and raw WebHID report inspector.

---

## Quick Start

### 1. Install & Run Development Server

```bash
npm install
npm run dev
```

Open the local URL in a Chromium-based browser (Google Chrome, Microsoft Edge, or Opera) that supports the WebHID and Web Bluetooth APIs.

### 2. Production Build

```bash
npm run build
npm run preview
```

### 3. Optional Local WebSocket Daemon

```bash
npm run daemon
```

Starts the local WebSocket telemetry relay (`server.js`) on `ws://localhost:8080`.

---

## Project Structure

```text
├── index.html                      # Main UI, styles, and interactive mouse visualizer
├── server.js                       # Optional local WebSocket telemetry daemon
├── public/assets/                  # Mouse render assets
└── src/
    ├── app.ts                      # Application state, UI bindings, and event handlers
    ├── AulaSC900ProController.ts   # WebHID & Web Bluetooth hardware protocol controller
    ├── AulaSC900MacroProfile.ts    # Macro binary codec, USB HID key table, and profile types
    └── types.d.ts                  # Ambient TypeScript declarations
```

---

## Device Filter Specifications

| Parameter | Value |
| :--- | :--- |
| **Vendor ID (Primary)** | `0x248A` (9354) |
| **Product ID (Wired)** | `0x5B49` (23369) |
| **Product ID (2.4G Dongle)** | `0x5B4A` (23370) |
| **Vendor ID (PixArt)** | `0x093A` (2362) |
| **Product IDs (PixArt)** | `0x622C` / `0x522C` |
| **Usage Page** | `0xFF05` (Vendor Defined) |
| **Usage** | `0x0004` (Configuration Interface) |
| **Report ID** | `0x09` (Feature Report) |

---

## Disclaimer

This project is an independent, community-developed open-source tool and is not affiliated with, endorsed by, or certified by AULA® or Dongguan Suoai Electronics CO., LTD. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.

---

## License

This project is licensed under the [MIT License](LICENSE).
