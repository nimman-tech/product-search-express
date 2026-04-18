/**
 * Column Mapper Unit Tests
 * Testing column name mapping for different product types
 */

import { ColumnMapperFactory } from '../columnMapper';
import { ProductType } from '../../types/index';
import { APIError } from '../../utils/errorHandler';

describe('CarColumnMapper', () => {
  const mapper = ColumnMapperFactory.getMapper(ProductType.CAR);

  describe('Valid shorthand key mapping', () => {
    it('should map make/brand shorthand keys', () => {
      expect(mapper.mapColumn('a')).toBe('make');
      expect(mapper.mapColumn('b')).toBe('model');
      expect(mapper.mapColumn('c')).toBe('variant');
      expect(mapper.mapColumn('d')).toBe('year');
      expect(mapper.mapColumn('e')).toBe('price');
      expect(mapper.mapColumn('f')).toBe('seats');
    });

    it('should map body dimension shorthand keys', () => {
      expect(mapper.mapColumn('g.a')).toBe('body_type');
      expect(mapper.mapColumn('g.b')).toBe('body_length');
      expect(mapper.mapColumn('g.c')).toBe('body_width');
      expect(mapper.mapColumn('g.d')).toBe('body_height');
      expect(mapper.mapColumn('g.e')).toBe('body_wheel_base');
    });

    it('should map engine shorthand keys', () => {
      expect(mapper.mapColumn('j.a')).toBe('engine_type');
      expect(mapper.mapColumn('j.b')).toBe('engine_displacement');
      expect(mapper.mapColumn('j.c')).toBe('engine_hp');
      expect(mapper.mapColumn('j.d')).toBe('engine_torque');
      expect(mapper.mapColumn('j.e')).toBe('engine_time0to100');
    });

    it('should map feature shorthand keys', () => {
      expect(mapper.mapColumn('l.a')).toBe('feature_sunroof');
      expect(mapper.mapColumn('l.b')).toBe('feature_ventilated_seats');
      expect(mapper.mapColumn('l.c')).toBe('feature_wireless_charger');
    });

    it('should map safety shorthand keys', () => {
      expect(mapper.mapColumn('i.a')).toBe('safety_ncap');
      expect(mapper.mapColumn('i.b')).toBe('safety_airbags');
    });

    it('should map infotainment shorthand keys', () => {
      expect(mapper.mapColumn('m.a')).toBe('infotainment_available');
      expect(mapper.mapColumn('m.b')).toBe('infotainment_size');
      expect(mapper.mapColumn('m.c')).toBe('infotainment_android');
      expect(mapper.mapColumn('m.d')).toBe('infotainment_apple');
    });
  });

  describe('Unknown column passthrough', () => {
    it('should return input as-is for unknown column', () => {
      expect(mapper.mapColumn('invalid_column')).toBe('invalid_column');
    });

    it('should return input as-is for empty string', () => {
      expect(mapper.mapColumn('')).toBe('');
    });

    it('should return input as-is for case-sensitive mismatch', () => {
      expect(mapper.mapColumn('Brand')).toBe('Brand');
      expect(mapper.mapColumn('BRAND')).toBe('BRAND');
    });

    it('should not throw for any unknown column', () => {
      expect(() => mapper.mapColumn('nonexistent')).not.toThrow();
      expect(() => mapper.mapColumn('fake_column')).not.toThrow();
    });
  });

  describe('getAllColumns', () => {
    it('should return array of shorthand keys', () => {
      const columns = mapper.getAllColumns();
      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should include basic shorthand keys', () => {
      const columns = mapper.getAllColumns();
      expect(columns).toContain('a');
      expect(columns).toContain('b');
      expect(columns).toContain('d');
    });

    it('should include feature shorthand keys', () => {
      const columns = mapper.getAllColumns();
      expect(columns).toContain('l.a');
      expect(columns).toContain('j.a');
    });

    it('should return only API shorthand keys, not DB column names', () => {
      const columns = mapper.getAllColumns();
      expect(columns).not.toContain('make');
      expect(columns).not.toContain('engine_type');
      expect(columns).not.toContain('feature_sunroof');
    });

    it('should have no duplicate entries', () => {
      const columns = mapper.getAllColumns();
      expect(columns.length).toBe(new Set(columns).size);
    });

    it('should return consistent results', () => {
      const columns1 = mapper.getAllColumns();
      const columns2 = mapper.getAllColumns();
      expect(columns1).toEqual(columns2);
    });
  });

  describe('validateColumns', () => {
    it('should validate single valid shorthand key', () => {
      expect(mapper.validateColumns(['a'])).toBe(true);
    });

    it('should validate multiple valid shorthand keys', () => {
      expect(mapper.validateColumns(['a', 'b', 'd'])).toBe(true);
    });

    it('should reject unknown key', () => {
      expect(mapper.validateColumns(['invalid'])).toBe(false);
    });

    it('should reject mixed valid and invalid keys', () => {
      expect(mapper.validateColumns(['a', 'invalid'])).toBe(false);
    });

    it('should validate empty array', () => {
      expect(mapper.validateColumns([])).toBe(true);
    });

    it('should handle duplicate keys', () => {
      expect(mapper.validateColumns(['a', 'a'])).toBe(true);
    });

    it('should accept the reserved "name" column', () => {
      expect(mapper.validateColumns(['name'])).toBe(true);
      expect(mapper.validateColumns(['name', 'a', 'b'])).toBe(true);
    });

    it('should accept raw DB column values as valid', () => {
      // 'make' is a DB value for key 'a'; 'price' for 'e'
      expect(mapper.validateColumns(['make'])).toBe(true);
      expect(mapper.validateColumns(['price', 'model'])).toBe(true);
    });

    it('should reject empty-string column', () => {
      expect(mapper.validateColumns([''])).toBe(false);
    });

    it('should reject case-mismatched key', () => {
      // keys are lowercase only
      expect(mapper.validateColumns(['A'])).toBe(false);
      expect(mapper.validateColumns(['G.A'])).toBe(false);
    });
  });

  describe('boolean normalization', () => {
    it('should identify boolean columns from shorthand keys', () => {
      expect(mapper.isBooleanColumn('l.a')).toBe(true);
      expect(mapper.isBooleanColumn('m.a')).toBe(true);
      expect(mapper.isBooleanColumn('e')).toBe(false);
    });

    it('should identify boolean columns from raw DB column names', () => {
      expect(mapper.isBooleanColumn('feature_sunroof')).toBe(true);
      expect(mapper.isBooleanColumn('price')).toBe(false);
    });

    it('should normalize numeric boolean values', () => {
      expect(mapper.normalizeValue('l.a', 1)).toBe(true);
      expect(mapper.normalizeValue('l.a', 0)).toBe(false);
    });
  });
});

