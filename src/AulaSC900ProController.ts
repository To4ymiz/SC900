/**
 * AULA SC900 Pro Gaming Mouse WebHID Controller
 * Reverse-engineered from Aula SC900PRO.exe
 */

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
}

export interface LightingConfig {
  totalDpiStages?: number; // Total stages enabled (default 6)
  activeDpiStage: number;  // 0 to 5 (0 = Stage 1, 1 = Stage 2, ..., 5 = Stage 6)
  lightEffect?: LightingEffect;
  dpiLedEffect?: DpiLedEffect;
  brightness?: number;     // 0 to 2 (default 1)
  speed?: number;          // 0 to 2 (default 1)
}

export class AulaSC900ProController {
  public static readonly VENDOR_USAGE_PAGE = 0xff05;
  public static readonly VENDOR_USAGE = 0x0001;

  public static readonly FILTERS: HIDDeviceFilter[] = [
    // PixArt 8K Dongle & Wired (Target device)
    { vendorId: 0x093a, productId: 0x522c },
    { vendorId: 0x093a, productId: 0x622c },
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
  ];

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

  private device: HIDDevice | null = null;
  public reportId: number = 0x09;
  public reportLength: number = 8;
  private isSimulated: boolean = false;
  private realtimeTimer: number | null = null;
  private inputReportHandler: ((e: HIDInputReportEvent) => void) | null = null;
  public onRealtimeUpdate?: (data: {
    activeStageIndex?: number;
    battery?: BatteryStatus;
    rate?: PollingRate;
  }) => void;

  // Simulated state for UI previewing when hardware is absent
  private simBattery: BatteryStatus = { percentage: 90, isCharging: false, statusFlag: 0x02 };
  private simPollingRate: PollingRate = PollingRate.Rate1000Hz;
  private currentPollingRate: PollingRate = PollingRate.Rate1000Hz;
  private currentDebounce: number = 8;
  private currentSleepSeconds: number = 60;
  private currentDpiStage: number = 0;
  private isBusy: boolean = false;
  private buttonMappings: Record<number, ButtonAction> = {
    1: ButtonAction.LeftClick,
    2: ButtonAction.RightClick,
    3: ButtonAction.MiddleClick,
    4: ButtonAction.Forward,
    5: ButtonAction.Backward,
    6: ButtonAction.DpiLoop,
  };

  public get isConnected(): boolean {
    return this.isSimulated || (this.device !== null && this.device.opened);
  }

  public get isSimulation(): boolean {
    return this.isSimulated;
  }

  public get deviceName(): string {
    if (this.isSimulated) return 'AULA SC900 Pro (Demo Mode)';
    return this.device?.productName || 'AULA SC900 Pro';
  }

  public get vendorId(): number | null {
    return this.device?.vendorId ?? null;
  }

  public get productId(): number | null {
    return this.device?.productId ?? null;
  }

  /**
   * Score candidate HID devices to prioritize the MI_03 configuration interface
   */
  private scoreDevice(dev: HIDDevice): number {
    let score = 0;
    const isTargetVid = AulaSC900ProController.FILTERS.some(f => f.vendorId === dev.vendorId);
    if (isTargetVid) score += 100;

    for (const c of dev.collections) {
      // Prioritize vendor configuration page 0xFF05 (MI_03 interface)
      if (c.usagePage === AulaSC900ProController.VENDOR_USAGE_PAGE) {
        score += 1000;
        if (c.usage === AulaSC900ProController.VENDOR_USAGE) {
          score += 200;
        }
        if (c.featureReports?.some(r => r.reportId === 0x09)) {
          score += 500;
        }
      } else if ((c.usagePage ?? 0) >= 0xff00) {
        score += 20;
      }
    }
    return score;
  }

  /**
   * Request user permission and connect via WebHID
   */
  public async requestDevice(allowAny: boolean = false): Promise<boolean> {
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
    return await this.connect(bestDevice);
  }

