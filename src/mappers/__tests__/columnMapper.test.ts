/**
 * Column Mapper Unit Tests
 * Testing column name mapping for different product types
 */

import { ColumnMapperFactory } from '../columnMapper';
import { ProductType } from '../../types/index';
import { APIError } from '../../utils/errorHandler';

describe('CarColumnMapper', () => {
  const mapper = ColumnMapperFactory.getMapper(ProductType.CAR);

  describe('Valid columns', () => {
    it('should map basic info columns', () => {
      expect(mapper.mapColumn('id')).toBe('id');
      expect(mapper.mapColumn('brand')).toBe('brand');
      expect(mapper.mapColumn('model')).toBe('model');
      expect(mapper.mapColumn('year')).toBe('year');
      expect(mapper.mapColumn('price')).toBe('price');
      expect(mapper.mapColumn('color')).toBe('color');
    });

    it('should map engine and performance columns', () => {
      expect(mapper.mapColumn('engine_type')).toBe('engine_type');
      expect(mapper.mapColumn('displacement')).toBe('displacement');
      expect(mapper.mapColumn('power')).toBe('power');
      expect(mapper.mapColumn('torque')).toBe('torque');
      expect(mapper.mapColumn('top_speed')).toBe('top_speed');
    });

    it('should map dimension columns', () => {
      expect(mapper.mapColumn('length')).toBe('length');
      expect(mapper.mapColumn('width')).toBe('width');
      expect(mapper.mapColumn('height')).toBe('height');
      expect(mapper.mapColumn('weight')).toBe('weight');
    });

    it('should map feature columns', () => {
      expect(mapper.mapColumn('sunroof')).toBe('sunroof');
      expect(mapper.mapColumn('leather_seats')).toBe('leather_seats');
      expect(mapper.mapColumn('bluetooth')).toBe('bluetooth');
    });

    it('should map safety columns', () => {
      expect(mapper.mapColumn('airbags_count')).toBe('airbags_count');
      expect(mapper.mapColumn('abs')).toBe('abs');
      expect(mapper.mapColumn('traction_control')).toBe('traction_control');
    });

    it('should map infotainment columns', () => {
      expect(mapper.mapColumn('touchscreen_size')).toBe('touchscreen_size');
      expect(mapper.mapColumn('apple_carplay')).toBe('apple_carplay');
      expect(mapper.mapColumn('android_auto')).toBe('android_auto');
    });
  });

  describe('Invalid columns', () => {
    it('should throw error for non-existent column', () => {
      expect(() => mapper.mapColumn('invalid_column')).toThrow(APIError);
    });

    it('should throw error with correct status code', () => {
      try {
        mapper.mapColumn('fake_column');
        fail('Should have thrown error');
      } catch (error: unknown) {
        const err = error as APIError;
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('INVALID_COLUMN');
      }
    });

    it('should include valid columns in error details', () => {
      try {
        mapper.mapColumn('nonexistent');
        fail('Should have thrown error');
      } catch (error: unknown) {
        const err = error as APIError;
        expect(err.details).toHaveProperty('validColumns');
        expect((err.details as any).validColumns).toBeInstanceOf(Array);
      }
    });

    it('should throw error for empty string', () => {
      expect(() => mapper.mapColumn('')).toThrow(APIError);
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => mapper.mapColumn('Brand')).toThrow(APIError);
      expect(() => mapper.mapColumn('BRAND')).toThrow(APIError);
    });
  });

  describe('getAllColumns', () => {
    it('should return array of columns', () => {
      const columns = mapper.getAllColumns();
      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should include basic columns', () => {
      const columns = mapper.getAllColumns();
      expect(columns).toContain('id');
      expect(columns).toContain('brand');
      expect(columns).toContain('model');
    });

    it('should return consistent results', () => {
      const columns1 = mapper.getAllColumns();
      const columns2 = mapper.getAllColumns();
      expect(columns1).toEqual(columns2);
    });
  });

  describe('validateColumns', () => {
    it('should validate single valid column', () => {
      expect(mapper.validateColumns(['brand'])).toBe(true);
    });

    it('should validate multiple valid columns', () => {
      expect(mapper.validateColumns(['brand', 'model', 'year'])).toBe(true);
    });

    it('should reject invalid column', () => {
      expect(mapper.validateColumns(['invalid'])).toBe(false);
    });

    it('should reject mixed valid and invalid columns', () => {
      expect(mapper.validateColumns(['brand', 'invalid'])).toBe(false);
    });

    it('should validate empty array', () => {
      expect(mapper.validateColumns([])).toBe(true);
    });

    it('should handle duplicate columns', () => {
      expect(mapper.validateColumns(['brand', 'brand'])).toBe(true);
    });
  });
});