describe('MobileColumnMapper', () => {
  const mapper = ColumnMapperFactory.getMapper(ProductType.MOBILE);

  describe('Valid shorthand key mapping', () => {
    it('should map basic info shorthand keys', () => {
      expect(mapper.mapColumn('a')).toBe('make');
      expect(mapper.mapColumn('b')).toBe('model');
      expect(mapper.mapColumn('e')).toBe('price');
    });

    it('should map avatar key to make', () => {
      expect(mapper.mapColumn('avatar')).toBe('make');
    });

    it('should map display shorthand keys', () => {
      expect(mapper.mapColumn('l.b')).toBe('display_size');
      expect(mapper.mapColumn('l.a')).toBe('display_type');
      expect(mapper.mapColumn('l.d')).toBe('display_refresh_rate');
    });

    it('should map platform shorthand keys', () => {
      expect(mapper.mapColumn('n.a')).toBe('platform_os');
      expect(mapper.mapColumn('n.b')).toBe('platform_os_version');
    });

    it('should map camera shorthand keys', () => {
      expect(mapper.mapColumn('j.a.a')).toBe('cameras_main_megapixel');
      expect(mapper.mapColumn('j.b.a')).toBe('cameras_front_megapixel');
    });

    it('should map battery shorthand keys', () => {
      expect(mapper.mapColumn('i.b')).toBe('battery_capacity');
      expect(mapper.mapColumn('i.c')).toBe('battery_charging_wired');
      expect(mapper.mapColumn('i.d')).toBe('battery_charging_wireless');
    });

    it('should map connectivity shorthand keys', () => {
      expect(mapper.mapColumn('k.n')).toBe('features_support5g');
      expect(mapper.mapColumn('k.o')).toBe('features_wifi');
      expect(mapper.mapColumn('k.l')).toBe('features_nfc');
    });

    it('should map memory shorthand keys', () => {
      expect(mapper.mapColumn('o.a')).toBe('memory_ram');
      expect(mapper.mapColumn('o.b')).toBe('memory_storage');
    });
  });

  describe('Unknown column passthrough', () => {
    it('should return input as-is for unknown column', () => {
      expect(mapper.mapColumn('engine_type')).toBe('engine_type');
    });

    it('should return input as-is and not throw', () => {
      expect(() => mapper.mapColumn('nonsense')).not.toThrow();
      expect(mapper.mapColumn('nonsense')).toBe('nonsense');
    });
  });

  describe('getAllColumns', () => {
    it('should return array of mobile shorthand keys', () => {
      const columns = mapper.getAllColumns();
      expect(columns).toContain('l.b');
      expect(columns).toContain('i.b');
      expect(columns).toContain('n.a');
    });

    it('should return only API shorthand keys, not DB column names', () => {
      const columns = mapper.getAllColumns();
      // DB-side names must not appear in the key list
      expect(columns).not.toContain('battery_capacity');
      expect(columns).not.toContain('platform_os');
      expect(columns).not.toContain('make');
    });

    it('should have no duplicate entries', () => {
      const columns = mapper.getAllColumns();
      expect(columns.length).toBe(new Set(columns).size);
    });
  });

  describe('validateColumns', () => {
    it('should validate mobile-specific shorthand keys', () => {
      expect(mapper.validateColumns(['l.b', 'i.b'])).toBe(true);
    });

    it('should reject car-specific shorthand keys not present in mobile map', () => {
      expect(mapper.validateColumns(['l.a', 'engine_type'])).toBe(false);
    });

    it('should accept the reserved "name" column', () => {
      expect(mapper.validateColumns(['name'])).toBe(true);
      expect(mapper.validateColumns(['name', 'l.b'])).toBe(true);
    });

    it('should accept raw DB column values as valid', () => {
      expect(mapper.validateColumns(['battery_capacity'])).toBe(true);
      expect(mapper.validateColumns(['platform_os', 'make'])).toBe(true);
    });

    it('should reject empty-string column', () => {
      expect(mapper.validateColumns([''])).toBe(false);
    });
  });

  describe('boolean normalization', () => {
    it('should identify mobile boolean columns', () => {
      expect(mapper.isBooleanColumn('i.e')).toBe(true);
      expect(mapper.isBooleanColumn('k.n')).toBe(true);
      expect(mapper.isBooleanColumn('i.d')).toBe(false);
    });

    it('should normalize string boolean values', () => {
      expect(mapper.normalizeValue('k.n', '1')).toBe(true);
      expect(mapper.normalizeValue('k.n', '0')).toBe(false);
      expect(mapper.normalizeValue('i.d', '1')).toBe('1');
    });
  });
});