  /**
   * Connect to previously authorized device automatically
   */
  public async autoConnect(): Promise<boolean> {
    if (!('hid' in navigator)) return false;
    try {
      const paired = await navigator.hid.getDevices();
      if (paired.length === 0) return false;

      // Filter to relevant mouse devices and score them
      const candidates = paired.filter(dev => 
        AulaSC900ProController.FILTERS.some(f => f.vendorId === dev.vendorId)
      );

      if (candidates.length === 0) return false;

      candidates.sort((a, b) => this.scoreDevice(b) - this.scoreDevice(a));
      const best = candidates[0];

      if (this.scoreDevice(best) >= 100) {
        return await this.connect(best);
      }
    } catch (e) {
      console.warn('AutoConnect failed:', e);
    }
    return false;
  }

  /**
   * Connect to an existing permitted HIDDevice
   */
  public async connect(device: HIDDevice): Promise<boolean> {
    this.isSimulated = false;
    this.device = device;

    if (!this.device.opened) {
      await this.device.open();
    }

    this.reportId = 0x09;
    this.reportLength = 8;

    for (const collection of this.device.collections) {
      if (collection.usagePage === AulaSC900ProController.VENDOR_USAGE_PAGE) {
        if (collection.featureReports && collection.featureReports.length > 0) {
          this.reportId = collection.featureReports[0].reportId ?? 0x09;
        }
        break;
      }
    }

    // Attach real-time input report listener
    this.inputReportHandler = (e: HIDInputReportEvent) => {
      this.handleInputReport(e);
    };
    this.device.addEventListener('inputreport', this.inputReportHandler);

    return true;
  }

  /**
   * Enable simulation / demo mode for UI testing without physical device
   */
  public enableSimulation(): void {
    this.isSimulated = true;
    this.device = null;
  }

  /**
   * Disconnect device
   */
  public async disconnect(): Promise<void> {
    this.stopRealtimeMonitor();
    if (this.device) {
      if (this.inputReportHandler) {
        this.device.removeEventListener('inputreport', this.inputReportHandler);
        this.inputReportHandler = null;
      }
      if (this.device.opened) {
        await this.device.close();
      }
    }
    this.device = null;
    this.isSimulated = false;
  }

