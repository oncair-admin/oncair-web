export const environment = {
  production: false,
  apiUrl: 'https://localhost:7067/',
  signalR: {
    hubUrl: 'http://localhost:5230/hubs/chat', // Backend SignalR hub URL
    notificationHubUrl: 'https://mob.acwade.com/chatHub', // Notification hub URL
    // For production, update to your deployed backend URL
    // hubUrl: 'https://your-backend-domain.com/hubs/chat'
  },
};