describe('ColumnMapperFactory', () => {
  describe('getMapper', () => {
    it('should return CarColumnMapper for CAR type', () => {
      const mapper = ColumnMapperFactory.getMapper(ProductType.CAR);
      expect(mapper.mapColumn('a')).toBe('make');
      expect(mapper.getAllColumns()).toContain('l.a');
    });

    it('should return MobileColumnMapper for MOBILE type', () => {
      const mapper = ColumnMapperFactory.getMapper(ProductType.MOBILE);
      expect(mapper.mapColumn('n.a')).toBe('platform_os');
      expect(mapper.getAllColumns()).toContain('l.b');
    });

    it('should return consistent mapper instances', () => {
      const mapper1 = ColumnMapperFactory.getMapper(ProductType.CAR);
      const mapper2 = ColumnMapperFactory.getMapper(ProductType.CAR);
      expect(mapper1.mapColumn('a')).toBe(mapper2.mapColumn('a'));
    });

    it('should return the same singleton instance on repeated calls', () => {
      const mapper1 = ColumnMapperFactory.getMapper(ProductType.CAR);
      const mapper2 = ColumnMapperFactory.getMapper(ProductType.CAR);
      expect(mapper1).toBe(mapper2);
    });

    it('should handle all supported product types', () => {
      const types = [ProductType.CAR, ProductType.MOBILE];
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

    it('should set HTTP 400 status on invalid product type error', () => {
      try {
        ColumnMapperFactory.getMapper('bad_type' as ProductType);
        fail('Should have thrown error');
      } catch (error: unknown) {
        const err = error as APIError;
        expect(err.statusCode).toBe(400);
      }
    });
  });

  describe('Product Type Isolation', () => {
    it('should have separate column spaces for each product type', () => {
      const carMapper = ColumnMapperFactory.getMapper(ProductType.CAR);
      const mobileMapper = ColumnMapperFactory.getMapper(ProductType.MOBILE);

      const carCols = new Set(carMapper.getAllColumns());
      const mobileCols = new Set(mobileMapper.getAllColumns());

      // Car-specific: feature_sunroof mapped via l.a
      expect(carCols.has('l.a')).toBe(true);
      // Mobile-specific: display_size mapped via l.b — also exists in car map as body_height
      // Use a clearly mobile-only key: k.n (features_support5g)
      expect(mobileCols.has('k.n')).toBe(true);
      expect(carCols.has('k.n')).toBe(false);

      // Fuel shorthand exists in car but not mobile
      expect(carCols.has('j.f.a')).toBe(true);
      expect(mobileCols.has('j.f.a')).toBe(false);
    });
  });
});
