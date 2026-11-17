import { beforeEach, describe, expect, it } from 'vitest';
import { SETTINGS_FIXTURE } from '../src/modules/hire-admin/components/settingsFixture.ts';
import {
  SETTINGS_RETENTION_MONTHS,
  SETTINGS_TIMEZONES,
  settingsFormSchema,
  toFormValues
} from '../src/modules/hire-admin/schemas/adminSettings.ts';
import {
  getSettings,
  resetSettingsStore,
  setSettingsLogo,
  updateSettings,
  validateSettingsPatch
} from './settingsMockData.ts';

/** The form schema's verdict on one field, with every other field of the form left valid. */
function schemaAccepts(field: string, value: unknown): boolean {
  const result = settingsFormSchema.safeParse({
    ...toFormValues(SETTINGS_FIXTURE),
    [field]: value
  });
  return result.success || !result.error.issues.some((issue) => issue.path[0] === field);
}

const mockAccepts = (field: string, value: unknown): boolean =>
  !Object.hasOwn(validateSettingsPatch({ [field]: value }).fields, field);

const GOOD = [
  { name: 'a 2-letter name', field: 'platform_name', value: 'AB' },
  { name: 'a 60-letter name', field: 'platform_name', value: 'x'.repeat(60) },
  { name: 'a name with spaces around it', field: 'platform_name', value: '  KitchenX  ' },
  { name: 'no phone', field: 'support_phone', value: '' },
  { name: 'a 10-digit phone', field: 'support_phone', value: '9878543210' },
  { name: 'a phone with +91 and spaces', field: 'support_phone', value: '+91 98785 43210' },
  { name: 'a phone with a leading 0 and a dash', field: 'support_phone', value: '098785-43210' },
  { name: 'an email', field: 'support_email', value: 'support@kitchenx.com' },
  {
    name: 'an email with a tag',
    field: 'support_email',
    value: 'first.last+tag@mail.example.co.in'
  },
  { name: 'UTC', field: 'timezone', value: 'UTC' },
  { name: '1 day', field: 'default_job_expiry_days', value: 1 },
  { name: '365 days', field: 'default_job_expiry_days', value: 365 },
  { name: 'a switch turned off', field: 'archive_inactive_records', value: false }
];

const BAD = [
  { name: 'a 1-letter name', field: 'platform_name', value: 'A' },
  { name: 'a name of only spaces', field: 'platform_name', value: '   ' },
  { name: 'a 61-letter name', field: 'platform_name', value: 'x'.repeat(61) },
  { name: 'a name that is a number', field: 'platform_name', value: 42 },
  { name: 'a phone starting with 5', field: 'support_phone', value: '5878543210' },
  { name: 'a short phone', field: 'support_phone', value: '98785' },
  { name: 'an 11-digit phone', field: 'support_phone', value: '98785432101' },
  { name: 'a phone that is a number', field: 'support_phone', value: 9878543210 },
  { name: 'no email', field: 'support_email', value: '' },
  { name: 'text that is not an email', field: 'support_email', value: 'nope' },
  { name: 'an email without a domain suffix', field: 'support_email', value: 'a@b' },
  { name: 'an email with two dots', field: 'support_email', value: 'a..b@kitchenx.com' },
  { name: 'an email of 121 characters', field: 'support_email', value: `${'a'.repeat(115)}@x.com` },
  { name: 'a timezone that is not offered', field: 'timezone', value: 'Europe/Paris' },
  { name: 'no timezone', field: 'timezone', value: '' },
  { name: '0 days', field: 'default_job_expiry_days', value: 0 },
  { name: '366 days', field: 'default_job_expiry_days', value: 366 },
  { name: 'half a day', field: 'default_job_expiry_days', value: 30.5 },
  { name: 'days as text', field: 'default_job_expiry_days', value: '30' },
  { name: 'months as text', field: 'data_retention_months', value: '24' },
  { name: 'a switch that is text', field: 'multi_business', value: 'yes' },
  { name: 'a switch that is a number', field: 'allow_data_export', value: 1 }
];

