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
  private validColumns: Set<string>;

  constructor(columns: Record<string, string>) {
    this.columnMap = new Map(Object.entries(columns));
    this.validColumns = new Set(['name', ...this.columnMap.keys(), ...this.columnMap.values()]);
  }

  mapColumn(apiColumnName: string): string {
    return this.columnMap.get(apiColumnName) ?? apiColumnName;
  }

  getAllColumns(): string[] {
    return Array.from(this.columnMap.keys());
  }

  validateColumns(apiColumnNames: string[]): boolean {
    return apiColumnNames.every((col) => this.validColumns.has(col));
  }
}

/**
 * Column mapper for cars table
 */
class CarColumnMapper extends BaseColumnMapper {
  constructor() {
    super({
      avatar: 'make',
      a: 'make',
      b: 'model',
      c: 'variant',
      d: 'year',
      e: 'price',
      f: 'seats',
      'g.a': 'body_type',
      'g.b': 'body_length',
      'g.c': 'body_width',
      'g.d': 'body_height',
      'g.e': 'body_wheel_base',
      'g.f': 'body_wheel_size',
      'g.g': 'body_ground_clearance',
      'h.a': 'transmission_type',
      'h.b': 'transmission_gears',
      'i.a': 'safety_ncap',
      'i.b': 'safety_airbags',
      'j.a': 'engine_type',
      'j.b': 'engine_displacement',
      'j.c': 'engine_hp',
      'j.d': 'engine_torque',
      'j.e': 'engine_time0to100',
      'j.f.a': 'fuel_type',
      'j.f.b': 'kmpl_city',
      'j.f.c': 'kmpl_highway',
      'j.f.d': 'full_tank_drive_capacity',
      'k.a': 'drivetrain_type',
      'l.a': 'feature_sunroof',
      'l.b': 'feature_ventilated_seats',
      'l.c': 'feature_wireless_charger',
      'l.d': 'feature_reverse_camera',
      'l.e': 'feature_view360',
      'l.f': 'feature_watch_connect',
      'm.a': 'infotainment_available',
      'm.b': 'infotainment_size',
      'm.c': 'infotainment_android',
      'm.d': 'infotainment_apple',
      'n.a': 'aesthetic_noise',
      'n.b': 'aesthetic_leg_space',
      'o.a': 'expense_ppk',
      'o.b': 'expense_insurance',
      'o.c': 'expense_service',
      'o.d': 'expense_service_frequency',
      z: 'url',
    });
  }
}

/**
 * Column mapper for mobiles table
 */
class MobileColumnMapper extends BaseColumnMapper {
  constructor() {
    super({
      avatar: 'make',
      a: 'make',
      b: 'model',
      c: 'variant',
      d: 'year',
      e: 'price',
      f: 'url',
      g: 'value_for_money',
      h: 'after_sales_service',
      'i.a.a': 'battery_life_usage',
      'i.a.b': 'battery_life_standby',
      'i.a.c': 'battery_life_talk_time',
      'i.a.d': 'battery_life_gaming',
      'i.a.e': 'battery_life_video_playback',
      'i.b': 'battery_capacity',
      'i.c': 'battery_charging_wired',
      'i.d': 'battery_charging_wireless',
      'i.e': 'battery_reverse_charging',
      'i.f': 'battery_removable',
      'i.g.a': 'battery_charging_time_wired',
      'i.g.b': 'battery_charging_time_wireless',
      'j.a.a': 'cameras_main_megapixel',
      'j.a.b': 'cameras_main_aperture',
      'j.a.c': 'cameras_main_focal_length',
      'j.a.d': 'cameras_main_optical_zoom',
      'j.a.e': 'cameras_main_digital_zoom',
      'j.b.a': 'cameras_front_megapixel',
      'j.b.b': 'cameras_front_type',
      'j.b.c': 'cameras_front_aperture',
      'j.c': 'cameras_video_recording_capabilities',
      'k.a': 'features_face_unlock',
      'k.b': 'features_fingerprint_sensor',
      'k.c': 'features_always_on_display',
      'k.d': 'features_de_x_support',
      'k.e': 'features_stylus_support',
      'k.f': 'features_fast_charging',
      'k.g': 'features_reverse_charging',
      'k.h': 'features_audio_jack',
      'k.i': 'features_stereo_speakers',
      'k.j': 'features_hi_res_audio',
      'k.k': 'features_gps',
      'k.l': 'features_nfc',
      'k.m': 'features_infrared',
      'k.n': 'features_support5g',
      'k.o': 'features_wifi',
      'k.p': 'features_bluetooth',
      'k.q': 'features_usb',
      'k.r': 'features_water_resistance',
      'k.s': 'features_e_sim',
      'l.a': 'display_type',
      'l.b': 'display_size',
      'l.c.a': 'display_resolution_width',
      'l.c.b': 'display_resolution_height',
      'l.d': 'display_refresh_rate',
      'l.e': 'display_brightness',
      'm.a': 'dimensions_height',
      'm.b': 'dimensions_width',
      'm.c': 'dimensions_thickness',
      'm.d': 'dimensions_weight',
      'n.a': 'platform_os',
      'n.b': 'platform_os_version',
      'o.a': 'memory_ram',
      'o.b': 'memory_storage',
      'o.c': 'memory_expandable',
      'o.d': 'memory_storage_type',
      'p.a': 'connectivity_sim_count',
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
    //[ProductType.BIKE, new BikeColumnMapper()],
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
