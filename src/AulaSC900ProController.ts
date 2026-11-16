/**
 * AULA SC900 Pro Gaming Mouse WebHID Controller
 * Reverse-engineered from Aula SC900PRO.exe
 */

import {
  MACRO_BUFFER_SIZE,
  MACRO_CHUNK_COUNT,
  MACRO_CHUNK_SIZE,
  MacroPlaybackMode,
  encodeMacroPayload,
  decodeMacroPayload,
  encodeKeyCombination,
  decodeKeyCombination,
  isKeyCombinationAction,
  formatKeyCombinationLabel,
  isMacroAction,
  getMacroSlotFromAction,
  buildMacroAction,
  formatMacroSummary,
  type MacroDefinition,
  type KeyCombinationSpec,
} from './AulaSC900MacroProfile.js';

export * from './AulaSC900MacroProfile.js';

export enum PollingRate {
  Rate125Hz = 0x03,
  Rate250Hz = 0x02,
  Rate500Hz = 0x01,
  Rate1000Hz = 0x00,
  Rate2000Hz = 0x06,
  Rate4000Hz = 0x05,
  Rate8000Hz = 0x04,
}

export const PollingRateLabels: Record<PollingRate, string> = {
  [PollingRate.Rate125Hz]: '125 Hz (8ms)',
  [PollingRate.Rate250Hz]: '250 Hz (4ms)',
  [PollingRate.Rate500Hz]: '500 Hz (2ms)',
  [PollingRate.Rate1000Hz]: '1,000 Hz (1ms)',
  [PollingRate.Rate2000Hz]: '2,000 Hz (0.5ms)',
  [PollingRate.Rate4000Hz]: '4,000 Hz (0.25ms)',
  [PollingRate.Rate8000Hz]: '8,000 Hz PRO (0.125ms)',
};

export const PollingRateToHz: Record<PollingRate, number> = {
  [PollingRate.Rate125Hz]: 125,
  [PollingRate.Rate250Hz]: 250,
  [PollingRate.Rate500Hz]: 500,
  [PollingRate.Rate1000Hz]: 1000,
  [PollingRate.Rate2000Hz]: 2000,
  [PollingRate.Rate4000Hz]: 4000,
  [PollingRate.Rate8000Hz]: 8000,
};

export const HzToPollingRate: Record<number, PollingRate> = {
  125: PollingRate.Rate125Hz,
  250: PollingRate.Rate250Hz,
  500: PollingRate.Rate500Hz,
  1000: PollingRate.Rate1000Hz,
  2000: PollingRate.Rate2000Hz,
  4000: PollingRate.Rate4000Hz,
  8000: PollingRate.Rate8000Hz,
};

export enum LightingEffect {
  Off = 0x00,
  BatteryWarningOnly = 0x01,
  BatteryStatus = 0x02,
  ConnectionAndPolling = 0x03,
  FlowWater = 0x04,
  Ambilight = 0x05,
}

export const LightingEffectLabels: Record<LightingEffect, string> = {
  [LightingEffect.Off]: 'Off',
  [LightingEffect.BatteryWarningOnly]: 'Battery Warning Only',
  [LightingEffect.BatteryStatus]: 'Battery Status',
  [LightingEffect.ConnectionAndPolling]: 'Connection & Polling',
  [LightingEffect.FlowWater]: 'Flow Water',
  [LightingEffect.Ambilight]: 'Ambilight (Rainbow)',
};

export enum DpiLedEffect {
  Steady = 0x00,
  Breathing = 0x01,
  Off = 0x02,
}

export const DpiLedEffectLabels: Record<DpiLedEffect, string> = {
  [DpiLedEffect.Steady]: 'Steady',
  [DpiLedEffect.Breathing]: 'Breathing',
  [DpiLedEffect.Off]: 'Off',
};

/** Sensor power/tracking mode (Protocol Cmd 0x0A/0x8A Subcommand 0x05) */
export enum SensorMode {
  LP = 0x00,
  HP = 0x01,
  Corded = 0x02,
}

export const SensorModeLabels: Record<SensorMode, string> = {
  [SensorMode.LP]: 'LP (Low Power)',
  [SensorMode.HP]: 'HP (High Performance)',
  [SensorMode.Corded]: 'Corded (Max Gaming)',
};

/** Lift-Off Distance (LOD) setting (Protocol Cmd 0x0A/0x8A Subcommand 0x01) */
export enum LodLevel {
  OneMm = 0x00,
  TwoMm = 0x01,
  PointSevenMm = 0x02, // Supported on PAW3950 (sensorByte 0xF1)
}

export const LodLevelLabels: Record<LodLevel, string> = {
  [LodLevel.PointSevenMm]: '0.7 mm (PAW3950)',
  [LodLevel.OneMm]: '1.0 mm',
  [LodLevel.TwoMm]: '2.0 mm',
};

export interface SensorSettings {
  lod: LodLevel;
  rippleControl: boolean;
  angleSnapping: boolean;
  motionSync: boolean;
  sensorMode: SensorMode;
}

export interface FireKeyConfig {
  repeatTimes: number; // 0..3 (default 3)
  speedMs: number;     // 0..255 ms interval (default 10ms)
}

export interface FirmwareVersionInfo {
  major: number;
  minor: number;
  numeric: number;     // byte[1] * 10 + byte[2]
  formatted: string;
  rawPacket: number[];
}

export interface DeviceHardwareInfo {
  connectionStatus: number; // byte[1] (0x03 or 0x83 when active)
  isOnline: boolean;
  modelId: number;          // byte[2] (0x0c for SC900 Pro)
  modelName: string;
  variantFlag: number;      // byte[3]
  sensorByte: number;       // byte[3] === 2 ? byte[5] : byte[4]
  sensorName: string;
  supportsFineLod: boolean; // true on 0xF1 (PAW3950)
  rawPacket: number[];
}

export enum MouseButton {
  Left = 0,
  Right = 1,
  Middle = 2,
  Forward = 3,
  Backward = 4,
  DpiLoop = 5,
}

export { MouseButton as MouseButtonIndex };

export enum ButtonAction {
  // Standard Mouse Clicks
  Disabled = 0x00000000,
  LeftClick = 0x00f00001,
  RightClick = 0x00f10001,
  MiddleClick = 0x00f20001,
  Forward = 0x00f30001,
  Backward = 0x00f40001,

  // DPI & Click Extras
  DpiPlus = 0x00010007,
  DpiMinus = 0x00020007,
  DpiLoop = 0x00030007,
  DoubleClick = 0x05040007,
  FireKey = 0x0218f00a,

  // Multimedia Controls (Usage Page 0x000C)
  PlayPause = 0x00cd0003,
  Stop = 0x00b70003,
  NextTrack = 0x00b50003,
  PrevTrack = 0x00b60003,
  VolumeUp = 0x00e90003,
  VolumeDown = 0x00ea0003,
  Mute = 0x00e20003,

  // Windows & Browser Shortcuts
  MediaPlayer = 0x01830003,
  Email = 0x018a0003,
  Calculator = 0x01920003,
  MyComputer = 0x01940003,
  BrowserSearch = 0x02210003,
  BrowserHome = 0x02230003,
  BrowserBack = 0x02240003,
  BrowserForward = 0x02250003,
  BrowserStop = 0x02260003,
  BrowserRefresh = 0x02270003,
  BrowserFavorites = 0x022a0003,

  // Compatibility aliases
  DpiAdd = 0x00010007,
  DpiSub = 0x00020007,
  DpiSet = 0x00030007,
  RapidFire = 0x0218f00a,
  ShowDesktop = 0x02230003,
  LockPc = 0x00000000,
  CloseWindow = 0x02260003,
  WebRefresh = 0x02270003,
}

export const ButtonActionLabels: Record<ButtonAction, string> = {
  [ButtonAction.LeftClick]: 'Left Click',
  [ButtonAction.RightClick]: 'Right Click',
  [ButtonAction.MiddleClick]: 'Middle Click (Wheel)',
  [ButtonAction.Forward]: 'Forward (Browser)',
  [ButtonAction.Backward]: 'Backward (Browser)',
  [ButtonAction.DpiLoop]: 'DPI Loop (Cycle)',
  [ButtonAction.DpiPlus]: 'DPI + (Increase)',
  [ButtonAction.DpiMinus]: 'DPI - (Decrease)',
  [ButtonAction.DoubleClick]: 'Double Click',
  [ButtonAction.FireKey]: 'Fire Key (Rapid Click)',
  [ButtonAction.PlayPause]: 'Media: Play / Pause',
  [ButtonAction.Stop]: 'Media: Stop',
  [ButtonAction.NextTrack]: 'Media: Next Track',
  [ButtonAction.PrevTrack]: 'Media: Previous Track',
  [ButtonAction.VolumeUp]: 'Media: Volume +',
  [ButtonAction.VolumeDown]: 'Media: Volume -',
  [ButtonAction.Mute]: 'Media: Mute',
  [ButtonAction.Calculator]: 'Tools: Calculator',
  [ButtonAction.MyComputer]: 'Tools: Explorer (My Computer)',
  [ButtonAction.BrowserSearch]: 'Browser: Search',
  [ButtonAction.BrowserHome]: 'Browser: Home',
  [ButtonAction.BrowserBack]: 'Browser: Back',
  [ButtonAction.BrowserForward]: 'Browser: Forward',
  [ButtonAction.BrowserStop]: 'Browser: Stop',
  [ButtonAction.BrowserRefresh]: 'Browser: Refresh',
  [ButtonAction.BrowserFavorites]: 'Browser: Favorites',
  [ButtonAction.MediaPlayer]: 'Media: Player',
  [ButtonAction.Email]: 'Tools: Email',
  [ButtonAction.Disabled]: 'Disabled (Off)',
};

export interface BatteryStatus {
  percentage: number;
  isCharging: boolean;
  statusFlag: number;
  bars?: number;
  hasReading?: boolean;
}

export type ConnectionMode = 'usb' | '2.4g' | 'bluetooth' | 'simulation' | 'disconnected';
export type ConnectionTransport = 'webhid' | 'webbluetooth' | 'simulation' | 'none';

export interface ConnectionStatusInfo {
  mode: ConnectionMode;
  simulatedTransport?: 'usb' | '2.4g' | 'bluetooth';
  label: string;
  transport: ConnectionTransport;
  isConnected: boolean;
  isOnline: boolean;
  supportsConfig: boolean;
  maxPollingHz: number;
  vendorId: number | null;
  productId: number | null;
  deviceName: string;
  note?: string;
}

