# AULA SC900 Pro — Apple-Themed WebHID Studio

An Apple Human Interface Guidelines (HIG) WebHID controller for the **AULA SC900 Pro** gaming mouse (and compatible Telink / Compx / PixArt revisions).

![AULA SC900 Pro Studio](https://img.shields.io/badge/WebHID-Supported-30D158?style=flat-square)
![Apple HIG](https://img.shields.io/badge/Design-Apple_macOS_Cupertino-0A84FF?style=flat-square)
![Polling Rate](https://img.shields.io/badge/Max_Rate-8000Hz_PRO-FF9F0A?style=flat-square)
![DPI Sensor](https://img.shields.io/badge/Max_DPI-26000-BF5AF2?style=flat-square)

---

## Features

- **Apple macOS Glassmorphism Theme**:
  - Translucent frosted vibrancy (`backdrop-filter: blur(40px) saturate(190%)`).
  - Native macOS traffic-light window chrome with Cupertino segmented control pills.
  - Full Dark Mode & Light Mode support.
- **Hardware Integration via WebHID**:
  - Direct communication using reverse-engineered Feature Reports (`UsagePage: 0xFF05`, `Usage: 0x0004`).
  - No bloated background drivers required.
- **Real-Time Mouse Visualizer**:
  - Interactive SVG vector mouse with live underglow RGB illumination synced to active lighting modes.
  - Palm DPI indicator LED reflecting the active stage color.
  - Click feedback animations on LMB, RMB, and DPI buttons.
- **Full Configuration Suite**:
  - **DPI Management**: 6 sensitivity stages with fine-tuning from 50 up to 26,000 DPI (50-DPI steps).
  - **Polling Rate Selection**: 125 Hz, 250 Hz, 500 Hz, 1,000 Hz, 2,000 Hz, 4,000 Hz, and **8,000 Hz PRO**.
  - **Chassis RGB Effects**: Ambilight, Flow Water, Battery Status, Connection & Polling, Battery Warning Only, or Off.
  - **Battery Telemetry**: Real-time percentage readout with charging detection and color-coded status icon.
  - **Advanced Timing**: Sensor button debounce (1–20 ms) and power-saving auto sleep timeout.
- **Built-in Demo Mode**:
  - Explore all UI capabilities, lighting animations, and sliders instantly, even when hardware is not plugged in.

---

## Quick Start

### 1. Development Server

```bash
npm install
npm run dev
```

Open the local URL in Google Chrome, Microsoft Edge, or Opera (browsers supporting the WebHID API).

### 2. Production Build

```bash
npm run build
npm run preview
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

