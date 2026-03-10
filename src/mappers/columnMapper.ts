/**
 * Column Mapper Interface and Factory
 * Maps API column names to database column names for different product types
 */

import { ProductType } from '../types/index.js';
import { APIError } from '../utils/errorHandler.js';

/**
 * Column mapper interface for mapping API column names to DB column names
 */
export interface ColumnMapper {
  /**
   * Map API column name to database column name
   * @param apiColumnName Name used in API request
   * @returns Database column name
   * @throws APIError if column doesn't exist
   */
  mapColumn(apiColumnName: string): string;

  /**
   * Get all valid column names for this product type
   */
  getAllColumns(): string[];

  /**
   * Validate that requested columns exist
   */
  validateColumns(apiColumnNames: string[]): boolean;
}

/**
 * Base abstract mapper class
 */
abstract class BaseColumnMapper implements ColumnMapper {
  protected columnMap: Map<string, string>;

  constructor(columns: Record<string, string>) {
    this.columnMap = new Map(Object.entries(columns));
  }

  mapColumn(apiColumnName: string): string {
    const dbColumn = this.columnMap.get(apiColumnName);
    if (!dbColumn) {
      throw new APIError(
        400,
        'INVALID_COLUMN',
        `Column '${apiColumnName}' does not exist for this product type`,
        { validColumns: Array.from(this.columnMap.keys()) }
      );
    }
    return dbColumn;
  }

  getAllColumns(): string[] {
    return Array.from(this.columnMap.keys());
  }

  validateColumns(apiColumnNames: string[]): boolean {
    return apiColumnNames.every((col) => this.columnMap.has(col));
  }
}

/**
 * Column mapper for cars table
 */
class CarColumnMapper extends BaseColumnMapper {
  constructor() {
    super({
      // Basic info
      id: 'id',
      brand: 'brand',
      model: 'model',
      year: 'year',
      price: 'price',
      color: 'color',

      // Engine & Performance
      engine_type: 'engine_type',
      displacement: 'displacement',
      power: 'power',
      torque: 'torque',
      acceleration_0_100: 'acceleration_0_100',
      top_speed: 'top_speed',

      // Transmission & Drivetrain
      transmission_type: 'transmission_type',
      gearbox_type: 'gearbox_type',
      drivetrain: 'drivetrain',

      // Fuel & Efficiency
      fuel_type: 'fuel_type',
      mileage: 'mileage',
      tank_capacity: 'tank_capacity',
      co2_emissions: 'co2_emissions',

      // Dimensions & Capacity
      length: 'length',
      width: 'width',
      height: 'height',
      wheelbase: 'wheelbase',
      ground_clearance: 'ground_clearance',
      weight: 'weight',
      seating_capacity: 'seating_capacity',
      boot_space: 'boot_space',

      // Features
      sunroof: 'sunroof',
      panoramic_sunroof: 'panoramic_sunroof',
      leather_seats: 'leather_seats',
      power_windows: 'power_windows',
      power_steering: 'power_steering',
      power_mirrors: 'power_mirrors',
      ac_type: 'ac_type',
      heater_type: 'heater_type',

      // Safety
      airbags_count: 'airbags_count',
      abs: 'abs',
      traction_control: 'traction_control',
      stability_control: 'stability_control',
      hill_start_assist: 'hill_start_assist',
      hill_descent_control: 'hill_descent_control',

      // Infotainment
      touchscreen_size: 'touchscreen_size',
      apple_carplay: 'apple_carplay',
      android_auto: 'android_auto',
      bluetooth: 'bluetooth',
      aux_input: 'aux_input',
      usb_ports: 'usb_ports',

      // Lighting
      headlamp_type: 'headlamp_type',
      daytime_running_lights: 'daytime_running_lights',
      adaptive_headlamps: 'adaptive_headlamps',

      // Others
      warranty_period: 'warranty_period',
      service_cost_annual: 'service_cost_annual',
      fuel_door_type: 'fuel_door_type',
      spare_wheel: 'spare_wheel',
    });
  }
}

/**
 * Column mapper for mobiles table
 */
