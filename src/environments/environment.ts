export const environment = {
  production: false,
  apiUrl: 'http://173.208.167.153:4443/',
  signalR: {
    hubUrl: 'http://localhost:5230/hubs/chat', // Backend SignalR hub URL
    notificationHubUrl: 'https://mob.acwade.com/chatHub', // Notification hub URL
    // For production, update to your deployed backend URL
    // hubUrl: 'https://your-backend-domain.com/hubs/chat'
  },
};
