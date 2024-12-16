import apiClient from '@/lib/axios';

interface Settings {
  site_name?: string;
  site_description?: string;
  default_currency?: string;
  currency_symbol?: string;
  enrollment_fee?: number;
  primary_color?: string;
  secondary_color?: string;
  [key: string]: any;
}

class SettingsService {
  private settings: Settings = {};

  async fetchSettings(): Promise<Settings> {
    try {
      const response = await apiClient.get('/settings');
      this.settings = response.data;
      return this.settings;
    } catch (error) {
      console.error('Failed to fetch settings', error);
      return {};
    }
  }

  async getAllSettings(): Promise<Settings> {
    // If settings are not fetched yet, fetch them first
    if (Object.keys(this.settings).length === 0) {
      await this.fetchSettings();
    }
    return this.settings;
  }

  async getSetting(key: string): Promise<any> {
    // If settings are not fetched yet, fetch them first
    if (Object.keys(this.settings).length === 0) {
      await this.fetchSettings();
    }
    return this.settings[key];
  }

  getDefaultCurrency(): string {
    return this.settings.default_currency || 'USD';
  }

  getEnrollmentFee(): number {
    return this.settings.enrollment_fee || 1000;
  }
}

export const settingsService = new SettingsService();