describe('settings mock data', () => {
  beforeEach(resetSettingsStore);

  it('starts as the settings of the picture, with the support phone and email seeded', () => {
    expect(getSettings()).toEqual(SETTINGS_FIXTURE);
    expect(getSettings()).toMatchObject({
      support_phone: '9878543210',
      support_email: 'support@kitchenx.com',
      logo_url: null
    });
  });

  it('hands out copies, so changing one does not change the store', () => {
    const copy = getSettings();
    copy.platform_name = 'Changed';

    expect(getSettings().platform_name).toBe('KitchenX Hiring');
  });

  it('changes only the fields it is given, and keeps them', () => {
    const saved = updateSettings({ platform_name: 'Hire Hub', self_registration: true });

    expect(saved).toEqual({
      ...SETTINGS_FIXTURE,
      platform_name: 'Hire Hub',
      self_registration: true
    });
    expect(getSettings()).toEqual(saved);
  });

  it('keeps an uploaded logo next to the other settings, and resets to the defaults', () => {
    updateSettings({ platform_name: 'Hire Hub' });
    const saved = setSettingsLogo('data:image/png;base64,AAAA');

    expect(saved).toEqual({
      ...SETTINGS_FIXTURE,
      platform_name: 'Hire Hub',
      logo_url: 'data:image/png;base64,AAAA'
    });

    resetSettingsStore();
    expect(getSettings()).toEqual(SETTINGS_FIXTURE);
  });
});

describe('settings validation', () => {
  it.each(GOOD)('accepts $name, like the form schema', ({ field, value }) => {
    expect(schemaAccepts(field, value)).toBe(true);
    expect(mockAccepts(field, value)).toBe(true);
  });

  it.each(BAD)('rejects $name, like the form schema', ({ field, value }) => {
    expect(schemaAccepts(field, value)).toBe(false);
    expect(mockAccepts(field, value)).toBe(false);
  });

  it('offers every timezone and retention period the form offers', () => {
    for (const zone of SETTINGS_TIMEZONES) expect(mockAccepts('timezone', zone.value)).toBe(true);
    for (const months of SETTINGS_RETENTION_MONTHS) {
      expect(mockAccepts('data_retention_months', months)).toBe(true);
    }
  });

  it('agrees with the form schema on every retention period from 0 to 72 months', () => {
    for (let months = 0; months <= 72; months += 1) {
      expect(mockAccepts('data_retention_months', months)).toBe(
        schemaAccepts('data_retention_months', months)
      );
    }
  });

  it('agrees with the form schema on every number of days from -1 to 400', () => {
    for (let days = -1; days <= 400; days += 1) {
      expect(mockAccepts('default_job_expiry_days', days)).toBe(
        schemaAccepts('default_job_expiry_days', days)
      );
    }
  });

  it('agrees with the form schema on timezones near the four it offers', () => {
    for (const zone of ['Asia/Tokyo', 'Europe/London', 'America/New_York', 'asia/kolkata', 'utc']) {
      expect(mockAccepts('timezone', zone)).toBe(schemaAccepts('timezone', zone));
    }
  });

  it('trims text, and stores a phone as 10 digits or empty', () => {
    const { patch, fields } = validateSettingsPatch({
      platform_name: '  Hire Hub ',
      support_email: ' help@hirehub.in ',
      support_phone: '+91 98765 43210'
    });

    expect(fields).toEqual({});
    expect(patch).toEqual({
      platform_name: 'Hire Hub',
      support_email: 'help@hirehub.in',
      support_phone: '9876543210'
    });
    expect(validateSettingsPatch({ support_phone: '  ' }).patch).toEqual({ support_phone: '' });
  });

  it('names every bad key, keeps the good ones apart, and gives a reason for each', () => {
    const { patch, fields } = validateSettingsPatch({
      platform_name: 'A',
      support_email: 'nope',
      default_job_expiry_days: 0,
      timezone: 'UTC',
      bogus: 1,
      logo_url: 'https://example.com/logo.png'
    });

    expect(patch).toEqual({ timezone: 'UTC' });
    expect(Object.keys(fields).sort()).toEqual([
      'bogus',
      'default_job_expiry_days',
      'logo_url',
      'platform_name',
      'support_email'
    ]);
    expect(fields.bogus).toBe('Unknown field.');
    expect(fields.logo_url).toMatch(/logo/i);
    expect(fields.support_email).toBe('Enter a valid email address');
  });

  it('treats a key such as constructor or __proto__ as unknown, not as a setting', () => {
    const { patch, fields } = validateSettingsPatch(
      JSON.parse('{"constructor": 1, "__proto__": 2, "toString": 3}')
    );

    expect(patch).toEqual({});
    expect(Object.keys(fields).sort()).toEqual(['__proto__', 'constructor', 'toString']);
  });
});