describe('MobileColumnMapper', () => {
  const mapper = ColumnMapperFactory.getMapper(ProductType.MOBILE);

  describe('Valid columns', () => {
    it('should map basic info columns', () => {
      expect(mapper.mapColumn('brand')).toBe('brand');
      expect(mapper.mapColumn('model')).toBe('model');
      expect(mapper.mapColumn('price')).toBe('price');
    });

    it('should map display columns', () => {
      expect(mapper.mapColumn('screen_size')).toBe('screen_size');
      expect(mapper.mapColumn('screen_type')).toBe('screen_type');
      expect(mapper.mapColumn('refresh_rate')).toBe('refresh_rate');
    });

    it('should map processor columns', () => {
      expect(mapper.mapColumn('processor')).toBe('processor');
      expect(mapper.mapColumn('ram')).toBe('ram');
      expect(mapper.mapColumn('cpu_cores')).toBe('cpu_cores');
    });

    it('should map camera columns', () => {
      expect(mapper.mapColumn('rear_camera_mp')).toBe('rear_camera_mp');
      expect(mapper.mapColumn('front_camera_mp')).toBe('front_camera_mp');
    });

    it('should map battery columns', () => {
      expect(mapper.mapColumn('battery_capacity')).toBe('battery_capacity');
      expect(mapper.mapColumn('fast_charging')).toBe('fast_charging');
      expect(mapper.mapColumn('wireless_charging')).toBe('wireless_charging');
    });

    it('should map connectivity columns', () => {
      expect(mapper.mapColumn('cellular_5g')).toBe('cellular_5g');
      expect(mapper.mapColumn('wifi')).toBe('wifi');
      expect(mapper.mapColumn('nfc')).toBe('nfc');
    });
  });

  describe('Invalid columns', () => {
    it('should throw error for non-existent column', () => {
      expect(() => mapper.mapColumn('engine_type')).toThrow(APIError);
    });

    it('should throw error with correct code', () => {
      try {
        mapper.mapColumn('nonsense');
        fail('Should have thrown error');
      } catch (error: unknown) {
        const err = error as APIError;
        expect(err.code).toBe('INVALID_COLUMN');
      }
    });
  });

  describe('getAllColumns', () => {
    it('should return array of mobile columns', () => {
      const columns = mapper.getAllColumns();
      expect(columns).toContain('screen_size');
      expect(columns).toContain('battery_capacity');
      expect(columns).toContain('processor');
    });
  });

  describe('validateColumns', () => {
    it('should validate mobile-specific columns', () => {
      expect(mapper.validateColumns(['screen_size', 'battery_capacity'])).toBe(true);
    });

    it('should reject car-specific columns', () => {
      expect(mapper.validateColumns(['engine_type'])).toBe(false);
    });
  });
});