interface WebBluetoothCharacteristicLike {
  uuid: string;
  properties?: {
    read?: boolean;
    write?: boolean;
    writeWithoutResponse?: boolean;
    notify?: boolean;
    indicate?: boolean;
  };
  value?: DataView | null;
  readValue(): Promise<DataView>;
  writeValueWithResponse?(value: BufferSource): Promise<void>;
  writeValueWithoutResponse?(value: BufferSource): Promise<void>;
  writeValue?(value: BufferSource): Promise<void>;
  startNotifications(): Promise<WebBluetoothCharacteristicLike>;
  stopNotifications?(): Promise<WebBluetoothCharacteristicLike>;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

interface WebBluetoothServiceLike {
  uuid: string;
  getCharacteristic(characteristic: number | string): Promise<WebBluetoothCharacteristicLike>;
  getCharacteristics?(): Promise<WebBluetoothCharacteristicLike[]>;
}

interface WebBluetoothGattServerLike {
  connected: boolean;
  connect(): Promise<WebBluetoothGattServerLike>;
  disconnect(): void;
  getPrimaryService(service: number | string): Promise<WebBluetoothServiceLike>;
  getPrimaryServices?(): Promise<WebBluetoothServiceLike[]>;
}

interface WebBluetoothDeviceLike {
  id?: string;
  name?: string;
  gatt?: WebBluetoothGattServerLike;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

interface WebBluetoothNavigatorLike {
  requestDevice(options: {
    filters?: Array<{ name?: string; namePrefix?: string; services?: Array<number | string> }>;
    acceptAllDevices?: boolean;
    optionalServices?: Array<number | string>;
  }): Promise<WebBluetoothDeviceLike>;
  getDevices?(): Promise<WebBluetoothDeviceLike[]>;
}

export interface LightingConfig {
  totalDpiStages?: number; // Total stages enabled (default 6)
  activeDpiStage: number;  // 0 to 5 (0 = Stage 1, 1 = Stage 2, ..., 5 = Stage 6)
  lightEffect?: LightingEffect;
  dpiLedEffect?: DpiLedEffect;
  brightness?: number;     // 0 to 2 (default 1)
  speed?: number;          // 0 to 2 (default 1)
}

export interface MouseProfile {
  version: number;
  id: string;
  name: string;
  dpiStages: number[];
  totalDpiStages: number;
  activeDpiStage: number;
  pollingRate: PollingRate;
  debounceMs: number;
  sleepSeconds: number;
  dpiLedEffect: DpiLedEffect;
  brightness: number;
  speed: number;
  sensorSettings: SensorSettings;
  fireKey: FireKeyConfig;
  buttonMappings: Record<number, number>;
  macros: MacroDefinition[];
  /** Per-button (1..6) macro definitions bound to hardware macro actions */
  buttonMacros?: Record<number, MacroDefinition>;
}

/**
 * Formats any 32-bit button action DWORD into a human-readable label
 * (standard ButtonAction preset, Key Combination, or Hardware Macro slot).
 */
export function formatButtonActionLabel(
  actionDword: number,
  macrosBySlot?: Record<number, MacroDefinition>,
): string {
  const preset = ButtonActionLabels[actionDword as ButtonAction];
  if (preset) return preset;

  if (isMacroAction(actionDword)) {
    const slot = getMacroSlotFromAction(actionDword);
    const bound = macrosBySlot?.[slot];
    return bound ? `Macro: ${formatMacroSummary(bound)}` : `Macro (Slot ${slot + 1})`;
  }

  const combo = decodeKeyCombination(actionDword);
  if (combo) {
    return `Key Combo: ${formatKeyCombinationLabel(combo)}`;
  }

  return `Custom Action 0x${(actionDword >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

export class AulaSC900ProController {
  public static readonly VENDOR_USAGE_PAGE = 0xff05;
  public static readonly VENDOR_USAGE = 0x0004;
  public static readonly VENDOR_USAGE_ALT = 0x0001;

  public static readonly USB_WIRED_PIDS: ReadonlyArray<{ vendorId: number; productId: number }> = [
    { vendorId: 0x093a, productId: 0x622c },
    { vendorId: 0x248a, productId: 0x5b49 },
    { vendorId: 0x379a, productId: 0x0cef },
  ];

  public static readonly DONGLE_24G_PIDS: ReadonlyArray<{ vendorId: number; productId: number }> = [
    { vendorId: 0x093a, productId: 0x522c },
    { vendorId: 0x248a, productId: 0x5b4a },
    { vendorId: 0x379a, productId: 0x0cf0 },
  ];

  public static readonly BLE_BATTERY_SERVICE = 0x180f;
  public static readonly BLE_BATTERY_LEVEL_CHAR = 0x2a19;
  public static readonly BLE_BATTERY_POWER_STATE_CHAR = 0x2a1b;
  public static readonly BLE_DEVICE_INFO_SERVICE = 0x180a;
  public static readonly BLE_PNP_ID_CHAR = 0x2a50;
  public static readonly BLE_FW_REV_CHAR = 0x2a26;
  public static readonly BLE_SW_REV_CHAR = 0x2a28;
  public static readonly BLE_HW_REV_CHAR = 0x2a27;
  public static readonly BLE_MANUFACTURER_CHAR = 0x2a29;
  public static readonly BLE_MODEL_NUMBER_CHAR = 0x2a24;

  // Candidate non-blocklisted vendor / SPP / UART GATT services for BLE mice
  public static readonly BLE_VENDOR_SERVICES: ReadonlyArray<number | string> = [
    0xff05,
    0xfff0,
    0xffe0,
    0xff00,
    '0000ff05-0000-1000-8000-00805f9b34fb',
    '0000fff0-0000-1000-8000-00805f9b34fb',
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '00010203-0405-0607-0809-0a0b0c0d1910',
    '00010203-0405-0607-0809-0a0b0c0d1911',
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    'd0611e78-bbb4-4591-a5f8-487910ae4366',
  ];

  public static readonly FILTERS: HIDDeviceFilter[] = [
    // PixArt 8K Dongle & Wired (Target device)
    { vendorId: 0x093a, productId: 0x522c },
    { vendorId: 0x093a, productId: 0x622c },
    // PixArt PAR2861 SC900PRO Bluetooth HID (0x1812 -> COL05 UP:0xFF00)
    { vendorId: 0x065c, productId: 0x2861 },
    // Telink/Compx variants
    { vendorId: 0x248a, productId: 0x5b49 },
    { vendorId: 0x248a, productId: 0x5b4a },
    // OEM / Secondary variants
    { vendorId: 0x379a, productId: 0x0cef },
    { vendorId: 0x379a, productId: 0x0cf0 },
    { vendorId: 0x258a, productId: 0x011a },
    { vendorId: 0x258a },
    { vendorId: 0x093a },
    { vendorId: 0x248a },
    { vendorId: 0x379a },
    { vendorId: 0x065c },
    // Allow Bluetooth HOGP / vendor interfaces exposing SC900 configuration usage page 0xFF05
    { usagePage: 0xff05 },
  ];

  /**
   * Classifies a WebHID device as 'usb', '2.4g', or 'bluetooth' using EXE-verified PIDs
   * (0x42ed1e..0x42edee in Aula SC900PRO.exe) and Bluetooth HOGP / product name indicators.
   */
  public static classifyHidConnectionMode(
    dev: Pick<HIDDevice, 'vendorId' | 'productId' | 'productName'> & { collections?: ReadonlyArray<HIDCollectionInfo> },
    hintMode?: ConnectionMode,
  ): ConnectionMode {
    if (hintMode === 'usb' || hintMode === '2.4g' || hintMode === 'bluetooth') {
      return hintMode;
    }

    const vid = dev.vendorId ?? 0;
    const pid = dev.productId ?? 0;
    const name = (dev.productName || '').trim();

    if (AulaSC900ProController.USB_WIRED_PIDS.some(p => p.vendorId === vid && p.productId === pid)) {
      return 'usb';
    }
    if (AulaSC900ProController.DONGLE_24G_PIDS.some(p => p.vendorId === vid && p.productId === pid)) {
      return '2.4g';
    }
    // PixArt PAR2861 SC900PRO Bluetooth LE HOGP (VID_065C & PID_2861)
    if (vid === 0x065c) {
      return 'bluetooth';
    }

    if (/\b(bt|ble|bluetooth)\b|bt[\s_-]*[345]/i.test(name)) {
      return 'bluetooth';
    }
    if (/2\.4\s*g|dongle|receiver|nano/i.test(name)) {
      return '2.4g';
    }
    if (/\b(usb|wired|cable)\b/i.test(name)) {
      return 'usb';
    }

    if (vid === 0x0000 || vid === 0x1915) {
      return 'bluetooth';
    }

    if (/wireless/i.test(name)) {
      return '2.4g';
    }

    return 'usb';
  }

  /**
   * Returns true if a paired HIDDevice looks like a supported SC900 Pro / vendor-configurable mouse
   * across USB Wired, 2.4G Dongle, or Bluetooth HOGP.
   */
  public static isKnownCandidateDevice(dev: HIDDevice): boolean {
    if (AulaSC900ProController.FILTERS.some(f => f.vendorId !== undefined && f.vendorId === dev.vendorId)) {
      return true;
    }
    if (dev.collections?.some(c => c.usagePage === AulaSC900ProController.VENDOR_USAGE_PAGE)) {
      return true;
    }
    if (/sc900|aula/i.test(dev.productName || '')) {
      return true;
    }
    return false;
  }

  /**
   * Translates 1-based logical button index (1..6) to hardware button index (0..5).
   * Mouse hardware layout:
   *  - Button 1: Left Click      -> hwIndex 0
   *  - Button 2: Right Click     -> hwIndex 1
   *  - Button 3: Middle Click    -> hwIndex 2
   *  - Button 4: Forward Button  -> hwIndex 4 (Controls physical Button 4)
   *  - Button 5: Backward Button -> hwIndex 3 (Controls physical Button 5)
   *  - Button 6: DPI Loop        -> hwIndex 5
   */
  public static buttonToHwIndex(buttonIndex: number): number {
    switch (buttonIndex) {
      case 1: return 0;
      case 2: return 1;
      case 3: return 2;
      case 4: return 4;
      case 5: return 3;
      case 6: return 5;
      default: return Math.max(0, Math.min(5, buttonIndex));
    }
  }

  /**
   * Translates hardware index (0..5) back to 1-based logical button index (1..6).
   */
  public static hwIndexToButton(hwIndex: number): number {
    switch (hwIndex) {
      case 0: return 1;
      case 1: return 2;
      case 2: return 3;
      case 3: return 5;
      case 4: return 4;
      case 5: return 6;
      default: return hwIndex + 1;
    }
  }

  /**
   * Maps a battery percentage (0..100) into the 1..5 discrete bar levels used by Aula SC900PRO.exe
   * (`<20 -> 1`, `<40 -> 2`, `<60 -> 3`, `<80 -> 4`, `>=80 -> 5` at 0x436072..0x43609e).
   */
  public static computeBatteryBars(percentage: number): number {
    if (percentage < 20) return 1;
    if (percentage < 40) return 2;
    if (percentage < 60) return 3;
    if (percentage < 80) return 4;
    return 5;
  }

  private static getReportByteLength(report?: HIDReportInfo): number {
    if (!report?.items || report.items.length === 0) return 0;
    let totalBits = 0;
    for (const item of report.items) {
      totalBits += (item.reportSize || 0) * (item.reportCount || 0);
    }
    return Math.ceil(totalBits / 8);
  }

  private device: HIDDevice | null = null;
  public reportId: number = 0x09;
  public reportLength: number = 8;
  public outputReportId: number = 0x09;
  public outputReportLength: number = 32;
  public hasOutputReportSupport: boolean = false;
  private isSimulated: boolean = false;
  private activeConnectionMode: ConnectionMode = 'disconnected';
  private activeTransport: ConnectionTransport = 'none';
  private simulatedTransport: 'usb' | '2.4g' | 'bluetooth' = '2.4g';
  private deviceOnlineFlag: boolean = true;
  private hidHasVendorConfig: boolean = false;

  // Web Bluetooth (BLE GATT) transport state
  private bleDevice: WebBluetoothDeviceLike | null = null;
  private bleServer: WebBluetoothGattServerLike | null = null;
  private bleBatteryChar: WebBluetoothCharacteristicLike | null = null;
  private bleBatteryNotifyHandler: ((e: Event) => void) | null = null;
  private blePowerStateChar: WebBluetoothCharacteristicLike | null = null;
  private bleDisconnectHandler: ((e: Event) => void) | null = null;
  private bleTxChar: WebBluetoothCharacteristicLike | null = null;
  private bleRxChar: WebBluetoothCharacteristicLike | null = null;
  private bleRxNotifyHandler: ((e: Event) => void) | null = null;
  private blePendingResponses: Uint8Array[] = [];
  private bleResponseWaiters: Array<(pkt: Uint8Array) => void> = [];
  private bleSupportsConfig: boolean = false;
  private bleVendorId: number | null = null;
  private bleProductId: number | null = null;
  private bleFirmwareVersion: string | null = null;
  private bleFirmwareNumeric: number = 0;
  private bleManufacturer: string | null = null;
  private bleModelNumber: string | null = null;
  private bleConnectionNote: string | null = null;
  private bleOpQueue: Promise<unknown> = Promise.resolve();

  private realtimeTimer: number | null = null;
  private inputReportHandler: ((e: HIDInputReportEvent) => void) | null = null;
  public onRealtimeUpdate?: (data: {
    activeStageIndex?: number;
    battery?: BatteryStatus;
    rate?: PollingRate;
  }) => void;
  public onConnectionChange?: (status: ConnectionStatusInfo) => void;

  // Simulated state for UI previewing when hardware is absent
  private simBattery: BatteryStatus = { percentage: 90, isCharging: false, statusFlag: 0x01, bars: 5, hasReading: true };
  private simPollingRate: PollingRate = PollingRate.Rate1000Hz;
  private currentPollingRate: PollingRate = PollingRate.Rate1000Hz;
  private currentDebounce: number = 8;
  private currentSleepSeconds: number = 60;
  private lastSleepPacket: number[] = [];
  private lastBatteryStatus: BatteryStatus = { percentage: 0, isCharging: false, statusFlag: 0, bars: 0, hasReading: false };
  private batterySamples: number[] = [];
  private hasBatteryReading: boolean = false;
  private lastBatteryPacket: number[] = [];
  private currentDpiStage: number = 0;
  private currentTotalDpiStages: number = 6;
  private currentDpiLedEffect: DpiLedEffect = DpiLedEffect.Steady;
  private currentLedBrightness: number = 1;
  private currentLedSpeed: number = 1;
  private currentSensorSettings: SensorSettings = {
    lod: LodLevel.OneMm,
    rippleControl: false,
    angleSnapping: false,
    motionSync: true,
    sensorMode: SensorMode.HP,
  };
  private currentFireKey: FireKeyConfig = {
    repeatTimes: 3,
    speedMs: 10,
  };
  private isBusy: boolean = false;
  private busyDepth: number = 0;
  private simDpiValues: number[] = [400, 800, 1600, 3200, 6400, 26000];
  private macroSlots: Record<number, MacroDefinition> = {};
  private simMacroBuffers: Record<number, Uint8Array> = {};
  private buttonMappings: Record<number, number> = {
    1: ButtonAction.LeftClick,
    2: ButtonAction.RightClick,
    3: ButtonAction.MiddleClick,
    4: ButtonAction.Forward,
    5: ButtonAction.Backward,
    6: ButtonAction.DpiLoop,
  };

  public get isConnected(): boolean {
    return (
      this.isSimulated ||
      (this.device !== null && this.device.opened) ||
      (this.bleDevice !== null && !!this.bleServer?.connected)
    );
  }

  public get isSimulation(): boolean {
    return this.isSimulated;
  }

  public get connectionMode(): ConnectionMode {
    if (this.isSimulated) return 'simulation';
    if (!this.isConnected) return 'disconnected';
    return this.activeConnectionMode;
  }

  public get connectionTransport(): ConnectionTransport {
    if (this.isSimulated) return 'simulation';
    if (!this.isConnected) return 'none';
    return this.activeTransport;
  }

  public get supportsConfig(): boolean {
    if (this.isSimulated) return true;
    if (this.activeTransport === 'webhid' && this.device?.opened) {
      return this.hidHasVendorConfig;
    }
    if (this.activeTransport === 'webbluetooth' && this.bleServer?.connected) {
      return this.bleSupportsConfig;
    }
    return false;
  }

  public get maxPollingHz(): number {
    if (this.activeConnectionMode === 'bluetooth') return 125;
    if (this.isSimulated && this.simulatedTransport === 'bluetooth') return 125;
    return 8000;
  }

  public get isOnline(): boolean {
    if (this.isSimulated) return true;
    if (!this.isConnected) return false;
    return this.deviceOnlineFlag;
  }

  public getConnectionStatus(): ConnectionStatusInfo {
    const mode = this.connectionMode;
    const transport = this.connectionTransport;
    const online = this.isOnline;
    const supportsCfg = this.supportsConfig;

    let label = 'Disconnected';
    if (mode === 'usb') {
      label = online ? 'USB Wired' : 'USB (Asleep)';
    } else if (mode === '2.4g') {
      label = online ? '2.4G Wireless' : '2.4G (Asleep)';
    } else if (mode === 'bluetooth') {
      if (transport === 'webbluetooth') {
        label = supportsCfg ? 'Bluetooth BLE' : 'Bluetooth (BLE)';
      } else {
        label = online ? 'Bluetooth HID' : 'Bluetooth (Asleep)';
      }
    } else if (mode === 'simulation') {
      const simTag =
        this.simulatedTransport === 'usb'
          ? 'USB'
          : this.simulatedTransport === 'bluetooth'
            ? 'Bluetooth'
            : '2.4G';
      label = `Demo (${simTag})`;
    }

    let note: string | undefined;
    if (mode === 'bluetooth' && transport === 'webbluetooth') {
      note =
        this.bleConnectionNote ??
        (supportsCfg
          ? 'Connected via BLE GATT custom vendor channel (max 125 Hz).'
          : 'Connected via Web Bluetooth (Battery & Device Info). Browsers block 0x1812 HOGP writes.');
    } else if (mode === 'bluetooth' && transport === 'webhid') {
      note = supportsCfg
        ? 'Connected via Bluetooth HOGP WebHID (vendor 0xFF05, max 125 Hz).'
        : 'Connected via Bluetooth HID (VID 0x065C / PID 0x2861). SC900 Pro firmware restricts settings writes to USB Wired or 2.4G Dongle.';
    } else if (mode === '2.4g' && !online) {
      note = '2.4G receiver is active; mouse is currently asleep or powered off.';
    }

    return {
      mode,
      simulatedTransport: mode === 'simulation' ? this.simulatedTransport : undefined,
      label,
      transport,
      isConnected: this.isConnected,
      isOnline: online,
      supportsConfig: supportsCfg,
      maxPollingHz: this.maxPollingHz,
      vendorId: this.vendorId,
      productId: this.productId,
      deviceName: this.deviceName,
      note,
    };
  }

  public get deviceName(): string {
    if (this.isSimulated) return 'AULA SC900 Pro (Demo Mode)';
    if (this.device?.productName) return this.device.productName;
    if (this.bleDevice?.name) return this.bleDevice.name;
    return 'AULA SC900 Pro';
  }

  public get vendorId(): number | null {
    return this.device?.vendorId ?? this.bleVendorId ?? null;
  }

  public get productId(): number | null {
    return this.device?.productId ?? this.bleProductId ?? null;
  }

  /**
   * Score candidate HID devices to prioritize the MI_03 configuration interface (0xFF05 / 0x0004)
   */
  private scoreDevice(dev: HIDDevice): number {
    let score = 0;
    const isTargetVid = AulaSC900ProController.FILTERS.some(
      f => f.vendorId !== undefined && f.vendorId === dev.vendorId
    );
    if (isTargetVid) score += 100;

    for (const c of dev.collections) {
      // Prioritize vendor configuration page 0xFF05 (MI_03 interface, Usage 0x0004 in EXE 0x444b2c)
      if (c.usagePage === AulaSC900ProController.VENDOR_USAGE_PAGE) {
        score += 1000;
        if (c.usage === AulaSC900ProController.VENDOR_USAGE) {
          score += 400;
        } else if (c.usage === AulaSC900ProController.VENDOR_USAGE_ALT) {
          score += 150;
        }
        if (c.featureReports?.some(r => r.reportId === 0x09)) {
          score += 500;
        }
        if (c.inputReports?.some(r => r.reportId === 0x09)) {
          score += 300;
        }
        if (c.outputReports?.some(r => r.reportId === 0x09)) {
          score += 400;
        } else if (c.outputReports && c.outputReports.length > 0) {
          score += 150;
        }
      } else if ((c.usagePage ?? 0) >= 0xff00) {
        score += 20;
      }
    }
    return score;
  }

  /**
   * Request user permission and connect via WebHID (USB Wired, 2.4G Dongle, or Bluetooth HOGP HID)
   */
  public async requestDevice(allowAny: boolean = false, forceMode?: ConnectionMode): Promise<boolean> {
    if (!('hid' in navigator)) {
      throw new Error('WebHID API is not supported in this browser. Please use Chrome, Edge, or Opera.');
    }

    const filters = allowAny ? [] : AulaSC900ProController.FILTERS;
    let devices: HIDDevice[] = [];
    try {
      devices = await navigator.hid.requestDevice({ filters });
    } catch (err: any) {
      if (!allowAny) {
        devices = await navigator.hid.requestDevice({ filters: [] });
      } else {
        throw err;
      }
    }

    if (devices.length === 0) {
      return false;
    }

    // Sort devices descending by score to ensure MI_03 (0xFF05) is selected over MI_00/01/02
    devices.sort((a, b) => this.scoreDevice(b) - this.scoreDevice(a));

    const bestDevice = devices[0];
    return await this.connect(bestDevice, forceMode ? { forceMode } : undefined);
  }

  /**
   * Request user permission and connect to a Bluetooth HID mouse exposed through WebHID (OS HOGP)
   */
  public async connectBluetoothHid(): Promise<boolean> {
    return await this.requestDevice(true, 'bluetooth');
  }

  private runBleGattOp<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.bleOpQueue.then(fn, fn);
    this.bleOpQueue = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  private applyBleBatteryLevel(percentage: number, isCharging: boolean): BatteryStatus {
    const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
    const bars = AulaSC900ProController.computeBatteryBars(clamped);
    const statusFlag = isCharging ? 0 : 1;
    const status: BatteryStatus = {
      percentage: clamped,
      isCharging,
      statusFlag,
      bars,
      hasReading: true,
    };
    this.lastBatteryPacket = [0x19, (isCharging ? 0x80 : 0x00) | (clamped & 0x7f)];
    this.lastBatteryStatus = status;
    this.hasBatteryReading = true;
    return status;
  }

  private async readBleBatteryChargingState(): Promise<boolean> {
    if (!this.blePowerStateChar) return this.lastBatteryStatus.isCharging;
    try {
      const stateView = await this.blePowerStateChar.readValue();
      if (stateView.byteLength >= 1) {
        // Bluetooth SIG Battery Power State (0x2A1B): bits 4..5 == 0x03 (charging)
        const stateByte = stateView.getUint8(0);
        return ((stateByte >> 4) & 0x03) === 0x03;
      }
    } catch {
      // Optional characteristic unavailable
    }
    return false;
  }

  private async setupBleGattProfile(server: WebBluetoothGattServerLike): Promise<void> {
    const decoder = new TextDecoder('utf-8');

    // 1. Read Device Information Service (0x180A) for PnP ID (VID/PID) and Firmware Revision
    await this.runBleGattOp(async () => {
      try {
        const dis = await server.getPrimaryService(AulaSC900ProController.BLE_DEVICE_INFO_SERVICE);
        try {
          const pnpChar = await dis.getCharacteristic(AulaSC900ProController.BLE_PNP_ID_CHAR);
          const pnpView = await pnpChar.readValue();
          if (pnpView.byteLength >= 7) {
            this.bleVendorId = pnpView.getUint16(1, true);
            this.bleProductId = pnpView.getUint16(3, true);
          }
        } catch {
          // PnP ID absent or blocked
        }

        for (const charUuid of [AulaSC900ProController.BLE_FW_REV_CHAR, AulaSC900ProController.BLE_SW_REV_CHAR]) {
          try {
            const fwChar = await dis.getCharacteristic(charUuid);
            const fwView = await fwChar.readValue();
            const fwText = decoder.decode(new Uint8Array(fwView.buffer, fwView.byteOffset, fwView.byteLength)).replace(/\0+$/g, '').trim();
            if (fwText) {
              this.bleFirmwareVersion = fwText;
              const verMatch = fwText.match(/(\d+)\.(\d+)/);
              if (verMatch) {
                this.bleFirmwareNumeric = Number(verMatch[1]) * 10 + Number(verMatch[2]);
              }
              break;
            }
          } catch {
            // FW char absent
          }
        }

        try {
          const mfgChar = await dis.getCharacteristic(AulaSC900ProController.BLE_MANUFACTURER_CHAR);
          const mfgView = await mfgChar.readValue();
          this.bleManufacturer = decoder.decode(new Uint8Array(mfgView.buffer, mfgView.byteOffset, mfgView.byteLength)).replace(/\0+$/g, '').trim() || null;
        } catch {
          // Optional
        }

        try {
          const modelChar = await dis.getCharacteristic(AulaSC900ProController.BLE_MODEL_NUMBER_CHAR);
          const modelView = await modelChar.readValue();
          this.bleModelNumber = decoder.decode(new Uint8Array(modelView.buffer, modelView.byteOffset, modelView.byteLength)).replace(/\0+$/g, '').trim() || null;
        } catch {
          // Optional
        }
      } catch {
        // 0x180A Device Information service unavailable
      }
    });

    // 2. Read & subscribe Battery Service (0x180F / 0x2A19)
    await this.runBleGattOp(async () => {
      try {
        const battSvc = await server.getPrimaryService(AulaSC900ProController.BLE_BATTERY_SERVICE);
        try {
          this.blePowerStateChar = await battSvc.getCharacteristic(AulaSC900ProController.BLE_BATTERY_POWER_STATE_CHAR);
        } catch {
          this.blePowerStateChar = null;
        }
        const battChar = await battSvc.getCharacteristic(AulaSC900ProController.BLE_BATTERY_LEVEL_CHAR);
        this.bleBatteryChar = battChar;

        const isCharging = await this.readBleBatteryChargingState();
        const levelView = await battChar.readValue();
        if (levelView.byteLength >= 1) {
          const battStatus = this.applyBleBatteryLevel(levelView.getUint8(0), isCharging);
          this.onRealtimeUpdate?.({ battery: battStatus });
        }

        this.bleBatteryNotifyHandler = async (evt: Event) => {
          const target = evt.target as unknown as WebBluetoothCharacteristicLike | undefined;
          const v = target?.value;
          if (!v || v.byteLength < 1) return;
          const charging = this.blePowerStateChar
            ? await this.runBleGattOp(() => this.readBleBatteryChargingState()).catch(() => this.lastBatteryStatus.isCharging)
            : this.lastBatteryStatus.isCharging;
          const status = this.applyBleBatteryLevel(v.getUint8(0), charging);
          this.onRealtimeUpdate?.({ battery: status });
        };
        battChar.addEventListener('characteristicvaluechanged', this.bleBatteryNotifyHandler);
        try {
          await battChar.startNotifications();
        } catch {
          // Notifications unsupported; polling readValue still works
        }
      } catch {
        // Battery service unavailable on this GATT device
      }
    });

    // 3. Probe non-blocked custom vendor GATT services for read/write tunneling
    this.bleSupportsConfig = false;
    this.bleTxChar = null;
    this.bleRxChar = null;
    await this.runBleGattOp(async () => {
      for (const svcUuid of AulaSC900ProController.BLE_VENDOR_SERVICES) {
        try {
          const svc = await server.getPrimaryService(svcUuid);
          const chars = (await svc.getCharacteristics?.()) ?? [];
          if (chars.length === 0) continue;

          const rx =
            chars.find(c => c.properties?.notify || c.properties?.indicate) ??
            chars.find(c => c.properties?.read);
          const tx =
            chars.find(c => c !== rx && (c.properties?.writeWithoutResponse || c.properties?.write)) ??
            chars.find(c => c.properties?.writeWithoutResponse || c.properties?.write);

          // PixArt 0xFF00 BLE service is OTA-only on SC900PRO (verified empirically on DEV_C3916B529839);
          // do not mark 0xFF00 as writable settings tunnel unless a different vendor service responds.
          const isPixArtOtaService =
            svcUuid === 0xff00 || String(svcUuid).toLowerCase().startsWith('0000ff00-');

          if (tx && rx && !isPixArtOtaService) {
            this.bleTxChar = tx;
            this.bleRxChar = rx;
            this.bleSupportsConfig = true;
            this.bleRxNotifyHandler = (evt: Event) => {
              const target = evt.target as unknown as WebBluetoothCharacteristicLike | undefined;
              const view = target?.value;
              if (!view || view.byteLength === 0) return;
              const raw = new Uint8Array(view.buffer, view.byteOffset, view.byteLength).slice();
              const waiter = this.bleResponseWaiters.shift();
              if (waiter) {
                waiter(raw);
              } else {
                this.blePendingResponses.push(raw);
                if (this.blePendingResponses.length > 32) {
                  this.blePendingResponses.shift();
                }
              }
              this.processIncomingReportView(this.reportId, view);
            };
            rx.addEventListener('characteristicvaluechanged', this.bleRxNotifyHandler);
            try {
              await rx.startNotifications();
            } catch {
              // Read fallback handled in receiveFeatureReport
            }
            break;
          }
        } catch {
          // Service UUID not exposed on this device
        }
      }
    });

    this.bleConnectionNote = this.bleSupportsConfig
      ? 'Connected via Bluetooth BLE vendor GATT channel (max 125 Hz).'
      : 'Connected via Web Bluetooth (Battery & Device Info). Browsers block BLE HOGP 0x1812 writes; use USB or 2.4G dongle for full configuration.';
  }

  /**
   * Connect directly to the mouse over Web Bluetooth (BLE GATT).
   * Reads standard Battery Service (0x180F) & Device Info (0x180A), and probes custom vendor GATT channels.
   */
  public async connectBluetooth(acceptAllDevices: boolean = true): Promise<boolean> {
    const bt = (navigator as unknown as { bluetooth?: WebBluetoothNavigatorLike }).bluetooth;
    if (!bt || typeof bt.requestDevice !== 'function') {
      throw new Error(
        'Web Bluetooth API is not supported in this browser. Use Chrome or Edge on HTTPS/localhost, or connect via USB/2.4G WebHID.'
      );
    }

    const optionalServices: Array<number | string> = [
      AulaSC900ProController.BLE_BATTERY_SERVICE,
      AulaSC900ProController.BLE_DEVICE_INFO_SERVICE,
      ...AulaSC900ProController.BLE_VENDOR_SERVICES,
    ];

    let bleDevice: WebBluetoothDeviceLike;
    try {
      bleDevice = await bt.requestDevice(
        acceptAllDevices
          ? { acceptAllDevices: true, optionalServices }
          : {
              filters: [
                { namePrefix: 'AULA' },
                { namePrefix: 'SC900' },
                { namePrefix: 'BT' },
                { services: [AulaSC900ProController.BLE_BATTERY_SERVICE] },
              ],
              optionalServices,
            }
      );
    } catch (err: any) {
      if (err?.name === 'NotFoundError' || err?.name === 'AbortError') {
        return false;
      }
      throw err;
    }

    if (!bleDevice.gatt) {
      throw new Error('Selected Bluetooth device does not expose a GATT server.');
    }

    return await this.connectExistingBleDevice(bleDevice);
  }

  private async connectExistingBleDevice(bleDevice: WebBluetoothDeviceLike): Promise<boolean> {
    if (!bleDevice.gatt) return false;

    const server = await bleDevice.gatt.connect();
    await this.cleanupHidConnection();
    await this.cleanupBleConnection();

    this.isSimulated = false;
    this.bleDevice = bleDevice;
    this.bleServer = server;
    this.activeConnectionMode = 'bluetooth';
    this.activeTransport = 'webbluetooth';
    this.deviceOnlineFlag = true;
    this.currentPollingRate = PollingRate.Rate125Hz;
    this.resetBatteryState();

    this.bleDisconnectHandler = () => {
      if (this.isSimulated) return;
      void this.cleanupBleConnection(false).then(() => {
        this.activeConnectionMode = 'disconnected';
        this.activeTransport = 'none';
        this.deviceOnlineFlag = false;
        this.stopRealtimeMonitor();
        this.resetBatteryState();
        this.onConnectionChange?.(this.getConnectionStatus());
      });
    };
    bleDevice.addEventListener('gattserverdisconnected', this.bleDisconnectHandler);

    await this.setupBleGattProfile(server);
    this.onConnectionChange?.(this.getConnectionStatus());
    return true;
  }

  /**
   * Connect to previously authorized device automatically (USB, 2.4G dongle, or already-connected BT)
   */
  public async autoConnect(): Promise<boolean> {
    if ('hid' in navigator) {
      try {
        const paired = await navigator.hid.getDevices();
        if (paired.length > 0) {
          const candidates = paired.filter(dev =>
            AulaSC900ProController.isKnownCandidateDevice(dev)
          );

          if (candidates.length > 0) {
            candidates.sort((a, b) => this.scoreDevice(b) - this.scoreDevice(a));
            const best = candidates[0];
            if (this.scoreDevice(best) >= 100) {
              return await this.connect(best);
            }
          }
        }
      } catch (e) {
        console.warn('AutoConnect WebHID failed:', e);
      }
    }

    // Check previously paired & currently connected Web Bluetooth devices without blocking
    const bt = (navigator as unknown as { bluetooth?: WebBluetoothNavigatorLike }).bluetooth;
    if (bt && typeof bt.getDevices === 'function') {
      try {
        const btDevices = await bt.getDevices();
        const connectedBt = btDevices.find(d => d.gatt?.connected);
        if (connectedBt) {
          return await this.connectExistingBleDevice(connectedBt);
        }
      } catch {
        // Web Bluetooth getDevices() unavailable or unpermitted
      }
    }

    return false;
  }

  private async cleanupHidConnection(): Promise<void> {
    if (this.device) {
      if (this.inputReportHandler) {
        this.device.removeEventListener('inputreport', this.inputReportHandler);
        this.inputReportHandler = null;
      }
      if (this.device.opened) {
        try {
          await this.device.close();
        } catch {
          // Ignore already closed device
        }
      }
    }
    this.device = null;
    this.hidHasVendorConfig = false;
  }

  private async cleanupBleConnection(disconnectGatt: boolean = true): Promise<void> {
    if (this.bleBatteryChar && this.bleBatteryNotifyHandler) {
      this.bleBatteryChar.removeEventListener('characteristicvaluechanged', this.bleBatteryNotifyHandler);
      try {
        await this.bleBatteryChar.stopNotifications?.();
      } catch {
        // Ignore teardown error
      }
    }
    if (this.bleRxChar && this.bleRxNotifyHandler) {
      this.bleRxChar.removeEventListener('characteristicvaluechanged', this.bleRxNotifyHandler);
      try {
        await this.bleRxChar.stopNotifications?.();
      } catch {
        // Ignore teardown error
      }
    }
    if (this.bleDevice && this.bleDisconnectHandler) {
      this.bleDevice.removeEventListener('gattserverdisconnected', this.bleDisconnectHandler);
    }
    if (disconnectGatt && this.bleServer?.connected) {
      try {
        this.bleServer.disconnect();
      } catch {
        // Ignore disconnect error
      }
    }

    this.bleDevice = null;
    this.bleServer = null;
    this.bleBatteryChar = null;
    this.bleBatteryNotifyHandler = null;
    this.blePowerStateChar = null;
    this.bleDisconnectHandler = null;
    this.bleTxChar = null;
    this.bleRxChar = null;
    this.bleRxNotifyHandler = null;
    this.blePendingResponses = [];
    this.bleResponseWaiters = [];
    this.bleSupportsConfig = false;
    this.bleVendorId = null;
    this.bleProductId = null;
    this.bleFirmwareVersion = null;
    this.bleFirmwareNumeric = 0;
    this.bleManufacturer = null;
    this.bleModelNumber = null;
    this.bleConnectionNote = null;
  }

  /**
   * Connect to an existing permitted HIDDevice
   */
  public async connect(device: HIDDevice, options?: { forceMode?: ConnectionMode }): Promise<boolean> {
    await this.cleanupBleConnection();
    if (this.device && this.inputReportHandler) {
      this.device.removeEventListener('inputreport', this.inputReportHandler);
      this.inputReportHandler = null;
    }
    if (this.device && this.device !== device && this.device.opened) {
      try {
        await this.device.close();
      } catch {
        // Ignore stale handle close error
      }
    }

    this.isSimulated = false;
    this.device = device;
    this.resetBatteryState();

    if (!this.device.opened) {
      await this.device.open();
    }

    this.reportId = 0x09;
    this.reportLength = 8;
    this.outputReportId = 0x09;
    this.outputReportLength = 32;
    this.hasOutputReportSupport = false;

    const vendorCollections = this.device.collections.filter(
      c => c.usagePage === AulaSC900ProController.VENDOR_USAGE_PAGE
    );
    const anyVendorCollections = this.device.collections.filter(
      c => (c.usagePage ?? 0) >= 0xff00
    );
    // SC900PRO configuration protocol lives strictly on UsagePage 0xFF05 (0x0004).
    // Bluetooth 0x065C:0x2861 exposes 0xFF00 (ReportID 0x05, 20B) which does not handle 0x06..0x0F config commands.
    this.hidHasVendorConfig = vendorCollections.length > 0;

    const primaryVendorCol =
      vendorCollections.find(c => c.usage === AulaSC900ProController.VENDOR_USAGE) ??
      vendorCollections.find(c => c.featureReports?.some(r => r.reportId === 0x09)) ??
      vendorCollections[0] ??
      anyVendorCollections[0];

    if (primaryVendorCol) {
      if (primaryVendorCol.featureReports && primaryVendorCol.featureReports.length > 0) {
        const match09 = primaryVendorCol.featureReports.find(r => r.reportId === 0x09);
        const featReport = match09 ?? primaryVendorCol.featureReports[0];
        this.reportId = featReport.reportId ?? 0x09;
        const featBytes = AulaSC900ProController.getReportByteLength(featReport);
        if (featBytes >= 8) {
          this.reportLength = featBytes;
        }
      } else if (primaryVendorCol.inputReports && primaryVendorCol.inputReports.length > 0) {
        const match09 = primaryVendorCol.inputReports.find(r => r.reportId === 0x09);
        const inReport = match09 ?? primaryVendorCol.inputReports[0];
        this.reportId = inReport.reportId ?? 0x09;
      }

      const outSources = [
        ...(primaryVendorCol.outputReports || []),
        ...vendorCollections.flatMap(c => c.outputReports || []),
      ];
      if (outSources.length > 0) {
        const outMatch =
          outSources.find(r => r.reportId === this.reportId) ??
          outSources.find(r => r.reportId === 0x09) ??
          outSources[0];
        this.outputReportId = outMatch.reportId ?? this.reportId;
        const outBytes = AulaSC900ProController.getReportByteLength(outMatch);
        this.outputReportLength = outBytes >= 32 ? outBytes : 32;
        this.hasOutputReportSupport = true;
      }
    }

    // Fallback check across any collection if output reports live on a companion collection
    if (!this.hasOutputReportSupport) {
      for (const c of this.device.collections) {
        if (c.outputReports && c.outputReports.length > 0) {
          const outMatch = c.outputReports.find(r => r.reportId === this.reportId) ?? c.outputReports[0];
          this.outputReportId = outMatch.reportId ?? this.reportId;
          const outBytes = AulaSC900ProController.getReportByteLength(outMatch);
          if (outBytes >= 32) {
            this.outputReportLength = outBytes;
          }
          this.hasOutputReportSupport = true;
          break;
        }
      }
    }

    if (this.hasOutputReportSupport) {
      this.hidHasVendorConfig = true;
    }

    this.activeConnectionMode = AulaSC900ProController.classifyHidConnectionMode(
      this.device,
      options?.forceMode
    );
    this.activeTransport = 'webhid';
    this.deviceOnlineFlag = true;
    if (this.activeConnectionMode === 'bluetooth') {
      this.currentPollingRate = PollingRate.Rate125Hz;
    }

    // Attach real-time input report listener
    this.inputReportHandler = (e: HIDInputReportEvent) => {
      this.handleInputReport(e);
    };
    this.device.addEventListener('inputreport', this.inputReportHandler);

    this.onConnectionChange?.(this.getConnectionStatus());
    return true;
  }

  /**
   * Enable simulation / demo mode for UI testing without physical device
   */
  public enableSimulation(simulatedMode?: 'usb' | '2.4g' | 'bluetooth'): void {
    this.isSimulated = true;
    if (simulatedMode) {
      this.simulatedTransport = simulatedMode;
      if (simulatedMode === 'bluetooth') {
        this.simPollingRate = PollingRate.Rate125Hz;
        this.currentPollingRate = PollingRate.Rate125Hz;
      }
    }
    this.activeConnectionMode = 'simulation';
    this.activeTransport = 'simulation';
    this.deviceOnlineFlag = true;
    if (this.device && this.inputReportHandler) {
      this.device.removeEventListener('inputreport', this.inputReportHandler);
      this.inputReportHandler = null;
    }
    this.device = null;
    void this.cleanupBleConnection();
    this.resetBatteryState();
    this.onConnectionChange?.(this.getConnectionStatus());
  }

  public setSimulatedConnectionMode(mode: 'usb' | '2.4g' | 'bluetooth'): void {
    this.simulatedTransport = mode;
    if (!this.isSimulated) {
      this.enableSimulation(mode);
      return;
    }
    if (mode === 'bluetooth') {
      this.simPollingRate = PollingRate.Rate125Hz;
      this.currentPollingRate = PollingRate.Rate125Hz;
    } else if (this.simPollingRate === PollingRate.Rate125Hz) {
      this.simPollingRate = PollingRate.Rate1000Hz;
      this.currentPollingRate = PollingRate.Rate1000Hz;
    }
    this.onConnectionChange?.(this.getConnectionStatus());
  }

  /**
   * Disconnect active WebHID or Web Bluetooth device cleanly
   */
  public async disconnect(): Promise<void> {
    this.stopRealtimeMonitor();
    await this.cleanupHidConnection();
    await this.cleanupBleConnection();
    this.isSimulated = false;
    this.activeConnectionMode = 'disconnected';
    this.activeTransport = 'none';
    this.deviceOnlineFlag = false;
    this.resetBatteryState();
    this.onConnectionChange?.(this.getConnectionStatus());
  }

  /**
   * Resets sliding battery average buffer and cached reading (matches 0x435cb0 in Aula SC900PRO.exe)
   */
  private resetBatteryState(): void {
    this.batterySamples = [];
    this.hasBatteryReading = false;
    this.lastBatteryPacket = [];
    this.lastBatteryStatus = {
      percentage: 0,
      isCharging: false,
      statusFlag: 0,
      bars: 0,
      hasReading: false,
    };
  }

  private processIncomingReportView(reportId: number | undefined, data: DataView): void {
    if (!data || data.byteLength === 0) return;

    if (!this.deviceOnlineFlag) {
      this.deviceOnlineFlag = true;
      this.onConnectionChange?.(this.getConnectionStatus());
    }

    // Hardware pushes live battery/telemetry via HID Input Report ID 0x09 (0x446750 -> 0x435ef0).
    // WebHID puts reportId in e.reportId and starts e.data at buf[1]; also support bridges keeping buf[0]=0x09 with reportId=0.
    const isReport09WithHeader =
      (reportId === 0 || reportId === undefined) && data.getUint8(0) === 0x09 && data.byteLength >= 2;
    const isReport09Stripped = reportId === 0x09 || reportId === this.reportId;

    if (isReport09Stripped || isReport09WithHeader) {
      const payloadOffset = isReport09WithHeader ? 1 : 0;
      const batt = this.parseBatteryInputPayload(data, payloadOffset);
      if (batt) {
        const rawBytes = Array.from(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
        this.lastBatteryPacket = isReport09WithHeader ? rawBytes : [0x09, ...rawBytes];
        this.lastBatteryStatus = batt;
        this.hasBatteryReading = true;
        this.onRealtimeUpdate?.({ battery: batt });
      }
      return;
    }

    const cmd = data.getUint8(0);
    if (cmd === 0x8b && data.byteLength > 2) {
      const activeStage = data.getUint8(2);
      if (activeStage >= 0 && activeStage <= 5) {
        this.currentDpiStage = activeStage;
        this.onRealtimeUpdate?.({ activeStageIndex: activeStage });
      }
    } else if (cmd === 0x8d && data.byteLength > 1) {
      const rateByte = data.getUint8(1);
      this.currentPollingRate = rateByte;
      this.onRealtimeUpdate?.({ rate: rateByte });
    }
  }

  /**
   * Handles asynchronous incoming input reports from hardware
   */
  private handleInputReport(e: HIDInputReportEvent): void {
    this.processIncomingReportView(e.reportId, e.data);
  }

  /**
   * Starts a lightweight real-time background monitor to sync physical button changes (e.g. physical DPI button press)
   */
  public startRealtimeMonitor(intervalMs: number = 3000): void {
    this.stopRealtimeMonitor();
    this.realtimeTimer = window.setInterval(async () => {
      if (!this.isConnected || this.isSimulation || this.isBusy) return;
      try {
        if (!this.supportsConfig) {
          const batt = await this.getBatteryStatus();
          this.onRealtimeUpdate?.({
            battery: batt,
            rate: this.currentPollingRate,
          });
          return;
        }
        const stageInfo = await this.getActiveDpiStage();
        await new Promise((r) => setTimeout(r, 50));
        const batt = await this.getBatteryStatus();
        this.onRealtimeUpdate?.({
          activeStageIndex: stageInfo.activeStageIndex,
          battery: batt,
          rate: this.currentPollingRate,
        });
      } catch (e) {
        // Silently skip transient bus collision
      }
    }, intervalMs);
  }

  public stopRealtimeMonitor(): void {
    if (this.realtimeTimer !== null) {
      clearInterval(this.realtimeTimer);
      this.realtimeTimer = null;
    }
  }

  /**
   * Sets the active DPI stage on the hardware (Stage 0 to 5)
   * @param stageIndex 0 for Stage 1, 1 for Stage 2, ..., 5 for Stage 6
   */
  public async setActiveDpiStage(stageIndex: number): Promise<void> {
    if (stageIndex < 0 || stageIndex > 5) {
      throw new RangeError('Stage index must be between 0 and 5.');
    }
    this.currentDpiStage = stageIndex;

    this.busyDepth++;
    this.isBusy = true;
    try {
      // 1. Send Command 0x08 (Switch Active DPI Stage on hardware)
      const payload = new Uint8Array(this.reportLength);
      payload[0] = 0x08;
      payload[1] = stageIndex;
      await this.sendFeatureReport(payload);

      await new Promise((resolve) => setTimeout(resolve, 30));

      // 2. Sync Lighting state with active DPI stage (Command 0x0B)
      await this.setLighting({
        activeDpiStage: stageIndex,
      });
    } finally {
      this.busyDepth = Math.max(0, this.busyDepth - 1);
      this.isBusy = this.busyDepth > 0;
    }
  }

  /**
   * Queries the currently active DPI stage from hardware
   * Protocol Command: 0x8B
   */
  public async getActiveDpiStage(): Promise<{
    activeStageIndex: number;
    totalStages: number;
    dpiLedEffect: DpiLedEffect;
    brightness: number;
    speed: number;
  }> {
    if (this.isSimulated) {
      return {
        activeStageIndex: this.currentDpiStage,
        totalStages: this.currentTotalDpiStages,
        dpiLedEffect: this.currentDpiLedEffect,
        brightness: this.currentLedBrightness,
        speed: this.currentLedSpeed,
      };
    }

    const res = await this.queryFeatureCommand([0x8b], 0x8b, undefined, 20);
    if (!res) {
      return {
        activeStageIndex: this.currentDpiStage,
        totalStages: this.currentTotalDpiStages,
        dpiLedEffect: this.currentDpiLedEffect,
        brightness: this.currentLedBrightness,
        speed: this.currentLedSpeed,
      };
    }

    const { offset, view } = res;
    const totalStages = Math.max(1, Math.min(6, view.byteLength > offset + 1 ? view.getUint8(offset + 1) : this.currentTotalDpiStages));
    const activeStageIndex = view.byteLength > offset + 2 ? view.getUint8(offset + 2) : this.currentDpiStage;
    const clampedStage = Math.min(5, Math.max(0, activeStageIndex));
    const dpiLedEffect = view.byteLength > offset + 3 ? view.getUint8(offset + 3) : this.currentDpiLedEffect;
    const brightness = view.byteLength > offset + 4 ? view.getUint8(offset + 4) : this.currentLedBrightness;
    const speed = view.byteLength > offset + 5 ? view.getUint8(offset + 5) : this.currentLedSpeed;

    this.currentTotalDpiStages = totalStages;
    this.currentDpiStage = clampedStage;
    this.currentDpiLedEffect = dpiLedEffect;
    this.currentLedBrightness = brightness;
    this.currentLedSpeed = speed;

    return {
      activeStageIndex: clampedStage,
      totalStages,
      dpiLedEffect,
      brightness,
      speed,
    };
  }

  /**
   * Queries DPI value for a specific stage from hardware
   * Protocol Command: 0x8C
   * @param stageIndex 0 to 5
   */
  public async getDpiStage(stageIndex: number): Promise<number> {
    if (stageIndex < 0 || stageIndex > 5) {
      throw new RangeError('Stage index must be between 0 and 5.');
    }
    if (this.isSimulated) {
      return this.simDpiValues[stageIndex];
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x8c;
    query[1] = stageIndex;

    await this.sendFeatureReport(query);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const response = await this.receiveFeatureReport(this.reportId);
    const { offset, view } = this.getPayloadView(response, 0x8c);

    const cmdEcho = view.getUint8(offset + 0);
    if (cmdEcho !== 0x8c) {
      console.warn(`0x8C query echo mismatch: 0x${cmdEcho.toString(16)}`);
      const defaultDpis = [400, 800, 1600, 3200, 6400, 26000];
      return defaultDpis[stageIndex];
    }

    const low = view.byteLength > offset + 2 ? view.getUint8(offset + 2) : 0;
    const high = view.byteLength > offset + 3 ? view.getUint8(offset + 3) : 0;
    const rawVal = (high << 8) | low;
    const dpi = (rawVal + 1) * 50;
    const clampedDpi = Math.max(50, Math.min(26000, dpi));
    this.simDpiValues[stageIndex] = clampedDpi;
    return clampedDpi;
  }

  /**
   * Queries all 6 DPI stage values from hardware
   */
  public async getAllDpiStages(): Promise<number[]> {
    const dpis: number[] = [];
    const defaultDpis = [400, 800, 1600, 3200, 6400, 26000];
    for (let i = 0; i < 6; i++) {
      try {
        const dpi = await this.getDpiStage(i);
        dpis.push(dpi);
      } catch (e) {
        dpis.push(defaultDpis[i]);
      }
    }
    return dpis;
  }

  /**
   * Sets DPI for a specific stage (Stage 0 to 5)
   * Formula: raw = (DPI / 50) - 1
   */
  public async setDpiStage(stageIndex: number, dpi: number): Promise<void> {
    if (stageIndex < 0 || stageIndex > 5) {
      throw new RangeError('Stage index must be between 0 and 5.');
    }
    const clampedDpi = Math.max(50, Math.min(26000, Math.round(dpi / 50) * 50));
    const rawValue = Math.floor(clampedDpi / 50) - 1;
    this.simDpiValues[stageIndex] = clampedDpi;

    this.busyDepth++;
    this.isBusy = true;
    try {
      const payload = new Uint8Array(this.reportLength);
      payload[0] = 0x0c; // Command ID: Set DPI for stage
      payload[1] = stageIndex;
      payload[2] = rawValue & 0xff;
      payload[3] = (rawValue >> 8) & 0xff;

      await this.sendFeatureReport(payload);
    } finally {
      this.busyDepth = Math.max(0, this.busyDepth - 1);
      this.isBusy = this.busyDepth > 0;
    }
  }

  /**
   * Sets the mouse Polling Rate (125Hz up to 8000Hz)
   */
  public async setPollingRate(rate: PollingRate): Promise<void> {
    this.currentPollingRate = rate;
    if (this.isSimulated) {
      this.simPollingRate = rate;
    }
    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x0d; // Command ID: Set Polling Rate
    payload[1] = rate;

    await this.sendFeatureReport(payload);
  }

  /**
   * Queries current key debounce time in milliseconds from hardware
   * Protocol: Command 0x89, Subcommand 0x01 -> Echo 0x89 0x01 [debounceMs]
   */
  public async getDebounceTime(): Promise<number> {
    if (this.isSimulated) {
      return this.currentDebounce;
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x89; // Command 0x89 (Advanced Settings Query)
    query[1] = 0x01; // Subcommand 0x01 (Key Debounce Time)

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.sendFeatureReport(query);
        await new Promise((resolve) => setTimeout(resolve, 30));

        const response = await this.receiveFeatureReport(this.reportId);
        const { offset, view } = this.getPayloadView(response, 0x89);

        const cmdEcho = view.getUint8(offset + 0);
        const subEcho = view.byteLength > offset + 1 ? view.getUint8(offset + 1) : 0;

        if (cmdEcho === 0x89 && subEcho === 0x01) {
          if (view.byteLength > offset + 2) {
            const raw = view.getUint8(offset + 2);
            if (raw >= 0 && raw <= 30) {
              this.currentDebounce = raw;
              return raw;
            }
          }
        }
      } catch (err) {
        console.warn('Debounce query attempt failed:', err);
      }
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return this.currentDebounce;
  }

  /**
   * Queries current active Polling Rate and debounce time from mouse
   */
  public async getPollingRate(): Promise<{ rate: PollingRate; debounceMs: number }> {
    if (this.isSimulated) {
      return { rate: this.simPollingRate, debounceMs: this.currentDebounce };
    }
    if (!this.supportsConfig) {
      return {
        rate: this.activeConnectionMode === 'bluetooth' ? PollingRate.Rate125Hz : this.currentPollingRate,
        debounceMs: this.currentDebounce,
      };
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x8d; // Command 0x8D (Polling rate query)

    let cmdEcho = 0;
    let rateByte = this.currentPollingRate;

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.sendFeatureReport(query);
      await new Promise((resolve) => setTimeout(resolve, 25));

      const response = await this.receiveFeatureReport(this.reportId);
      const { offset, view } = this.getPayloadView(response, 0x8d);

      cmdEcho = view.getUint8(offset + 0);
      if (cmdEcho === 0x8d) {
        rateByte = view.getUint8(offset + 1);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    if (cmdEcho === 0x8d) {
      let rate: PollingRate = this.currentPollingRate;
      switch (rateByte) {
        case 0x03: rate = PollingRate.Rate125Hz; break;
        case 0x02: rate = PollingRate.Rate250Hz; break;
        case 0x01: rate = PollingRate.Rate500Hz; break;
        case 0x00: rate = PollingRate.Rate1000Hz; break;
        case 0x06: rate = PollingRate.Rate2000Hz; break;
        case 0x05: rate = PollingRate.Rate4000Hz; break;
        case 0x04: rate = PollingRate.Rate8000Hz; break;
      }
      this.currentPollingRate = rate;
    }

    // Now query actual debounce time with dedicated protocol query 0x89 0x01
    await new Promise((resolve) => setTimeout(resolve, 35));
    const debounceMs = await this.getDebounceTime();

    return { rate: this.currentPollingRate, debounceMs };
  }

  /**
   * Sets DPI stages count, active DPI stage, DPI LED effect, brightness, and speed
   * Preserves unspecified cached fields so single-setting updates do not overwrite others.
   * Protocol Command: 0x0B
   */
  public async setLighting(config: LightingConfig): Promise<void> {
    const totalStages = Math.max(1, Math.min(6, config.totalDpiStages ?? this.currentTotalDpiStages));
    const activeStage = Math.max(0, Math.min(5, config.activeDpiStage));
    const dpiLedEffect = config.dpiLedEffect ?? this.currentDpiLedEffect;
    const brightness = Math.max(0, Math.min(2, config.brightness ?? this.currentLedBrightness));
    const speed = Math.max(0, Math.min(2, config.speed ?? this.currentLedSpeed));

    this.currentTotalDpiStages = totalStages;
    this.currentDpiStage = activeStage;
    this.currentDpiLedEffect = dpiLedEffect;
    this.currentLedBrightness = brightness;
    this.currentLedSpeed = speed;

    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x0b; // Command ID: Lighting & Active Stage
    payload[1] = totalStages; // byte 1: Total stages enabled (1..6)
    payload[2] = activeStage; // byte 2: Active DPI stage index (0 to 5 for Stage 1 to 6)
    payload[3] = dpiLedEffect;
    payload[4] = brightness;
    payload[5] = speed;
    payload[6] = 0x01;

    await this.sendFeatureReport(payload);
  }

  /**
   * Sets the number of active DPI stages (1..6) via Command 0x0B while preserving LED settings.
   */
  public async setTotalDpiStages(totalStages: number): Promise<void> {
    const clampedTotal = Math.max(1, Math.min(6, Math.round(totalStages)));
    const clampedActive = Math.min(this.currentDpiStage, clampedTotal - 1);
    await this.setLighting({
      totalDpiStages: clampedTotal,
      activeDpiStage: clampedActive,
    });
  }

  /**
   * Sets debounce time in milliseconds (0 to 30 ms, default 8ms)
   * Hardware protocol stores debounce time directly in milliseconds (1:1 direct mapping)
   * Matches Aula_Driver (DeviceConstants.MinDebounceMs = 0, MaxDebounceMs = 30)
   * Protocol Command: 0x09, Subcommand: 0x01
   */
  public async setDebounceTime(debounceMs: number): Promise<void> {
    const clamped = Math.max(0, Math.min(30, Math.round(debounceMs)));
    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x09;
    payload[1] = 0x01;
    payload[2] = clamped;

    await this.sendFeatureReport(payload);
    this.currentDebounce = clamped;
  }

  /**
   * Sets auto sleep timeout in seconds (10s to 3600s, default 60s)
   * Protocol Command: 0x09, Subcommand: 0x03
   * Bytes 2..3: 16-bit Little-Endian timeout in seconds
   */
  public async setSleepTime(sleepSeconds: number): Promise<void> {
    const clamped = Math.max(10, Math.min(3600, Math.round(sleepSeconds)));
    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x09;
    payload[1] = 0x03;
    payload[2] = clamped & 0xff;
    payload[3] = (clamped >> 8) & 0xff;

    await this.sendFeatureReport(payload);
    this.currentSleepSeconds = clamped;
  }

  /**
   * Returns the raw payload bytes from the last getSleepTime() response
   */
  public getLastSleepPacket(): number[] {
    return [...this.lastSleepPacket];
  }

  /**
   * Queries dormancy / auto sleep time in seconds from hardware
   * Protocol Command: 0x89, Subcommand: 0x03
   * Response Bytes 2..3: 16-bit LE seconds
   */
  public async getSleepTime(): Promise<number> {
    if (this.isSimulated) {
      this.lastSleepPacket = [0x89, 0x03, this.currentSleepSeconds & 0xff, (this.currentSleepSeconds >> 8) & 0xff];
      return this.currentSleepSeconds;
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x89;
    query[1] = 0x03;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.sendFeatureReport(query);
        await new Promise((resolve) => setTimeout(resolve, 40));

        const response = await this.receiveFeatureReport(this.reportId);
        const { offset, view } = this.getPayloadView(response, 0x89);
        const rawBytes = Array.from(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
        this.lastSleepPacket = rawBytes;

        const cmdEcho = view.getUint8(offset + 0);
        const subEcho = view.byteLength > offset + 1 ? view.getUint8(offset + 1) : 0;

        if (cmdEcho === 0x89 && subEcho === 0x03) {
          if (view.byteLength > offset + 3) {
            const low = view.getUint8(offset + 2);
            const high = view.getUint8(offset + 3);
            const val = (high << 8) | low;
            if (val >= 10 && val <= 3600) {
              this.currentSleepSeconds = val;
              return val;
            }
          }
        } else {
          console.warn(`Sleep time echo mismatch (attempt ${attempt + 1}):`, rawBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        }
      } catch (err) {
        console.warn('Sleep time query failed:', err);
      }
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    return this.currentSleepSeconds;
  }

  /**
   * Sets button action mapping (Buttons 1 to 6)
   * Protocol Command: 0x06, Byte 1: Button Hardware Index (0..5), Bytes 2..5: 32-bit Little-Endian Function Code
   * Note: Hardware Index 3 = Forward (Button 5), Index 4 = Backward (Button 4)
   * Reverse-engineered from AulaDriver (AulaDevice.cs / DeviceConstants.OpcodeSetButtonMapping)
   */
  public async setButtonMapping(buttonIndex: number, action: ButtonAction | number): Promise<void> {
    const hwIndex = AulaSC900ProController.buttonToHwIndex(buttonIndex);
    if (hwIndex < 0 || hwIndex > 5) {
      throw new RangeError('Button index must be between 1 and 6 (or hwIndex 0 and 5).');
    }

    const dword = action >>> 0;
    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x06; // OpcodeSetButtonMapping
    payload[1] = hwIndex;
    payload[2] = dword & 0xff;
    payload[3] = (dword >>> 8) & 0xff;
    payload[4] = (dword >>> 16) & 0xff;
    payload[5] = (dword >>> 24) & 0xff;
    payload[6] = 0x00;
    payload[7] = 0x00;

    await this.sendFeatureReport(payload);
    const logicalButton = (buttonIndex >= 1 && buttonIndex <= 6)
      ? buttonIndex
      : AulaSC900ProController.hwIndexToButton(hwIndex);
    this.buttonMappings[logicalButton] = dword;
  }

  /**
   * Queries hardware mapping for a specific button (Cmd 0x86)
   */
  public async getButtonMapping(buttonIndex: number): Promise<number | null> {
    const hwIndex = AulaSC900ProController.buttonToHwIndex(buttonIndex);
    if (hwIndex < 0 || hwIndex > 5) {
      return null;
    }
    const logicalButton = (buttonIndex >= 1 && buttonIndex <= 6)
      ? buttonIndex
      : AulaSC900ProController.hwIndexToButton(hwIndex);

    if (this.isSimulated) {
      return this.buttonMappings[logicalButton] ?? null;
    }

    try {
      const query = new Uint8Array(this.reportLength);
      query[0] = 0x86; // OpcodeGetButtonMapping
      query[1] = hwIndex;

      await this.sendFeatureReport(query);
      await new Promise((r) => setTimeout(r, 20));

      const response = await this.receiveFeatureReport(this.reportId);
      const { offset, view } = this.getPayloadView(response, 0x86);

      if (view.byteLength >= offset + 6) {
        const cmdEcho = view.getUint8(offset + 0);
        const btnEcho = view.getUint8(offset + 1);
        const actionCode = view.getUint32(offset + 2, true) >>> 0;

        if (cmdEcho === 0x86 && btnEcho === hwIndex && actionCode !== 0xffffffff) {
          this.buttonMappings[logicalButton] = actionCode;
          return actionCode;
        }
      }
    } catch (err) {
      console.warn(`Query button ${buttonIndex} (hwIndex ${hwIndex}) mapping error:`, err);
    }

    return this.buttonMappings[logicalButton] ?? null;
  }

  /**
   * Queries all button mappings from hardware (Buttons 1 to 6)
   */
  public async getAllButtonMappings(): Promise<Record<number, number>> {
    if (this.isSimulated) {
      return { ...this.buttonMappings };
    }

    for (let b = 1; b <= 6; b++) {
      try {
        await this.getButtonMapping(b);
        await new Promise((r) => setTimeout(r, 20));
      } catch (e) {
        // Continue querying remaining buttons
      }
    }

    return { ...this.buttonMappings };
  }

  /**
   * Resets all buttons to factory default mapping
   */
  public async resetButtonsToDefault(): Promise<void> {
    const defaults: Array<{ button: number; action: number }> = [
      { button: 1, action: ButtonAction.LeftClick },
      { button: 2, action: ButtonAction.RightClick },
      { button: 3, action: ButtonAction.MiddleClick },
      { button: 4, action: ButtonAction.Forward },
      { button: 5, action: ButtonAction.Backward },
      { button: 6, action: ButtonAction.DpiLoop },
    ];

    for (const item of defaults) {
      await this.setButtonMapping(item.button, item.action);
      await new Promise((r) => setTimeout(r, 25));
    }
  }

  public getButtonMappings(): Record<number, number> {
    return { ...this.buttonMappings };
  }

  /**
   * Returns the raw payload bytes from the last battery Input Report (0x09)
   */
  public getLastBatteryPacket(): number[] {
    return [...this.lastBatteryPacket];
  }

  /**
   * Decodes HID Input Report 0x09 battery payload (`buf[1]` in Aula SC900PRO.exe 0x446750 -> 0x435ef0):
   * - bits 0..6 (`byte1 & 0x7f`): raw battery percentage (0..100)
   * - bit 7 (`byte1 & 0x80`): charging state (1 = charging, 0 = discharging; inverted to statusFlag 0/1 in [edi+0x1004])
   * - 10-sample sliding window: immediate while count < 10, moving average `trunc(sum / 10)` once 10 samples exist
   */
  private parseBatteryInputPayload(view: DataView, offset: number): BatteryStatus | null {
    if (view.byteLength <= offset) return null;

    const byte1 = view.getUint8(offset);
    const isCharging = (byte1 & 0x80) !== 0;
    const statusFlag = isCharging ? 0 : 1;
    const rawPercentage = Math.max(0, Math.min(100, byte1 & 0x7f));

    let percentage: number;
    if (this.batterySamples.length < 10) {
      this.batterySamples.push(rawPercentage);
      percentage = rawPercentage;
    } else {
      this.batterySamples.shift();
      this.batterySamples.push(rawPercentage);
      const sum = this.batterySamples.reduce((acc, v) => acc + v, 0);
      percentage = Math.trunc(sum / 10);
    }

    const bars = AulaSC900ProController.computeBatteryBars(percentage);
    return {
      percentage,
      isCharging,
      statusFlag,
      bars,
      hasReading: true,
    };
  }

  /**
   * Returns the latest decoded battery state from HID Input Report 0x09
   * (or simulated state when running in demo mode).
   */
  public async getBatteryStatus(): Promise<BatteryStatus> {
    if (this.isSimulated) {
      const bars = AulaSC900ProController.computeBatteryBars(this.simBattery.percentage);
      this.lastBatteryPacket = [0x09, (this.simBattery.isCharging ? 0x80 : 0x00) | (this.simBattery.percentage & 0x7f)];
      return { ...this.simBattery, bars, hasReading: true };
    }

    if (this.activeTransport === 'webbluetooth' && this.bleServer?.connected && this.bleBatteryChar) {
      try {
        return await this.runBleGattOp(async () => {
          const isCharging = await this.readBleBatteryChargingState();
          const view = await this.bleBatteryChar!.readValue();
          if (view.byteLength >= 1) {
            return this.applyBleBatteryLevel(view.getUint8(0), isCharging);
          }
          return { ...this.lastBatteryStatus };
        });
      } catch {
        return { ...this.lastBatteryStatus };
      }
    }

    return { ...this.lastBatteryStatus };
  }

  // =========================================================================
  // Sensor Tuning, Fire Key, Device Info, Firmware & Factory Reset
  // =========================================================================

  /**
   * Returns true if high-rate wireless polling (> 1000 Hz) locks manual Sensor Mode switching,
   * matching the UI behavior in Aula SC900PRO.exe (0x421781: pollingByte > 3).
   */
  public static isSensorModeLockedByPollingRate(rate: PollingRate): boolean {
    return (
      rate === PollingRate.Rate2000Hz ||
      rate === PollingRate.Rate4000Hz ||
      rate === PollingRate.Rate8000Hz
    );
  }

  /**
   * Sends a padded feature report packet of up to `reportLength` bytes.
   */
  private async sendCommandBytes(commandBytes: number[]): Promise<void> {
    const payload = new Uint8Array(this.reportLength);
    for (let i = 0; i < Math.min(commandBytes.length, payload.length); i++) {
      payload[i] = commandBytes[i] & 0xff;
    }
    await this.sendFeatureReport(payload);
  }

  /**
   * Sends a query feature report, waits for hardware readiness, reads back the response,
   * and verifies the expected command (and optional subcommand) echo bytes.
   */
  private async queryFeatureCommand(
    commandBytes: number[],
    expectedCmdEcho: number,
    expectedSubCmd?: number,
    delayMs: number = 15,
  ): Promise<{ offset: number; view: DataView; bytes: number[] } | null> {
    await this.sendCommandBytes(commandBytes);
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const response = await this.receiveFeatureReport(this.reportId);
    if (response.byteLength === 0) {
      return null;
    }

    const { offset, view } = this.getPayloadView(response, expectedCmdEcho);
    if (view.byteLength <= offset) {
      return null;
    }

    const cmdEcho = view.getUint8(offset);
    if (cmdEcho !== expectedCmdEcho) {
      console.warn(`0x${expectedCmdEcho.toString(16)} query echo mismatch: 0x${cmdEcho.toString(16)}`);
      return null;
    }

    if (expectedSubCmd !== undefined) {
      if (view.byteLength <= offset + 1 || view.getUint8(offset + 1) !== expectedSubCmd) {
        const subEcho = view.byteLength > offset + 1 ? view.getUint8(offset + 1) : -1;
        console.warn(`0x${expectedCmdEcho.toString(16)} subcommand echo mismatch: expected 0x${expectedSubCmd.toString(16)}, got 0x${subEcho.toString(16)}`);
        return null;
      }
    }

    const bytes: number[] = [];
    for (let i = offset; i < view.byteLength; i++) {
      bytes.push(view.getUint8(i));
    }

    return { offset, view, bytes };
  }

  private async setSensorByteSubcommand(subCmd: number, value: number): Promise<void> {
    await this.sendCommandBytes([0x0a, subCmd, value & 0xff]);
  }

  private async getSensorByteSubcommand(subCmd: number, fallback: number): Promise<number> {
    const res = await this.queryFeatureCommand([0x8a, subCmd], 0x8a, subCmd, 12);
    if (!res || res.bytes.length < 3) {
      return fallback;
    }
    return res.bytes[2];
  }

  /** Sets Lift-Off Distance (LOD): 0 = 1.0mm, 1 = 2.0mm, 2 = 0.7mm (PAW3950). (Cmd 0x0A 0x01) */
  public async setLod(lod: LodLevel): Promise<void> {
    const clamped = Math.max(0, Math.min(2, Math.round(lod))) as LodLevel;
    this.currentSensorSettings.lod = clamped;
    await this.setSensorByteSubcommand(0x01, clamped);
  }

  /** Queries Lift-Off Distance (LOD). (Cmd 0x8A 0x01) */
  public async getLod(): Promise<LodLevel> {
    if (this.isSimulated) return this.currentSensorSettings.lod;
    const raw = await this.getSensorByteSubcommand(0x01, this.currentSensorSettings.lod);
    const val = Math.max(0, Math.min(2, raw)) as LodLevel;
    this.currentSensorSettings.lod = val;
    return val;
  }

  /** Enables or disables Ripple Control smoothing. (Cmd 0x0A 0x02) */
  public async setRippleControl(enabled: boolean): Promise<void> {
    this.currentSensorSettings.rippleControl = Boolean(enabled);
    await this.setSensorByteSubcommand(0x02, enabled ? 1 : 0);
  }

  /** Queries Ripple Control state. (Cmd 0x8A 0x02) */
  public async getRippleControl(): Promise<boolean> {
    if (this.isSimulated) return this.currentSensorSettings.rippleControl;
    const raw = await this.getSensorByteSubcommand(0x02, this.currentSensorSettings.rippleControl ? 1 : 0);
    const val = raw !== 0;
    this.currentSensorSettings.rippleControl = val;
    return val;
  }

  /** Enables or disables Angle Snapping (straight-line correction). (Cmd 0x0A 0x03) */
  public async setAngleSnapping(enabled: boolean): Promise<void> {
    this.currentSensorSettings.angleSnapping = Boolean(enabled);
    await this.setSensorByteSubcommand(0x03, enabled ? 1 : 0);
  }

  /** Queries Angle Snapping state. (Cmd 0x8A 0x03) */
  public async getAngleSnapping(): Promise<boolean> {
    if (this.isSimulated) return this.currentSensorSettings.angleSnapping;
    const raw = await this.getSensorByteSubcommand(0x03, this.currentSensorSettings.angleSnapping ? 1 : 0);
    const val = raw !== 0;
    this.currentSensorSettings.angleSnapping = val;
    return val;
  }

  /** Enables or disables Motion Sync. (Cmd 0x0A 0x04) */
  public async setMotionSync(enabled: boolean): Promise<void> {
    this.currentSensorSettings.motionSync = Boolean(enabled);
    await this.setSensorByteSubcommand(0x04, enabled ? 1 : 0);
  }

  /** Queries Motion Sync state. (Cmd 0x8A 0x04) */
  public async getMotionSync(): Promise<boolean> {
    if (this.isSimulated) return this.currentSensorSettings.motionSync;
    const raw = await this.getSensorByteSubcommand(0x04, this.currentSensorSettings.motionSync ? 1 : 0);
    const val = raw !== 0;
    this.currentSensorSettings.motionSync = val;
    return val;
  }

  /** Sets Sensor Mode: 0 = LP, 1 = HP, 2 = Corded. (Cmd 0x0A 0x05) */
  public async setSensorMode(mode: SensorMode): Promise<void> {
    const clamped = Math.max(0, Math.min(2, Math.round(mode))) as SensorMode;
    this.currentSensorSettings.sensorMode = clamped;
    await this.setSensorByteSubcommand(0x05, clamped);
  }

  /** Queries Sensor Mode: 0 = LP, 1 = HP, 2 = Corded. (Cmd 0x8A 0x05) */
  public async getSensorMode(): Promise<SensorMode> {
    if (this.isSimulated) return this.currentSensorSettings.sensorMode;
    const raw = await this.getSensorByteSubcommand(0x05, this.currentSensorSettings.sensorMode);
    const val = Math.max(0, Math.min(2, raw)) as SensorMode;
    this.currentSensorSettings.sensorMode = val;
    return val;
  }

  /**
   * Queries all five 0x8A sensor settings sequentially (LOD, Ripple Control, Angle Snapping, Motion Sync, Sensor Mode).
   */
  public async getAllSensorSettings(): Promise<SensorSettings> {
    if (this.isSimulated) {
      return { ...this.currentSensorSettings };
    }

    const lod = await this.getLod();
    await new Promise((r) => setTimeout(r, 15));
    const rippleControl = await this.getRippleControl();
    await new Promise((r) => setTimeout(r, 15));
    const angleSnapping = await this.getAngleSnapping();
    await new Promise((r) => setTimeout(r, 15));
    const motionSync = await this.getMotionSync();
    await new Promise((r) => setTimeout(r, 15));
    const sensorMode = await this.getSensorMode();

    return { lod, rippleControl, angleSnapping, motionSync, sensorMode };
  }

  /**
   * Sets Fire Key burst parameters: repeat times (0..3) and interval speed (0..255 ms).
   * Protocol Command: 0x09 0x02 <times> <speedLo> <speedHi>
   */
  public async setFireKeyConfig(repeatTimes: number, speedMs: number): Promise<void> {
    const clampedTimes = Math.max(0, Math.min(3, Math.round(repeatTimes)));
    const clampedSpeed = Math.max(0, Math.min(255, Math.round(speedMs)));
    this.currentFireKey = { repeatTimes: clampedTimes, speedMs: clampedSpeed };

    await this.sendCommandBytes([
      0x09,
      0x02,
      clampedTimes,
      clampedSpeed & 0xff,
      (clampedSpeed >> 8) & 0xff,
    ]);
  }

  /**
   * Queries Fire Key repeat times (0..3) and interval speed (0..255 ms).
   * Protocol Command: 0x89 0x02
   */
  public async getFireKeyConfig(): Promise<FireKeyConfig> {
    if (this.isSimulated) {
      return { ...this.currentFireKey };
    }

    const res = await this.queryFeatureCommand([0x89, 0x02], 0x89, 0x02, 12);
    if (!res || res.bytes.length < 5) {
      return { ...this.currentFireKey };
    }

    const repeatTimes = Math.max(0, Math.min(3, res.bytes[2]));
    const speedMs = Math.max(0, Math.min(255, res.bytes[3] | (res.bytes[4] << 8)));
    this.currentFireKey = { repeatTimes, speedMs };
    return { repeatTimes, speedMs };
  }

  /**
   * Queries device firmware version (Command 0x80).
   * Original software computes `version = byte[1] * 10 + byte[2]` (0x444e00).
   */
  public async getFirmwareVersion(): Promise<FirmwareVersionInfo> {
    if (this.isSimulated) {
      return { major: 1, minor: 0, numeric: 10, formatted: 'v1.0 (Sim)', rawPacket: [0x80, 0x01, 0x00] };
    }

    if (this.activeTransport === 'webbluetooth' && !this.bleSupportsConfig) {
      return {
        major: Math.floor(this.bleFirmwareNumeric / 10),
        minor: this.bleFirmwareNumeric % 10,
        numeric: this.bleFirmwareNumeric,
        formatted: this.bleFirmwareVersion ? `${this.bleFirmwareVersion} (BLE)` : 'BLE GATT',
        rawPacket: [],
      };
    }

    if (this.activeTransport === 'webhid' && !this.hidHasVendorConfig) {
      return {
        major: 1,
        minor: 0,
        numeric: 10,
        formatted: this.activeConnectionMode === 'bluetooth' ? 'BT HID (Read-Only)' : 'HID Basic',
        rawPacket: [],
      };
    }

    const res = await this.queryFeatureCommand([0x80], 0x80, undefined, 12);
    if (!res || res.bytes.length < 3) {
      return { major: 0, minor: 0, numeric: 0, formatted: 'Unknown', rawPacket: res?.bytes ?? [] };
    }

    const major = res.bytes[1];
    const minor = res.bytes[2];
    const numeric = major * 10 + minor;
    return {
      major,
      minor,
      numeric,
      formatted: `v${major}.${minor}`,
      rawPacket: res.bytes,
    };
  }

  /**
   * Queries hardware info, connection status, and optical sensor chip ID (Command 0x8F).
   * Maps sensor ID bytes (0xF0 = PAW3395, 0xF1 = PAW3950, 0xFA = Legacy/SE) per 0x4378e1.
   */
  public async getDeviceInfo(): Promise<DeviceHardwareInfo> {
    if (this.isSimulated) {
      return {
        connectionStatus: 0x03,
        isOnline: true,
        modelId: 0x0c,
        modelName: 'SC900 Pro',
        variantFlag: 0x02,
        sensorByte: 0xf1,
        sensorName: 'PAW3950 (Demo)',
        supportsFineLod: true,
        rawPacket: [0x8f, 0x03, 0x0c, 0x02, 0x00, 0xf1],
      };
    }

    if (this.activeTransport === 'webbluetooth' && !this.bleSupportsConfig) {
      return {
        connectionStatus: this.isConnected ? 0x03 : 0x00,
        isOnline: this.isConnected && this.deviceOnlineFlag,
        modelId: 0x0c,
        modelName: this.bleModelNumber || this.deviceName,
        variantFlag: 0x00,
        sensorByte: 0x00,
        sensorName: this.bleManufacturer ? `${this.bleManufacturer} (BLE GATT)` : 'BLE Mode (Read-Only)',
        supportsFineLod: false,
        rawPacket: [],
      };
    }

    if (this.activeTransport === 'webhid' && !this.hidHasVendorConfig) {
      return {
        connectionStatus: this.isConnected ? 0x03 : 0x00,
        isOnline: this.isConnected && this.deviceOnlineFlag,
        modelId: 0x0c,
        modelName: this.deviceName,
        variantFlag: 0x00,
        sensorByte: 0x00,
        sensorName: this.activeConnectionMode === 'bluetooth' ? 'Bluetooth HID (0xFF05 unavailable)' : 'HID Basic Interface',
        supportsFineLod: false,
        rawPacket: [],
      };
    }

    const res = await this.queryFeatureCommand([0x8f], 0x8f, undefined, 30);
    if (!res || res.bytes.length < 6) {
      return {
        connectionStatus: 0x00,
        isOnline: false,
        modelId: 0x00,
        modelName: 'SC900 Pro',
        variantFlag: 0x00,
        sensorByte: 0xf0,
        sensorName: 'PAW3395 (Default)',
        supportsFineLod: false,
        rawPacket: res?.bytes ?? [],
      };
    }

    const connectionStatus = res.bytes[1];
    const isOnline = connectionStatus === 0x03 || connectionStatus === 0x83;
    if (this.deviceOnlineFlag !== isOnline) {
      this.deviceOnlineFlag = isOnline;
      this.onConnectionChange?.(this.getConnectionStatus());
    }
    const modelId = res.bytes[2];
    const variantFlag = res.bytes[3];
    const sensorByte = variantFlag === 0x02 ? res.bytes[5] : res.bytes[4];

    let sensorName = `PixArt (0x${sensorByte.toString(16).toUpperCase()})`;
    if (sensorByte === 0xf1) sensorName = 'PAW3950';
    else if (sensorByte === 0xf0) sensorName = 'PAW3395';
    else if (sensorByte === 0xfa) sensorName = 'PAW3395SE / Legacy';

    return {
      connectionStatus,
      isOnline,
      modelId,
      modelName: modelId === 0x0c ? 'SC900 Pro' : `SC900 (0x${modelId.toString(16)})`,
      variantFlag,
      sensorByte,
      sensorName,
      supportsFineLod: sensorByte === 0xf1,
      rawPacket: res.bytes,
    };
  }

  public getCachedSensorSettings(): SensorSettings {
    return { ...this.currentSensorSettings };
  }

  public getCachedFireKeyConfig(): FireKeyConfig {
    return { ...this.currentFireKey };
  }

  public getCachedLightingState(): {
    totalDpiStages: number;
    activeDpiStage: number;
    dpiLedEffect: DpiLedEffect;
    brightness: number;
    speed: number;
  } {
    return {
      totalDpiStages: this.currentTotalDpiStages,
      activeDpiStage: this.currentDpiStage,
      dpiLedEffect: this.currentDpiLedEffect,
      brightness: this.currentLedBrightness,
      speed: this.currentLedSpeed,
    };
  }

  /**
   * Restores all hardware settings to exact factory defaults from Aula SC900PRO.exe (0x42e000 / 0x4344e0):
   * - Polling Rate: 1000 Hz (0x00)
   * - 6 DPI stages: [400, 800, 1600, 3200, 6400, 26000]
   * - Total Stages: 6, Active Stage: 1 (Stage 2 / 800 DPI), LED Effect: Steady (0), Brightness: 1, Speed: 1
   * - LOD: 1.0 mm (0), Ripple Control: Off, Angle Snapping: Off, Motion Sync: On, Sensor Mode: HP (1)
   * - Debounce: 8 ms, Fire Key: 3 repeats / 10 ms, Dormancy Sleep: 60 s
   * - Buttons 1..6: factory default bindings
   */
  public async resetToFactoryDefaults(onProgress?: (label: string, progress: number) => void): Promise<void> {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const factoryDpis = [400, 800, 1600, 3200, 6400, 26000];

    this.busyDepth++;
    this.isBusy = true;
    try {
      onProgress?.('Polling Rate (1000 Hz)', 10);
      this.simPollingRate = PollingRate.Rate1000Hz;
      await this.setPollingRate(PollingRate.Rate1000Hz);
      if (!this.isSimulated) await delay(30);

      for (let i = 0; i < factoryDpis.length; i++) {
        onProgress?.(`DPI Stage ${i + 1} (${factoryDpis[i]} DPI)`, 15 + i * 7);
        await this.setDpiStage(i, factoryDpis[i]);
        if (!this.isSimulated) await delay(25);
      }

      onProgress?.('DPI Stages & LED (6 stages, Stage 2 active)', 60);
      await this.setLighting({
        totalDpiStages: 6,
        activeDpiStage: 1,
        dpiLedEffect: DpiLedEffect.Steady,
        brightness: 1,
        speed: 1,
      });
      if (!this.isSimulated) await delay(30);

      await this.sendCommandBytes([0x08, 0x01]);
      if (!this.isSimulated) await delay(25);

      onProgress?.('Sensor Tuning (LOD 1mm, HP, Motion Sync On)', 72);
      await this.setLod(LodLevel.OneMm);
      if (!this.isSimulated) await delay(25);
      await this.setRippleControl(false);
      if (!this.isSimulated) await delay(25);
      await this.setAngleSnapping(false);
      if (!this.isSimulated) await delay(25);
      await this.setMotionSync(true);
      if (!this.isSimulated) await delay(25);
      await this.setSensorMode(SensorMode.HP);
      if (!this.isSimulated) await delay(25);

      onProgress?.('Timing & Fire Key (8ms debounce, 60s sleep)', 85);
      await this.setDebounceTime(8);
      if (!this.isSimulated) await delay(25);
      await this.setFireKeyConfig(3, 10);
      if (!this.isSimulated) await delay(25);
      await this.setSleepTime(60);
      if (!this.isSimulated) await delay(25);

      onProgress?.('Button Defaults', 95);
      await this.resetButtonsToDefault();
      this.macroSlots = {};
      this.simMacroBuffers = {};
      onProgress?.('Factory Reset Complete', 100);
    } finally {
      this.busyDepth = Math.max(0, this.busyDepth - 1);
      this.isBusy = this.busyDepth > 0;
    }
  }

  // =========================================================================
  // Macro Upload / Readback, Key Combinations & Profile Management
  // =========================================================================

  /**
   * Uploads a 320-byte Macro payload into hardware slot `slotIndex` (0..5) using
   * Feature header [0x07, 0x0A, chunkIdx, 0x20, slotIndex] + 32-byte Output Report
   * per chunk (10 chunks total, matching Aula SC900PRO.exe @ 0x446190).
   */
  public async uploadMacro(
    slotIndex: number,
    macro: MacroDefinition,
    onChunkProgress?: (chunkIndex: number, totalChunks: number) => void,
  ): Promise<Uint8Array> {
    if (slotIndex < 0 || slotIndex > 5) {
      throw new RangeError('Macro hardware slotIndex must be between 0 and 5.');
    }

    const encoded = encodeMacroPayload(slotIndex, macro);
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const clonedMacro: MacroDefinition = {
      ...macro,
      steps: macro.steps.map(s => ({ ...s })),
    };

    this.busyDepth++;
    this.isBusy = true;
    try {
      for (let chunkIdx = 0; chunkIdx < MACRO_CHUNK_COUNT; chunkIdx++) {
        const offset = chunkIdx * MACRO_CHUNK_SIZE;
        const header = new Uint8Array(Math.max(8, this.reportLength));
        header[0] = 0x07;
        header[1] = 0x0a;
        header[2] = chunkIdx;
        header[3] = MACRO_CHUNK_SIZE;
        header[4] = slotIndex & 0xff;

        await this.sendFeatureReport(header);
        if (!this.isSimulated) await delay(40);

        const chunkData = encoded.slice(offset, offset + MACRO_CHUNK_SIZE);
        await this.sendOutputReport(chunkData);
        if (!this.isSimulated) await delay(60);

        onChunkProgress?.(chunkIdx + 1, MACRO_CHUNK_COUNT);
      }

      this.macroSlots[slotIndex] = clonedMacro;
      this.simMacroBuffers[slotIndex] = encoded;
      return encoded;
    } finally {
      this.busyDepth = Math.max(0, this.busyDepth - 1);
      this.isBusy = this.busyDepth > 0;
    }
  }

  /**
   * Reads back a 320-byte Macro from hardware slot `slotIndex` (0..5) via
   * Feature [0x87, 0x0A, chunkIdx, 0x20, slotIndex] + 32-byte Feature Readback
   * (matching Aula SC900PRO.exe @ 0x446330 & 0x431c10).
   */
  public async readMacro(slotIndex: number): Promise<MacroDefinition | null> {
    if (slotIndex < 0 || slotIndex > 5) {
      return null;
    }

    if (this.isSimulated) {
      if (this.simMacroBuffers[slotIndex]) {
        return decodeMacroPayload(this.simMacroBuffers[slotIndex], slotIndex);
      }
      return this.macroSlots[slotIndex]
        ? { ...this.macroSlots[slotIndex], steps: this.macroSlots[slotIndex].steps.map(s => ({ ...s })) }
        : null;
    }

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const fullBuf = new Uint8Array(MACRO_BUFFER_SIZE);

    this.busyDepth++;
    this.isBusy = true;
    try {
      for (let chunkIdx = 0; chunkIdx < MACRO_CHUNK_COUNT; chunkIdx++) {
        const query = new Uint8Array(Math.max(8, this.reportLength));
        query[0] = 0x87;
        query[1] = 0x0a;
        query[2] = chunkIdx;
        query[3] = MACRO_CHUNK_SIZE;
        query[4] = slotIndex & 0xff;

        await this.sendFeatureReport(query);
        await delay(90);

        const response = await this.receiveFeatureReport(this.reportId);
        if (response.byteLength === 0) {
          return null;
        }
        const offset = (response.byteLength > MACRO_CHUNK_SIZE && response.getUint8(0) === this.reportId) ? 1 : 0;
        const copyLen = Math.min(MACRO_CHUNK_SIZE, response.byteLength - offset);
        for (let b = 0; b < copyLen; b++) {
          fullBuf[chunkIdx * MACRO_CHUNK_SIZE + b] = response.getUint8(offset + b);
        }
      }

      const decoded = decodeMacroPayload(fullBuf, slotIndex);
      if (decoded) {
        this.macroSlots[slotIndex] = decoded;
        this.simMacroBuffers[slotIndex] = fullBuf;
      }
      return decoded;
    } catch (err) {
      console.warn(`Failed reading macro slot ${slotIndex}:`, err);
      return this.macroSlots[slotIndex] ?? null;
    } finally {
      this.busyDepth = Math.max(0, this.busyDepth - 1);
      this.isBusy = this.busyDepth > 0;
    }
  }

  /**
   * Uploads `macro` into the button's hardware slot and binds the button to execute it (0x06 action 0x09).
   */
  public async bindButtonToMacro(
    buttonIndex: number,
    macro: MacroDefinition,
  ): Promise<{ hwSlot: number; actionDword: number }> {
    const hwSlot = AulaSC900ProController.buttonToHwIndex(buttonIndex);
    if (hwSlot < 0 || hwSlot > 5) {
      throw new RangeError('Button index must be between 1 and 6.');
    }

    await this.uploadMacro(hwSlot, macro);
    if (!this.isSimulated) {
      await new Promise((r) => setTimeout(r, 50));
    }

    const actionDword = buildMacroAction(hwSlot);
    await this.setButtonMapping(buttonIndex, actionDword);
    return { hwSlot, actionDword };
  }

  /**
   * Encodes a 1-3 key combination (+ modifiers) and binds it to `buttonIndex`.
   */
  public async bindButtonToKeyCombo(buttonIndex: number, combo: KeyCombinationSpec): Promise<number> {
    const actionDword = encodeKeyCombination(combo);
    if (actionDword === 0) {
      throw new Error('Key combination must include at least one key or modifier.');
    }
    await this.setButtonMapping(buttonIndex, actionDword);
    return actionDword;
  }

  /**
   * Reads macro definitions for any button currently bound to a hardware macro action (`& 0xff === 0x09`).
   */
  public async syncAssignedMacrosFromHardware(): Promise<Record<number, MacroDefinition>> {
    const mappings = this.getButtonMappings();
    const seenSlots = new Set<number>();

    for (let b = 1; b <= 6; b++) {
      const action = mappings[b];
      if (typeof action === 'number' && isMacroAction(action)) {
        const slot = getMacroSlotFromAction(action);
        if (slot >= 0 && slot <= 5 && !seenSlots.has(slot)) {
          seenSlots.add(slot);
          await this.readMacro(slot);
        }
      }
    }

    return this.getCachedMacrosBySlot();
  }

  public getCachedMacrosBySlot(): Record<number, MacroDefinition> {
    const copy: Record<number, MacroDefinition> = {};
    for (const [k, v] of Object.entries(this.macroSlots)) {
      if (v) {
        copy[Number(k)] = { ...v, steps: v.steps.map(s => ({ ...s })) };
      }
    }
    return copy;
  }

  public getCachedDpiValues(): number[] {
    return [...this.simDpiValues];
  }

  public getCachedPollingRate(): PollingRate {
    return this.currentPollingRate;
  }

  public getCachedDebounceTime(): number {
    return this.currentDebounce;
  }

  public getCachedSleepTime(): number {
    return this.currentSleepSeconds;
  }

  /**
   * Captures the current controller state into a serializable MouseProfile snapshot.
   */
  public exportCurrentProfile(
    id: string,
    name: string,
    extraMacros: MacroDefinition[] = [],
  ): MouseProfile {
    const buttonMappings = this.getButtonMappings();
    const buttonMacros: Record<number, MacroDefinition> = {};
    for (let b = 1; b <= 6; b++) {
      const action = buttonMappings[b];
      if (typeof action === 'number' && isMacroAction(action)) {
        const slot = getMacroSlotFromAction(action);
        const bound = this.macroSlots[slot];
        if (bound) {
          buttonMacros[b] = { ...bound, steps: bound.steps.map(s => ({ ...s })) };
        }
      }
    }

    return {
      version: 1,
      id,
      name,
      dpiStages: this.getCachedDpiValues(),
      totalDpiStages: this.currentTotalDpiStages,
      activeDpiStage: this.currentDpiStage,
      pollingRate: this.currentPollingRate,
      debounceMs: this.currentDebounce,
      sleepSeconds: this.currentSleepSeconds,
      dpiLedEffect: this.currentDpiLedEffect,
      brightness: this.currentLedBrightness,
      speed: this.currentLedSpeed,
      sensorSettings: { ...this.currentSensorSettings },
      fireKey: { ...this.currentFireKey },
      buttonMappings,
      macros: extraMacros.map(m => ({ ...m, steps: m.steps.map(s => ({ ...s })) })),
      buttonMacros,
    };
  }

  /**
   * Applies an entire MouseProfile (DPI, Polling, Sensor Tuning, Debounce, Fire Key,
   * Sleep, Macros, and Button Mappings) sequentially to the mouse or simulator.
   */
  public async applyProfile(
    profile: MouseProfile,
    onProgress?: (label: string, progress: number) => void,
  ): Promise<void> {
    const mappings = profile.buttonMappings || {};
    const hasLeftClick = Object.values(mappings).some(a => a === ButtonAction.LeftClick);
    if (!hasLeftClick) {
      throw new Error('Profile safety check failed: at least one button must remain Left Click.');
    }

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    this.busyDepth++;
    this.isBusy = true;
    try {
      onProgress?.(`Polling Rate`, 8);
      await this.setPollingRate(profile.pollingRate);
      if (!this.isSimulated) await delay(25);

      const dpis = (profile.dpiStages || [400, 800, 1600, 3200, 6400, 26000]).slice(0, 6);
      for (let i = 0; i < dpis.length; i++) {
        onProgress?.(`DPI Stage ${i + 1}`, 15 + i * 6);
        await this.setDpiStage(i, dpis[i]);
        if (!this.isSimulated) await delay(20);
      }

      onProgress?.('LED & Active DPI Stage', 52);
      await this.setLighting({
        totalDpiStages: profile.totalDpiStages ?? 6,
        activeDpiStage: profile.activeDpiStage ?? 0,
        dpiLedEffect: profile.dpiLedEffect ?? DpiLedEffect.Steady,
        brightness: profile.brightness ?? 1,
        speed: profile.speed ?? 1,
      });
      if (!this.isSimulated) await delay(25);
      await this.sendCommandBytes([0x08, Math.max(0, Math.min(5, profile.activeDpiStage ?? 0))]);
      if (!this.isSimulated) await delay(20);

      onProgress?.('Sensor Tuning', 64);
      const sensor = profile.sensorSettings || {
        lod: LodLevel.OneMm,
        rippleControl: false,
        angleSnapping: false,
        motionSync: true,
        sensorMode: SensorMode.HP,
      };
      await this.setLod(sensor.lod);
      if (!this.isSimulated) await delay(20);
      await this.setRippleControl(sensor.rippleControl);
      if (!this.isSimulated) await delay(20);
      await this.setAngleSnapping(sensor.angleSnapping);
      if (!this.isSimulated) await delay(20);
      await this.setMotionSync(sensor.motionSync);
      if (!this.isSimulated) await delay(20);
      if (!AulaSC900ProController.isSensorModeLockedByPollingRate(profile.pollingRate)) {
        await this.setSensorMode(sensor.sensorMode);
        if (!this.isSimulated) await delay(20);
      }

      onProgress?.('Performance & Fire Key', 76);
      await this.setDebounceTime(profile.debounceMs ?? 8);
      if (!this.isSimulated) await delay(20);
      const fire = profile.fireKey || { repeatTimes: 3, speedMs: 10 };
      await this.setFireKeyConfig(fire.repeatTimes, fire.speedMs);
      if (!this.isSimulated) await delay(20);
      await this.setSleepTime(profile.sleepSeconds ?? 60);
      if (!this.isSimulated) await delay(20);

      onProgress?.('Buttons & Macros', 86);
      for (let b = 1; b <= 6; b++) {
        const action = mappings[b];
        if (typeof action !== 'number') continue;

        if (isMacroAction(action)) {
          const hwSlot = AulaSC900ProController.buttonToHwIndex(b);
          const boundMacro =
            profile.buttonMacros?.[b] ||
            profile.macros?.find(m => m.id === `hw-macro-slot-${hwSlot}`) ||
            this.macroSlots[hwSlot];
          if (boundMacro) {
            await this.bindButtonToMacro(b, boundMacro);
          } else {
            await this.setButtonMapping(b, buildMacroAction(hwSlot));
          }
        } else {
          await this.setButtonMapping(b, action);
        }
        if (!this.isSimulated) await delay(20);
      }

      onProgress?.(`Profile "${profile.name}" applied`, 100);
    } finally {
      this.busyDepth = Math.max(0, this.busyDepth - 1);
      this.isBusy = this.busyDepth > 0;
    }
  }

  /**
   * Returns active WebHID or Web Bluetooth endpoint details for diagnostics.
   */
  public getDeviceEndpointInfo(): {
    mode: ConnectionMode;
    transport: ConnectionTransport;
    supportsConfig: boolean;
    reportId: number;
    reportLength: number;
    outputReportId: number;
    outputReportLength: number;
    hasOutputReportSupport: boolean;
    collectionsSummary: string;
  } {
    if (this.activeTransport === 'webbluetooth' && this.bleServer?.connected) {
      const bleSummary = [
        this.bleBatteryChar ? '[BLE 0x180F Battery]' : '',
        this.bleVendorId !== null ? '[BLE 0x180A DevInfo]' : '',
        this.bleSupportsConfig ? `[BLE Vendor GATT tx=${this.bleTxChar?.uuid}]` : '[BLE Read-Only GATT (0x1812 blocked)]',
      ]
        .filter(Boolean)
        .join(' ');
      return {
        mode: this.connectionMode,
        transport: this.activeTransport,
        supportsConfig: this.bleSupportsConfig,
        reportId: this.reportId,
        reportLength: this.reportLength,
        outputReportId: this.outputReportId,
        outputReportLength: this.outputReportLength,
        hasOutputReportSupport: this.bleSupportsConfig,
        collectionsSummary: bleSummary,
      };
    }

    const cols = this.device?.collections ?? [];
    const collectionsSummary = cols
      .map(c => {
        const up = `0x${(c.usagePage ?? 0).toString(16)}`;
        const u = `0x${(c.usage ?? 0).toString(16)}`;
        const f = c.featureReports?.length ?? 0;
        const o = c.outputReports?.length ?? 0;
        const i = c.inputReports?.length ?? 0;
        return `[${up}/${u} in:${i} out:${o} feat:${f}]`;
      })
      .join(' ');
    return {
      mode: this.connectionMode,
      transport: this.connectionTransport,
      supportsConfig: this.supportsConfig,
      reportId: this.reportId,
      reportLength: this.reportLength,
      outputReportId: this.outputReportId,
      outputReportLength: this.outputReportLength,
      hasOutputReportSupport: this.hasOutputReportSupport,
      collectionsSummary,
    };
  }

  /**
   * Helper to resolve report ID prefix if OS or browser includes it
   */
  private getPayloadView(view: DataView, expectedEcho: number): { offset: number; view: DataView } {
    let offset = 0;
    if (view.byteLength === this.reportLength + 1 && view.getUint8(0) === this.reportId) {
      offset = 1;
    } else if (view.getUint8(0) !== expectedEcho && view.byteLength > 1 && view.getUint8(1) === expectedEcho) {
      offset = 1;
    }
    return { offset, view };
  }

  public async sendFeatureReport(data: Uint8Array): Promise<void> {
    if (this.isSimulated) {
      console.log('[Simulated WebHID] sendFeatureReport: 0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
      return;
    }
    if (this.activeTransport === 'webbluetooth') {
      if (!this.bleServer?.connected || !this.bleSupportsConfig || !this.bleTxChar) {
        throw new Error(
          'Bluetooth BLE GATT mode is read-only for battery & device info because browsers block 0x1812 HOGP reports. Connect via USB wired, 2.4G dongle, or Bluetooth WebHID to write mouse settings.'
        );
      }
      const targetLen = Math.max(8, this.reportLength || 8);
      let payload = data;
      if (data.length !== targetLen) {
        payload = new Uint8Array(targetLen);
        payload.set(data.subarray(0, targetLen));
      }
      await this.runBleGattOp(async () => {
        const tx = this.bleTxChar!;
        if (tx.properties?.writeWithoutResponse && tx.writeValueWithoutResponse) {
          await tx.writeValueWithoutResponse(payload as unknown as BufferSource);
        } else if (tx.writeValueWithResponse) {
          await tx.writeValueWithResponse(payload as unknown as BufferSource);
        } else if (tx.writeValue) {
          await tx.writeValue(payload as unknown as BufferSource);
        } else {
          throw new Error('Bluetooth vendor TX characteristic is not writable.');
        }
      });
      return;
    }
    if (!this.device || !this.device.opened) {
      throw new Error('Device is not connected or open.');
    }
    if (!this.hidHasVendorConfig && this.activeConnectionMode === 'bluetooth') {
      throw new Error(
        'SC900 Pro firmware does not support settings writes over Bluetooth (0xFF05 interface is not exposed on VID 0x065C / PID 0x2861). Switch to USB Wired or 2.4G Dongle to write settings.'
      );
    }
    const targetLen = Math.max(8, this.reportLength || 8);
    let payload = data;
    if (data.length !== targetLen) {
      payload = new Uint8Array(targetLen);
      payload.set(data.subarray(0, targetLen));
    }
    await this.device.sendFeatureReport(this.reportId, payload as unknown as BufferSource);
  }

  public async sendOutputReport(data: Uint8Array): Promise<void> {
    if (this.isSimulated) {
      console.log('[Simulated WebHID] sendOutputReport: 0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
      return;
    }
    if (this.activeTransport === 'webbluetooth') {
      if (!this.bleServer?.connected || !this.bleSupportsConfig || !this.bleTxChar) {
        throw new Error(
          'Bluetooth BLE GATT mode does not support writing mouse macros because browsers block 0x1812 HOGP reports.'
        );
      }
      const targetLen = Math.max(data.length, this.outputReportLength || 32);
      let payload = data;
      if (data.length !== targetLen) {
        payload = new Uint8Array(targetLen);
        payload.set(data.subarray(0, targetLen));
      }
      await this.runBleGattOp(async () => {
        const tx = this.bleTxChar!;
        if (tx.writeValueWithResponse && !tx.properties?.writeWithoutResponse) {
          await tx.writeValueWithResponse(payload as unknown as BufferSource);
        } else if (tx.writeValueWithoutResponse && tx.properties?.writeWithoutResponse) {
          await tx.writeValueWithoutResponse(payload as unknown as BufferSource);
        } else if (tx.writeValue) {
          await tx.writeValue(payload as unknown as BufferSource);
        } else {
          throw new Error('Bluetooth vendor TX characteristic is not writable.');
        }
      });
      return;
    }
    if (!this.device || !this.device.opened) {
      throw new Error('Device is not connected or open.');
    }
    if (!this.hidHasVendorConfig && this.activeConnectionMode === 'bluetooth') {
      throw new Error(
        'SC900 Pro firmware does not support macro writes over Bluetooth (0xFF05 interface is not exposed). Switch to USB Wired or 2.4G Dongle.'
      );
    }
    const targetLen = Math.max(data.length, this.outputReportLength || 32);
    let payload = data;
    if (data.length !== targetLen) {
      payload = new Uint8Array(targetLen);
      payload.set(data.subarray(0, targetLen));
    }
    const outId = this.outputReportId ?? this.reportId;
    try {
      await this.device.sendReport(outId, payload as unknown as BufferSource);
    } catch (err: any) {
      const msg = err?.message || String(err);
      throw new Error(
        `Macro Output Report failed (reportId=0x${outId.toString(16)}, len=${payload.length}, hasOutput=${this.hasOutputReportSupport}): ${msg}. Ensure the 0xFF05/0x0004 interface is connected and close the official AULA software if running.`
      );
    }
  }

  public async receiveFeatureReport(reportId: number): Promise<DataView> {
    if (this.activeTransport === 'webbluetooth') {
      if (!this.bleServer?.connected || !this.bleSupportsConfig || !this.bleRxChar) {
        throw new Error('Bluetooth BLE GATT mode is read-only (no vendor RX characteristic).');
      }
      const buffered = this.blePendingResponses.shift();
      if (buffered) {
        return new DataView(buffered.buffer, buffered.byteOffset, buffered.byteLength);
      }
      if (this.bleRxChar.properties?.read) {
        return await this.runBleGattOp(() => this.bleRxChar!.readValue());
      }
      const awaited = await new Promise<Uint8Array | null>((resolve) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const waiter = (pkt: Uint8Array) => {
          if (timer) clearTimeout(timer);
          resolve(pkt);
        };
        timer = setTimeout(() => {
          const idx = this.bleResponseWaiters.indexOf(waiter);
          if (idx >= 0) this.bleResponseWaiters.splice(idx, 1);
          resolve(null);
        }, 150);
        this.bleResponseWaiters.push(waiter);
      });
      if (awaited) {
        return new DataView(awaited.buffer, awaited.byteOffset, awaited.byteLength);
      }
      return new DataView(new ArrayBuffer(0));
    }
    if (!this.device || !this.device.opened) {
      throw new Error('Device is not connected or open.');
    }
    return await this.device.receiveFeatureReport(reportId);
  }
}