class MobileColumnMapper extends BaseColumnMapper {
  constructor() {
    super({
      // Basic info
      id: 'id',
      brand: 'brand',
      model: 'model',
      release_year: 'release_year',
      price: 'price',
      color: 'color',

      // Display
      screen_size: 'screen_size',
      screen_type: 'screen_type',
      resolution: 'resolution',
      brightness: 'brightness',
      refresh_rate: 'refresh_rate',
      aspect_ratio: 'aspect_ratio',

      // Processor & RAM
      processor: 'processor',
      processor_speed: 'processor_speed',
      cpu_cores: 'cpu_cores',
      gpu: 'gpu',
      ram: 'ram',
      max_ram: 'max_ram',

      // Storage
      internal_storage: 'internal_storage',
      expandable_storage: 'expandable_storage',
      max_expandable_storage: 'max_expandable_storage',
      storage_type: 'storage_type',

      // Camera
      rear_camera_mp: 'rear_camera_mp',
      rear_camera_aperture: 'rear_camera_aperture',
      rear_camera_features: 'rear_camera_features',
      front_camera_mp: 'front_camera_mp',
      front_camera_features: 'front_camera_features',
      video_recording: 'video_recording',
      video_fps: 'video_fps',

      // Battery
      battery_capacity: 'battery_capacity',
      battery_type: 'battery_type',
      fast_charging: 'fast_charging',
      charging_wattage: 'charging_wattage',
      fast_charging_time: 'fast_charging_time',
      wireless_charging: 'wireless_charging',

      // Connectivity
      network_bands: 'network_bands',
      cellular_5g: 'cellular_5g',
      wifi: 'wifi',
      wifi_standard: 'wifi_standard',
      bluetooth_version: 'bluetooth_version',
      nfc: 'nfc',
      sim_slots: 'sim_slots',
      sim_type: 'sim_type',

      // Platform & OS
      operating_system: 'operating_system',
      os_version: 'os_version',
      custom_ui: 'custom_ui',

      // Physical
      dimensions: 'dimensions',
      weight: 'weight',
      material: 'material',
      water_resistance: 'water_resistance',
      dust_resistance: 'dust_resistance',

      // Audio
      speaker_count: 'speaker_count',
      speaker_type: 'speaker_type',
      headphone_jack: 'headphone_jack',
      audio_codec: 'audio_codec',

      // Security & Features
      fingerprint_sensor: 'fingerprint_sensor',
      facial_recognition: 'facial_recognition',
      security_patch_frequency: 'security_patch_frequency',
      sar_value: 'sar_value',

      // Warranty
      warranty_period: 'warranty_period',
      manufacturer: 'manufacturer',
    });
  }
}

/**
 * Column mapper for bikes table
 */
class BikeColumnMapper extends BaseColumnMapper {
  constructor() {
    super({
      // Basic info
      id: 'id',
      brand: 'brand',
      model: 'model',
      year: 'year',
      price: 'price',
      color: 'color',

      // Engine
      engine_type: 'engine_type',
      displacement: 'displacement',
      power: 'power',
      torque: 'torque',
      fuel_type: 'fuel_type',
      mileage: 'mileage',

      // Transmission
      transmission_type: 'transmission_type',
      clutch_type: 'clutch_type',

      // Dimensions & Weight
      length: 'length',
      width: 'width',
      height: 'height',
      wheelbase: 'wheelbase',
      ground_clearance: 'ground_clearance',
      weight: 'weight',
      fuel_tank_capacity: 'fuel_tank_capacity',

      // Suspension & Brakes
      front_suspension: 'front_suspension',
      rear_suspension: 'rear_suspension',
      front_brake_type: 'front_brake_type',
      rear_brake_type: 'rear_brake_type',
      abs: 'abs',

      // Tires
      front_tire_size: 'front_tire_size',
      rear_tire_size: 'rear_tire_size',

      // Features
      digital_display: 'digital_display',
      speedometer_type: 'speedometer_type',
      gear_indicator: 'gear_indicator',
      fuel_gauge: 'fuel_gauge',
      trip_meter: 'trip_meter',

      // Lighting
      headlamp_type: 'headlamp_type',
      taillight_type: 'taillight_type',
      daytime_running_lights: 'daytime_running_lights',

      // Comfort & Ergonomics
      seat_height: 'seat_height',
      seat_type: 'seat_type',
      handlebar_type: 'handlebar_type',
      foot_pegs: 'foot_pegs',

      // Safety & Tech
      traction_control: 'traction_control',
      assist_and_slipper_clutch: 'assist_and_slipper_clutch',
      engine_kill_switch: 'engine_kill_switch',
      mobile_app_connectivity: 'mobile_app_connectivity',

      // Warranty
      warranty_period: 'warranty_period',
      service_cost_annual: 'service_cost_annual',
    });
  }
}

/**
 * Column Mapper Factory
 * Returns appropriate mapper instance for product type
 */
export class ColumnMapperFactory {
  private static mappers: Map<ProductType, ColumnMapper> = new Map([
    [ProductType.CAR, new CarColumnMapper()],
    [ProductType.BIKE, new BikeColumnMapper()],
    [ProductType.MOBILE, new MobileColumnMapper()],
  ]);

  /**
   * Get mapper for product type
   */
  static getMapper(productType: ProductType): ColumnMapper {
    const mapper = this.mappers.get(productType);
    if (!mapper) {
      throw new APIError(
        400,
        'INVALID_PRODUCT_TYPE',
        `Product type '${productType}' is not supported`,
        { supportedTypes: Array.from(this.mappers.keys()) }
      );
    }
    return mapper;
  }
}
