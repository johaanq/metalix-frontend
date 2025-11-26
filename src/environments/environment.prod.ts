export const environment = {
  production: true,
  apiUrl: 'http://localhost:8081/api/v1', // TODO: Cambiar a la URL de producción
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
    monitoring: '/monitoring',
    rfidCards: '/rfid-cards'
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
