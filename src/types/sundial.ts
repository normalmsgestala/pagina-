export type SimulationMode = 'earth_rotation' | 'sun_angles';
export type EnvironmentType = 'classroom' | 'courtyard' | 'minimal';
export type CameraPreset = 'room' | 'dial_closeup' | 'top_down' | 'celestial' | 'free';

export interface SundialState {
  mode: SimulationMode;
  latitude: number;
  locationName: string;
  orientationHeading: number; // 0 = True North, in degrees
  tablePositionX: number;
  tablePositionZ: number;

  solarHour: number; // 0 to 24
  isPlaying: boolean;
  playSpeed: number; // 0.5, 1, 2, 5
  dayOfYear: number; // 1 to 365

  hourAngle: number; // H in degrees (-180 to +180)
  solarDeclination: number; // delta in degrees (-23.44 to +23.44)
  solarElevation: number; // in degrees (-90 to +90)
  solarAzimuth: number; // in degrees (0 to 360, 0 = North, 90 = East, 180 = South)

  environment: EnvironmentType;
  showSunRays: boolean;
  showCelestialArcs: boolean;
  showCompassGrid: boolean;
  showShadowPath: boolean;
  showAngleCallouts: boolean;
  showEarthMiniGlobe: boolean;
  activeFace: 'upper' | 'lower';
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  hour: number;
  hourAngle: number;
  declination: number;
  dayOfYear: number;
  dateStr: string;
  expectedFace: 'upper' | 'lower';
}
