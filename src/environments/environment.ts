export const environment = {
  production: false,
  apiUrl: 'https://metalix-backend.onrender.com',
  appName: 'Metalix',
  version: '1.0.0',
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOfflineMode: false
  },
  endpoints: {
    auth: '/auth',
    users: '/users',
    municipalities: '/municipalities',
    zones: '/zones',
    wasteCollectors: '/wasteCollectors',
    wasteCollections: '/wasteCollections',
    rewards: '/rewards',
    rewardTransactions: '/rewardTransactions',
    reports: '/reports',
    metrics: '/metrics',
    alerts: '/alerts',
    rfidCards: '/rfidCards',
    sensorData: '/sensorData'
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  timeouts: {
    apiRequest: 30000,
    upload: 60000
  }
};
