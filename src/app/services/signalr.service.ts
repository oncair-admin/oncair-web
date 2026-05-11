import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CourierLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  status: 'online' | 'offline' | 'delivering';
  speed?: number;
  heading?: number;
  activeDestinationLat?: number;
  activeDestinationLon?: number;
}

export interface DashboardUpdate {
  deliveriesCompleted: number;
  inTransitShipments: number;
  pendingPickups: number;
  failedDeliveries: number;
  todayRevenue: number;
  activeRoutes: number;
  activeCouriers: number;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  chatId?: number; // For chat-specific messages
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'support' | 'system';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface GroupMessagePayload {
  from: string;
  groupId: string;
  message: string;
  at: Date;
}

export interface DirectMessagePayload {
  from: string;
  to: string;
  message: string;
  at: Date;
}

export interface DelayAlert {
  courierId: number;
  shipmentId: number;
  message: string;
  timestamp: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection;
  private notificationHubConnection: HubConnection;
  private courierLocationsSubject = new BehaviorSubject<CourierLocation[]>([]);
  private dashboardUpdatesSubject = new BehaviorSubject<DashboardUpdate | null>(null);
  private chatMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private notificationMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private delayAlertsSubject = new BehaviorSubject<DelayAlert | null>(null);
  private currentUserId: string | null = null;
  private currentChatUserId: string | null = null;
  private currentChatId: number | null = null;
  
  public courierLocations$ = this.courierLocationsSubject.asObservable();
  public dashboardUpdates$ = this.dashboardUpdatesSubject.asObservable();
  public chatMessages$ = this.chatMessagesSubject.asObservable();
  public notificationMessages$ = this.notificationMessagesSubject.asObservable();
  public delayAlerts$ = this.delayAlertsSubject.asObservable();

  constructor() {
    console.log('🚀 Initializing SignalR Service...');
    this.initializeConnection();
    this.initializeNotificationHub();
    console.log('✅ SignalR Service initialization complete');
  }