describe('BikeColumnMapper', () => {
  const mapper = ColumnMapperFactory.getMapper(ProductType.BIKE);

  describe('Valid columns', () => {
    it('should map basic info columns', () => {
      expect(mapper.mapColumn('brand')).toBe('brand');
      expect(mapper.mapColumn('model')).toBe('model');
      expect(mapper.mapColumn('year')).toBe('year');
      expect(mapper.mapColumn('price')).toBe('price');
    });

    it('should map engine columns', () => {
      expect(mapper.mapColumn('engine_type')).toBe('engine_type');
      expect(mapper.mapColumn('displacement')).toBe('displacement');
      expect(mapper.mapColumn('power')).toBe('power');
      expect(mapper.mapColumn('torque')).toBe('torque');
    });

    it('should map suspension and brake columns', () => {
      expect(mapper.mapColumn('front_suspension')).toBe('front_suspension');
      expect(mapper.mapColumn('rear_suspension')).toBe('rear_suspension');
      expect(mapper.mapColumn('front_brake_type')).toBe('front_brake_type');
      expect(mapper.mapColumn('abs')).toBe('abs');
    });

    it('should map comfort columns', () => {
      expect(mapper.mapColumn('seat_height')).toBe('seat_height');
      expect(mapper.mapColumn('seat_type')).toBe('seat_type');
    });
  });

  describe('Invalid columns', () => {
    it('should throw error for car-specific columns', () => {
      expect(() => mapper.mapColumn('panoramic_sunroof')).toThrow(APIError);
    });

    it('should throw error for mobile-specific columns', () => {
      expect(() => mapper.mapColumn('screen_size')).toThrow(APIError);
    });
  });

  describe('getAllColumns', () => {
    it('should return bike-specific columns', () => {
      const columns = mapper.getAllColumns();
      expect(columns).toContain('engine_type');
      expect(columns).toContain('front_suspension');
      expect(columns).toContain('seat_height');
    });

    it('should not include car-specific columns', () => {
      const columns = mapper.getAllColumns();
      expect(columns).not.toContain('panoramic_sunroof');
      expect(columns).not.toContain('touchscreen_size');
    });
  });

  describe('validateColumns', () => {
    it('should validate bike-specific columns', () => {
      expect(mapper.validateColumns(['engine_type', 'displacement'])).toBe(true);
    });

    it('should reject mobile columns', () => {
      expect(mapper.validateColumns(['processor'])).toBe(false);
    });
  });
});

describe('ColumnMapperFactory', () => {
  describe('getMapper', () => {
    it('should return CarColumnMapper for CAR type', () => {
      const mapper = ColumnMapperFactory.getMapper(ProductType.CAR);
      expect(mapper.mapColumn('brand')).toBe('brand');
      expect(mapper.getAllColumns()).toContain('sunroof');
    });

    it('should return MobileColumnMapper for MOBILE type', () => {
      const mapper = ColumnMapperFactory.getMapper(ProductType.MOBILE);
      expect(mapper.mapColumn('processor')).toBe('processor');
      expect(mapper.getAllColumns()).toContain('screen_size');
    });

    it('should return BikeColumnMapper for BIKE type', () => {
      const mapper = ColumnMapperFactory.getMapper(ProductType.BIKE);
      expect(mapper.mapColumn('engine_type')).toBe('engine_type');
      expect(mapper.getAllColumns()).toContain('front_suspension');
    });

    it('should return consistent mapper instances', () => {
      const mapper1 = ColumnMapperFactory.getMapper(ProductType.CAR);
      const mapper2 = ColumnMapperFactory.getMapper(ProductType.CAR);
      expect(mapper1.mapColumn('brand')).toBe(mapper2.mapColumn('brand'));
    });

    it('should handle all supported product types', () => {
      const types = [ProductType.CAR, ProductType.BIKE, ProductType.MOBILE];
      types.forEach((type) => {
        expect(() => ColumnMapperFactory.getMapper(type)).not.toThrow();
      });
    });

    it('should throw error for invalid product type', () => {
      expect(() => ColumnMapperFactory.getMapper('invalid' as ProductType)).toThrow(APIError);
    });

    it('should include supported types in error', () => {
      try {
        ColumnMapperFactory.getMapper('anything' as ProductType);
        fail('Should have thrown error');
      } catch (error: unknown) {
        const err = error as APIError;
        expect(err.code).toBe('INVALID_PRODUCT_TYPE');
        expect(err.details).toHaveProperty('supportedTypes');
      }
    });
  });

  describe('Product Type Isolation', () => {
    it('should have separate column spaces for each product type', () => {
      const carMapper = ColumnMapperFactory.getMapper(ProductType.CAR);
      const bikeMapper = ColumnMapperFactory.getMapper(ProductType.BIKE);
      const mobileMapper = ColumnMapperFactory.getMapper(ProductType.MOBILE);

      const carCols = new Set(carMapper.getAllColumns());
      const bikeCols = new Set(bikeMapper.getAllColumns());
      const mobileCols = new Set(mobileMapper.getAllColumns());

      // Test some columns are unique to each type
      expect(carCols.has('sunroof')).toBe(true);
      expect(bikeCols.has('sunroof')).toBe(false);
      expect(mobileCols.has('sunroof')).toBe(false);

      expect(mobileCols.has('screen_size')).toBe(true);
      expect(carCols.has('screen_size')).toBe(false);
      expect(bikeCols.has('screen_size')).toBe(false);
    });
  });
});
