export const environment = {
  production: true,
  apiUrl: 'https://api.metalix.com',
  appName: 'Metalix',
  version: '1.0.0',
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOfflineMode: true
  },
  endpoints: {
    auth: '/api/v1/auth',
    users: '/api/v1/users',
    municipalities: '/api/v1/municipalities',
    zones: '/api/v1/zones',
    wasteCollectors: '/api/v1/waste-collectors',
    wasteCollections: '/api/v1/waste-collections',
    rewards: '/api/v1/rewards',
    rewardTransactions: '/api/v1/reward-transactions',
    reports: '/api/v1/reports',
    metrics: '/api/v1/metrics',
    alerts: '/api/v1/alerts',
    rfidCards: '/api/v1/rfid-cards',
    sensorData: '/api/v1/sensor-data'
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
