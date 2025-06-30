import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { OneSignalConfig, TestNotification, OneSignalResponse } from '../types';

const APP_CONFIG_COLLECTION = 'app_config';
const MAIN_CONFIG_DOC = 'main_config';

export class AppConfigService {
  // Get OneSignal configuration from Firestore
  async getOneSignalConfig(): Promise<OneSignalConfig | null> {
    try {
      console.log('🔍 Fetching OneSignal configuration from Firestore...');
      
      const docRef = doc(db, APP_CONFIG_COLLECTION, MAIN_CONFIG_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ OneSignal config loaded:', data);
        return data as OneSignalConfig;
      } else {
        console.log('📭 No OneSignal configuration found, returning defaults');
        return this.getDefaultOneSignalConfig();
      }
    } catch (error) {
      console.error('❌ Error fetching OneSignal config:', error);
      throw error;
    }
  }

  // Save OneSignal configuration to Firestore
  async saveOneSignalConfig(config: Partial<OneSignalConfig>): Promise<OneSignalResponse> {
    try {
      console.log('💾 Saving OneSignal configuration to Firestore...', config);
      
      const docRef = doc(db, APP_CONFIG_COLLECTION, MAIN_CONFIG_DOC);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      const now = new Date().toISOString();
      
      if (docSnap.exists()) {
        // Update existing document
        const updateData = {
          ...config,
          updatedAt: now,
        };
        await updateDoc(docRef, updateData);
        console.log('✅ OneSignal config updated');
      } else {
        // Create new document with defaults
        const newConfig: OneSignalConfig = {
          ...this.getDefaultOneSignalConfig(),
          ...config,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(docRef, newConfig);
        console.log('✅ OneSignal config created');
      }
      
      return {
        success: true,
        message: 'OneSignal configuration saved successfully',
      };
    } catch (error) {
      console.error('❌ Error saving OneSignal config:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Send test notification via OneSignal API
  async sendTestNotification(notification: TestNotification): Promise<OneSignalResponse> {
    try {
      console.log('📨 Sending test notification...', notification);
      
      // Get current OneSignal configuration
      const config = await this.getOneSignalConfig();
      
      if (!config || !config.oneSignalAppId || !config.oneSignalRestApiKey) {
        return {
          success: false,
          message: 'OneSignal App ID or REST API Key not configured. Please configure OneSignal settings first.',
        };
      }
      
      if (!config.notificationsEnabled) {
        return {
          success: false,
          message: 'Push notifications are currently disabled. Please enable them in settings.',
        };
      }
      
      // Prepare OneSignal API payload
      const oneSignalPayload = {
        app_id: config.oneSignalAppId,
        included_segments: ['All'],
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || { test: true, timestamp: new Date().toISOString() },
      };
      
      console.log('🚀 Sending to OneSignal API...', oneSignalPayload);
      
      // Send notification via OneSignal API
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${config.oneSignalRestApiKey}`,
        },
        body: JSON.stringify(oneSignalPayload),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('✅ Test notification sent successfully:', responseData);
        return {
          success: true,
          message: `Test notification sent successfully! Recipients: ${responseData.recipients || 'Unknown'}`,
          data: responseData,
        };
      } else {
        console.error('❌ OneSignal API error:', responseData);
        return {
          success: false,
          message: responseData.errors ? responseData.errors.join(', ') : 'Failed to send notification',
          data: responseData,
        };
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Send targeted notification to specific segments or users
  async sendTargetedNotification(
    notification: TestNotification,
    options: {
      segments?: string[];
      userIds?: string[];
      tags?: Array<{ field: string; key: string; relation: string; value: string }>;
    }
  ): Promise<OneSignalResponse> {
    try {
      console.log('🎯 Sending targeted notification...', { notification, options });
      
      const config = await this.getOneSignalConfig();
      
      if (!config || !config.oneSignalAppId || !config.oneSignalRestApiKey) {
        return {
          success: false,
          message: 'OneSignal not configured',
        };
      }
      
      const oneSignalPayload: any = {
        app_id: config.oneSignalAppId,
        headings: { en: notification.title },
        contents: { en: notification.message },
        data: notification.data || {},
      };
      
      // Set targeting options
      if (options.segments && options.segments.length > 0) {
        oneSignalPayload.included_segments = options.segments;
      } else if (options.userIds && options.userIds.length > 0) {
        oneSignalPayload.include_external_user_ids = options.userIds;
      } else if (options.tags && options.tags.length > 0) {
        oneSignalPayload.filters = options.tags;
      } else {
        oneSignalPayload.included_segments = ['All'];
      }
      
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${config.oneSignalRestApiKey}`,
        },
        body: JSON.stringify(oneSignalPayload),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'Targeted notification sent successfully',
          data: responseData,
        };
      } else {
        return {
          success: false,
          message: responseData.errors ? responseData.errors.join(', ') : 'Failed to send notification',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error occurred',
      };
    }
  }

  // Get default OneSignal configuration
  private getDefaultOneSignalConfig(): OneSignalConfig {
    const now = new Date().toISOString();
    return {
      oneSignalAppId: '',
      oneSignalRestApiKey: '',
      notificationsEnabled: true,
      appName: 'Learning App',
      appVersion: '1.0.0',
      maintenanceMode: false,
      forceUpdateRequired: false,
      minimumAppVersion: '1.0.0',
      createdAt: now,
      updatedAt: now,
      instructions: 'Configure OneSignal App ID and REST API Key from your admin panel',
    };
  }

  // Validate OneSignal configuration
  async validateOneSignalConfig(appId: string, restApiKey: string): Promise<OneSignalResponse> {
    try {
      console.log('🔍 Validating OneSignal configuration...');
      
      if (!appId || !restApiKey) {
        return {
          success: false,
          message: 'App ID and REST API Key are required',
        };
      }
      
      // Test the credentials by trying to get app info
      const response = await fetch(`https://onesignal.com/api/v1/apps/${appId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${restApiKey}`,
        },
      });
      
      if (response.ok) {
        const appData = await response.json();
        return {
          success: true,
          message: `OneSignal app validated: ${appData.name}`,
          data: appData,
        };
      } else {
        return {
          success: false,
          message: 'Invalid OneSignal credentials',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to validate OneSignal configuration',
      };
    }
  }
}

export const appConfigService = new AppConfigService(); 