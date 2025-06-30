export interface ContentNode {
  id: string;
  title: string;
  content?: string; // HTML content for leaf nodes
  children?: ContentNode[];
  icon?: string; // Icon identifier
  colorHex?: string; // Color in hex format
  parentId?: string;
  isRoot?: boolean;
  order?: number;
  fullPath?: string[]; // Full Firestore path to this node
}

export interface FirestoreContentNode {
  title: string;
  content?: string;
  icon?: string;
  colorHex?: string;
  order?: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ContentStats {
  totalCategories: number;
  totalTopics: number;
  totalContent: number;
  lastUpdated: Date;
}

// OneSignal Configuration Types
export interface OneSignalConfig {
  oneSignalAppId: string;
  oneSignalRestApiKey: string;
  notificationsEnabled: boolean;
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  forceUpdateRequired: boolean;
  minimumAppVersion: string;
  createdAt: string;
  updatedAt: string;
  instructions: string;
}

export interface AppConfig {
  // UI Configuration
  appName: string;
  appTitle: string;
  appDescription: string;
  primaryColor: string;
  logoText: string;
  
  // OneSignal Configuration
  oneSignal: OneSignalConfig;
}

export interface TestNotification {
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface OneSignalResponse {
  success: boolean;
  message?: string;
  data?: any;
} 