  /**
   * Handles asynchronous incoming input reports from hardware
   */
  private handleInputReport(e: HIDInputReportEvent): void {
    const { data } = e;
    if (!data || data.byteLength === 0) return;
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
    } else if (cmd === 0x8f && data.byteLength > 4) {
      const rawVal1 = data.getUint8(4);
      const isCharging = rawVal1 === 0xf1;
      this.onRealtimeUpdate?.({
        battery: {
          percentage: isCharging ? 100 : 90,
          isCharging,
          statusFlag: data.getUint8(3),
        }
      });
    }
  }

  /**
   * Starts a lightweight real-time background monitor to sync physical button changes (e.g. physical DPI button press)
   */
  public startRealtimeMonitor(intervalMs: number = 3000): void {
    this.stopRealtimeMonitor();
    this.realtimeTimer = window.setInterval(async () => {
      if (!this.isConnected || this.isSimulation || this.isBusy) return;
      try {
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
      this.isBusy = false;
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
      return { activeStageIndex: this.currentDpiStage, totalStages: 6, dpiLedEffect: DpiLedEffect.Steady, brightness: 1, speed: 1 };
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x8b; // Command 0x8B

    await this.sendFeatureReport(query);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const response = await this.receiveFeatureReport(this.reportId);
    const { offset, view } = this.getPayloadView(response, 0x8b);

    const cmdEcho = view.getUint8(offset + 0);
    if (cmdEcho !== 0x8b) {
      console.warn(`0x8B query echo mismatch: 0x${cmdEcho.toString(16)}`);
      return { activeStageIndex: this.currentDpiStage, totalStages: 6, dpiLedEffect: DpiLedEffect.Steady, brightness: 1, speed: 1 };
    }

    const totalStages = view.byteLength > offset + 1 ? view.getUint8(offset + 1) : 6;
    const activeStageIndex = view.byteLength > offset + 2 ? view.getUint8(offset + 2) : this.currentDpiStage;
    const clampedStage = Math.min(5, Math.max(0, activeStageIndex));
    this.currentDpiStage = clampedStage;
    const dpiLedEffect = view.byteLength > offset + 3 ? view.getUint8(offset + 3) : 0;
    const brightness = view.byteLength > offset + 4 ? view.getUint8(offset + 4) : 1;
    const speed = view.byteLength > offset + 5 ? view.getUint8(offset + 5) : 1;

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
      const defaultDpis = [400, 800, 1600, 3200, 6400, 26000];
      return defaultDpis[stageIndex];
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
    return Math.max(50, Math.min(26000, dpi));
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

    this.isBusy = true;
    try {
      const payload = new Uint8Array(this.reportLength);
      payload[0] = 0x0c; // Command ID: Set DPI for stage
      payload[1] = stageIndex;
      payload[2] = rawValue & 0xff;
      payload[3] = (rawValue >> 8) & 0xff;

      await this.sendFeatureReport(payload);
    } finally {
      this.isBusy = false;
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
   * Protocol Command: 0x0B
   */
  public async setLighting(config: LightingConfig): Promise<void> {
    const totalStages = Math.max(1, Math.min(6, config.totalDpiStages ?? 6));
    const activeStage = Math.max(0, Math.min(5, config.activeDpiStage));
    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x0b; // Command ID: Lighting & Active Stage
    payload[1] = totalStages; // byte 1: Total stages enabled (6)
    payload[2] = activeStage; // byte 2: Active DPI stage index (0 to 5 for Stage 1 to 6)
    payload[3] = config.dpiLedEffect ?? DpiLedEffect.Steady;
    payload[4] = config.brightness ?? 0x01;
    payload[5] = config.speed ?? 0x01;
    payload[6] = 0x01;

    await this.sendFeatureReport(payload);
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
   * Protocol Command: 0x09, Subcommand: 0x02
   */
  public async setSleepTime(sleepSeconds: number): Promise<void> {
    const clamped = Math.max(10, Math.min(3600, sleepSeconds));
    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x09;
    payload[1] = 0x02;
    payload[2] = clamped & 0xff;
    payload[3] = (clamped >> 8) & 0xff;

    await this.sendFeatureReport(payload);
    this.currentSleepSeconds = clamped;
  }

  /**
   * Queries dormancy / auto sleep time in seconds from hardware
   * Protocol Command: 0x89, Subcommand: 0x02
   */
  public async getSleepTime(): Promise<number> {
    if (this.isSimulated) {
      return this.currentSleepSeconds;
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x89;
    query[1] = 0x02;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.sendFeatureReport(query);
        await new Promise((resolve) => setTimeout(resolve, 30));

        const response = await this.receiveFeatureReport(this.reportId);
        const { offset, view } = this.getPayloadView(response, 0x89);

        const cmdEcho = view.getUint8(offset + 0);
        const subEcho = view.byteLength > offset + 1 ? view.getUint8(offset + 1) : 0;

        if (cmdEcho === 0x89 && subEcho === 0x02) {
          if (view.byteLength > offset + 3) {
            const low = view.getUint8(offset + 2);
            const high = view.getUint8(offset + 3);
            const val = (high << 8) | low;
            if (val >= 10 && val <= 3600) {
              this.currentSleepSeconds = val;
              return val;
            }
          }
        }
      } catch (err) {
        console.warn('Sleep time query failed:', err);
      }
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return this.currentSleepSeconds;
  }

  /**
   * Sets button action mapping (Buttons 1 to 6)
   * Protocol Command: 0x06, Byte 1: Button Hardware Index (0..5), Bytes 2..5: 32-bit Little-Endian Function Code
   * Note: Hardware Index 3 = Forward (Button 5), Index 4 = Backward (Button 4)
   * Reverse-engineered from AulaDriver (AulaDevice.cs / DeviceConstants.OpcodeSetButtonMapping)
   */
  public async setButtonMapping(buttonIndex: number, action: ButtonAction): Promise<void> {
    const hwIndex = AulaSC900ProController.buttonToHwIndex(buttonIndex);
    if (hwIndex < 0 || hwIndex > 5) {
      throw new RangeError('Button index must be between 1 and 6 (or hwIndex 0 and 5).');
    }

    const payload = new Uint8Array(this.reportLength);
    payload[0] = 0x06; // OpcodeSetButtonMapping
    payload[1] = hwIndex;
    payload[2] = action & 0xff;
    payload[3] = (action >>> 8) & 0xff;
    payload[4] = (action >>> 16) & 0xff;
    payload[5] = (action >>> 24) & 0xff;
    payload[6] = 0x00;
    payload[7] = 0x00;

    await this.sendFeatureReport(payload);
    const logicalButton = (buttonIndex >= 1 && buttonIndex <= 6)
      ? buttonIndex
      : AulaSC900ProController.hwIndexToButton(hwIndex);
    this.buttonMappings[logicalButton] = action;
  }

  /**
   * Queries hardware mapping for a specific button (Cmd 0x86)
   */
  public async getButtonMapping(buttonIndex: number): Promise<ButtonAction | null> {
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
        const actionCode = view.getUint32(offset + 2, true);

        if (cmdEcho === 0x86 && btnEcho === hwIndex && actionCode !== 0) {
          this.buttonMappings[logicalButton] = actionCode as ButtonAction;
          return actionCode as ButtonAction;
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
  public async getAllButtonMappings(): Promise<Record<number, ButtonAction>> {
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
    const defaults: Array<{ button: number; action: ButtonAction }> = [
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

  public getButtonMappings(): Record<number, ButtonAction> {
    return { ...this.buttonMappings };
  }

  /**
   * Queries battery percentage and charging state
   */
  public async getBatteryStatus(): Promise<BatteryStatus> {
    if (this.isSimulated) {
      return { ...this.simBattery };
    }

    const query = new Uint8Array(this.reportLength);
    query[0] = 0x8f; // Command 0x8F (Battery query)

    await this.sendFeatureReport(query);

    // Sleep 20ms to allow MCU feature report buffer update
    await new Promise((resolve) => setTimeout(resolve, 20));

    const response = await this.receiveFeatureReport(this.reportId);
    const { offset, view } = this.getPayloadView(response, 0x8f);

    const cmdEcho = view.getUint8(offset + 0);
    if (cmdEcho !== 0x8f) {
      console.warn(`Battery response echo mismatch: 0x${cmdEcho.toString(16)}`);
    }

    // Packet breakdown from Aula SC900PRO.exe reverse engineering:
    // [0] = 0x8F (Echo)
    // [1] = 0x03
    // [2] = 0x0C
    // [3] = indicator (1 = low battery level, 2 = discrete levels)
    // [4] = state level byte (0xF0 = level 3 ~90%, 0xFA = level 2 ~50%, 0xF1 = level 4 100%/charging)
    // [5] = state level byte 2
    const indicator = view.byteLength > offset + 3 ? view.getUint8(offset + 3) : 2;
    const rawVal1 = view.byteLength > offset + 4 ? view.getUint8(offset + 4) : 0xf0;
    const rawVal2 = view.byteLength > offset + 5 ? view.getUint8(offset + 5) : 0xf0;

    let percentage = 90;
    let isCharging = false;

    if (rawVal1 === 0xf1 || rawVal2 === 0xf1) {
      percentage = 100;
      isCharging = true;
    } else if (rawVal1 === 0xf0 || rawVal2 === 0xf0) {
      percentage = 90;
      isCharging = false;
    } else if (rawVal1 === 0xfa || rawVal2 === 0xfa) {
      percentage = 50;
      isCharging = false;
    } else if (indicator === 1) {
      percentage = 15;
      isCharging = false;
    } else if (rawVal1 >= 1 && rawVal1 <= 100) {
      percentage = rawVal1;
    } else if (view.getUint8(offset + 1) >= 1 && view.getUint8(offset + 1) <= 100) {
      percentage = view.getUint8(offset + 1);
    }

    return {
      percentage,
      isCharging,
      statusFlag: indicator,
    };
  }

  /**
   * Helper to resolve report ID prefix if OS or browser includes it
   */
  private getPayloadView(view: DataView, expectedEcho: number): { offset: number; view: DataView } {
    let offset = 0;
    if (view.byteLength > 8 && view.getUint8(0) === this.reportId) {
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
    if (!this.device || !this.device.opened) {
      throw new Error('Device is not connected or open.');
    }
    await this.device.sendFeatureReport(this.reportId, data as unknown as BufferSource);
  }

  public async receiveFeatureReport(reportId: number): Promise<DataView> {
    if (!this.device || !this.device.opened) {
      throw new Error('Device is not connected or open.');
    }
    return await this.device.receiveFeatureReport(reportId);
  }
}