  private initializeConnection(): void {
    // Get JWT token from session storage
    const token = sessionStorage.getItem('token');
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalR.hubUrl, {
        accessTokenFactory: () => token || '',
        skipNegotiation: true,
        transport: 1 // WebSockets
      })
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection started');
        this.setupEventHandlers();
      })
      .catch(err => {
        console.error('Error starting SignalR connection:', err);
      });
  }

  private setupEventHandlers(): void {
    // Courier tracking events
    this.hubConnection.on('LocationUpdate', (data: any) => {
      if (!data) return;

      // Map backend broadcast properties to CourierLocation interface
      // Handles both camelCase and PascalCase from different backend services
      const location: CourierLocation = {
        id: (data.id || data.userId || data.UserId || '').toString(),
        name: data.name || `Courier ${data.userId || data.UserId || data.id}`,
        latitude: data.latitude ?? data.lat ?? data.Lat,
        longitude: data.longitude ?? data.lon ?? data.Lon,
        timestamp: data.timestamp || data.Timestamp ? new Date(data.timestamp || data.Timestamp) : new Date(),
        status: data.status || 'online',
        heading: data.heading || data.Heading,
        speed: data.speed || data.Speed,
        activeDestinationLat: data.activeDestinationLat,
        activeDestinationLon: data.activeDestinationLon
      };
      this.updateCourierLocation(location);
    });

    this.hubConnection.on('CourierStatusUpdate', (courierId: string, status: string) => {
      this.updateCourierStatus(courierId, status);
    });

    this.hubConnection.on('DashboardUpdate', (update: DashboardUpdate) => {
      this.dashboardUpdatesSubject.next(update);
    });

    // Chat events from backend
    this.hubConnection.on('DirectMessage', (payload: DirectMessagePayload) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        senderId: payload.from,
        senderName: payload.from, // You might want to resolve this to actual name
        senderType: 'customer', // Determine based on your logic
        message: payload.message,
        timestamp: new Date(payload.at),
        isRead: false
      };
      const messages = this.chatMessagesSubject.value;
      messages.push(message);
      this.chatMessagesSubject.next([...messages]);
    });

    this.hubConnection.on('GroupMessage', (payload: GroupMessagePayload) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        chatId: parseInt(payload.groupId), // Assuming groupId is the chatId
        senderId: payload.from,
        senderName: payload.from,
        senderType: 'customer',
        message: payload.message,
        timestamp: new Date(payload.at),
        isRead: false
      };
      const messages = this.chatMessagesSubject.value;
      messages.push(message);
      this.chatMessagesSubject.next([...messages]);
    });

    this.hubConnection.on('ReadReceipt', (payload: { messageId: string, by: string, at: Date }) => {
      const messages = this.chatMessagesSubject.value;
      const message = messages.find(m => m.id === payload.messageId);
      if (message) {
        message.isRead = true;
        this.chatMessagesSubject.next([...messages]);
      }
    });

    this.hubConnection.on('Typing', (payload: { fromUserId: string }) => {
      // Handle typing indicator
      console.log('User typing:', payload.fromUserId);
    });

    this.hubConnection.on('ReceiveDelayAlert', (data: any) => {
      console.log('⚠️ Delay Alert received:', data);
      this.delayAlertsSubject.next(data);
    });
  }

  public updateCourierLocation(location: CourierLocation): void {
    const currentLocations = this.courierLocationsSubject.value;
    const existingIndex = currentLocations.findIndex(c => c.id === location.id);
    
    if (existingIndex >= 0) {
      currentLocations[existingIndex] = location;
    } else {
      currentLocations.push(location);
    }
    
    this.courierLocationsSubject.next([...currentLocations]);
  }

  private updateCourierStatus(courierId: string, status: string): void {
    const currentLocations = this.courierLocationsSubject.value;
    const courier = currentLocations.find(c => c.id === courierId);
    
    if (courier) {
      courier.status = status as 'online' | 'offline' | 'delivering';
      this.courierLocationsSubject.next([...currentLocations]);
    }
  }



  // Send message to a specific user
  public sendToUser(toUserId: string, message: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('SendToUser', toUserId, message)
        .catch(err => console.error('Error sending message to user:', err));
    }
  }

  // Send message to multiple users
  public sendToUsers(toUserIds: string[], message: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('SendToUsers', toUserIds, message)
        .catch(err => console.error('Error sending message to users:', err));
    }
  }

  // Join a chat group/room
  public joinGroup(groupId: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('JoinGroup', groupId)
        .catch(err => console.error('Error joining group:', err));
    }
  }

  // Leave a chat group/room
  public leaveGroup(groupId: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('LeaveGroup', groupId)
        .catch(err => console.error('Error leaving group:', err));
    }
  }

  // Send message to a group
  public sendToGroup(groupId: string, message: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('SendToGroup', groupId, message)
        .catch(err => console.error('Error sending message to group:', err));
    }
  }

  // Send message to multiple groups
  public sendToGroups(groupIds: string[], message: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('SendToGroups', groupIds, message)
        .catch(err => console.error('Error sending message to groups:', err));
    }
  }

  // Send typing indicator
  public sendTyping(toUserId: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('Typing', toUserId)
        .catch(err => console.error('Error sending typing indicator:', err));
    }
  }

  // Mark message as read
  public markMessageAsRead(peerUserId: string, messageId: string): void {
    if (this.hubConnection.state === 'Connected') {
      this.hubConnection.invoke('MarkAsRead', peerUserId, messageId)
        .catch(err => console.error('Error marking message as read:', err));
    }
  }

  // Notification Hub Methods
  private initializeNotificationHub(): void {
    console.log('Initializing notification hub connection to:', environment.signalR.notificationHubUrl);
    
    // Get JWT token from session storage
    const token = sessionStorage.getItem('token');
    console.log('🔑 Token for notification hub:', token ? 'Present' : 'Missing');
    
    this.notificationHubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalR.notificationHubUrl, {
        accessTokenFactory: () => {
          console.log('🔑 AccessTokenFactory called, returning token:', token ? 'Present' : 'Missing');
          return token || '';
        }
      })
      .build();

    this.notificationHubConnection.start()
      .then(() => {
        console.log('✅ Connected to notification hub successfully');
        this.setupNotificationEventHandlers();
        // Subscribe to test group for testing
        this.joinTestGroup();
        // Join CustomerService group
        this.joinCustomerServiceGroup();
      })
      .catch(err => {
        console.error('❌ Error starting notification hub connection:', err);
      });
  }

  private setupNotificationEventHandlers(): void {
    console.log('🔧 Setting up notification event handlers');
    
    this.notificationHubConnection.on('ReceiveMessage', (user: string, message: string) => {
      console.log('📨 Received message from notification hub:');
      console.log('  - User:', user);
      console.log('  - Message:', message);
      console.log('  - Current chat user ID:', this.currentChatUserId);
      console.log('  - User ends with C:', user.endsWith('C'));
      
      // Check if the message is for the current chat
      if (this.currentChatUserId && user.endsWith('C')) {
        const customerUserId = user.replace('C', '');
        console.log('  - Customer user ID after removing C:', customerUserId);
        console.log('  - Matches current chat user ID:', customerUserId === this.currentChatUserId);
        
        if (customerUserId === this.currentChatUserId) {
          console.log('✅ Message is for current chat, adding to chat');
          // Add message to current chat
          const chatMessage: ChatMessage = {
            id: Date.now().toString(),
            chatId: this.currentChatId || parseInt(this.currentChatUserId),
            senderId: customerUserId,
            senderName: customerUserId,
            senderType: 'customer',
            message: message,
            timestamp: new Date(),
            isRead: false
          };
          
          console.log('📨 Created chat message with chatId:', chatMessage.chatId, 'Type:', typeof chatMessage.chatId);
          
          const messages = this.chatMessagesSubject.value;
          messages.push(chatMessage);
          this.chatMessagesSubject.next([...messages]);
          
          // Also add to notification messages
          const notificationMessages = this.notificationMessagesSubject.value;
          notificationMessages.push(chatMessage);
          this.notificationMessagesSubject.next([...notificationMessages]);
          
          console.log('✅ Message added to chat successfully');
        } else {
          console.log('❌ Message is not for current chat, ignoring');
        }
      } else if (user === 'Test') {
        console.log('✅ Received test group message, adding to notifications');
        // Add test group message to notification messages
        const testMessage: ChatMessage = {
          id: Date.now().toString(),
          chatId: 0, // Test messages don't have a specific chat ID
          senderId: 'Test',
          senderName: 'Test Group',
          senderType: 'system',
          message: message,
          timestamp: new Date(),
          isRead: false
        };
        
        const notificationMessages = this.notificationMessagesSubject.value;
        notificationMessages.push(testMessage);
        this.notificationMessagesSubject.next([...notificationMessages]);
        console.log('✅ Test message added to notifications');
      } else {
        console.log('❌ Message conditions not met, ignoring');
      }
    });
  }

  // Join CustomerService group
  private joinCustomerServiceGroup(): void {
    if (this.notificationHubConnection.state === 'Connected') {
      console.log('🏢 Joining CustomerService group...');
      this.notificationHubConnection.invoke('JoinGroup', 'CustomerService')
        .then(() => console.log('✅ Successfully joined CustomerService group'))
        .catch(err => console.error('❌ Error joining CustomerService group:', err));
    }
  }

  // Join test group for testing
  private joinTestGroup(): void {
    if (this.notificationHubConnection.state === 'Connected') {
      console.log('🧪 Joining Test group for testing...');
      this.notificationHubConnection.invoke('JoinGroup', 'Test')
        .then(() => console.log('✅ Successfully joined Test group'))
        .catch(err => console.error('❌ Error joining Test group:', err));
    }
  }

  // Register user for notifications (call when opening a chat)
  public registerForChatNotifications(userId: string, chatUserId: string, chatId?: number): void {
    console.log('🔔 Registering for chat notifications:');
    console.log('  - User ID:', userId);
    console.log('  - Chat User ID:', chatUserId);
    console.log('  - Chat ID:', chatId);
    console.log('  - Hub connection state:', this.notificationHubConnection?.state);
    
    this.currentUserId = userId;
    this.currentChatUserId = chatUserId;
    this.currentChatId = chatId || null;
    
    if (this.notificationHubConnection.state === 'Connected') {
      // Register with 'U' suffix for user
      const userRegistrationId = userId + 'U';
      console.log('  - Registration ID:', userRegistrationId);
      
      this.notificationHubConnection.invoke('RegisterUser', userRegistrationId)
        .then(() => {
          console.log('✅ Registered for chat notifications:', userRegistrationId);
        })
        .catch(err => {
          console.error('❌ Error registering for notifications:', err);
        });
    } else {
      console.error('❌ Notification hub not connected, cannot register');
    }
  }

  // Unregister from notifications (call when leaving a chat)
  public unregisterFromChatNotifications(): void {
    console.log('🔕 Unregistering from chat notifications:');
    console.log('  - Current user ID:', this.currentUserId);
    console.log('  - Hub connection state:', this.notificationHubConnection?.state);
    
    if (this.currentUserId && this.notificationHubConnection.state === 'Connected') {
      const userRegistrationId = this.currentUserId + 'U';
      console.log('  - Unregistering ID:', userRegistrationId);
      
      this.notificationHubConnection.invoke('LeaveGroup', userRegistrationId)
        .then(() => {
          console.log('✅ Unregistered from chat notifications');
        })
        .catch(err => {
          console.error('❌ Error unregistering from notifications:', err);
        });
    } else {
      console.log('❌ Cannot unregister - no user ID or hub not connected');
    }
    
    this.currentUserId = null;
    this.currentChatUserId = null;
    console.log('✅ Cleared current user and chat user IDs');
  }

  // Send message to customer via notification hub
  public sendMessageToCustomer(customerUserId: string, message: string): void {
    console.log('📤 Sending message to customer:');
    console.log('  - Customer user ID:', customerUserId);
    console.log('  - Message:', message);
    console.log('  - Hub connection state:', this.notificationHubConnection?.state);
    
    if (this.notificationHubConnection.state === 'Connected') {
      // Send to customer with 'C' suffix
      const targetUserId = customerUserId + 'C';
      console.log('  - Target user ID with C suffix:', targetUserId);
      
      this.notificationHubConnection.invoke('SendToUser', targetUserId, message)
        .then(() => {
          console.log('✅ Message sent to customer successfully:', targetUserId);
        })
        .catch(err => {
          console.error('❌ Error sending message to customer:', err);
        });
    } else {
      console.error('❌ Notification hub not connected, cannot send message');
    }
  }

  // Test method to send message to Test group
  public sendTestMessage(message: string): void {
    console.log('🧪 Sending test message to Test group:');
    console.log('  - Message:', message);
    console.log('  - Hub connection state:', this.notificationHubConnection?.state);
    
    if (this.notificationHubConnection.state === 'Connected') {
      this.notificationHubConnection.invoke('SendToGroup', 'Test', message)
        .then(() => {
          console.log('✅ Test message sent to Test group successfully');
        })
        .catch(err => {
          console.error('❌ Error sending test message to Test group:', err);
        });
    } else {
      console.error('❌ Notification hub not connected, cannot send test message');
    }
  }

  // Test method to send message to specific user
  public sendTestMessageToUser(userId: string, message: string): void {
    console.log('🧪 Sending test message to user:');
    console.log('  - User ID:', userId);
    console.log('  - Message:', message);
    console.log('  - Hub connection state:', this.notificationHubConnection?.state);
    
    if (this.notificationHubConnection.state === 'Connected') {
      this.notificationHubConnection.invoke('SendToUser', userId, message)
        .then(() => {
          console.log('✅ Test message sent to user successfully:', userId);
        })
        .catch(err => {
          console.error('❌ Error sending test message to user:', err);
        });
    } else {
      console.error('❌ Notification hub not connected, cannot send test message');
    }
  }

  public disconnect(): void {
    console.log('🔌 Disconnecting SignalR connections...');
    if (this.hubConnection) {
      this.hubConnection.stop();
      console.log('✅ Local hub connection stopped');
    }
    if (this.notificationHubConnection) {
      this.notificationHubConnection.stop();
      console.log('✅ Notification hub connection stopped');
    }
  }
}
