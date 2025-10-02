export const environment = {
  production: true,
  apiUrl: 'https://metalix-backend.onrender.com/api/v1',
  appName: 'Metalix',
  version: '1.0.0',
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOfflineMode: true
  },
  endpoints: {
    auth: '/auth',
    users: '/users',
    municipalities: '/municipalities',
    zones: '/zones',
    wasteCollectors: '/waste-collectors',
    wasteCollections: '/waste-collections',
    rewards: '/rewards',
    rewardTransactions: '/reward-transactions',
    reports: '/monitoring/reports',
    metrics: '/monitoring/metrics',
    alerts: '/monitoring/alerts',
    rfidCards: '/rfid-cards',
    sensorData: '/sensor-data'
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
