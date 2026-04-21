/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiController } from './CarRental.serviceEnd';

export interface ChatMaster {
  chatId: number;
  chatDate: Date;
  customerId: number;
  userId?: number;
  isClosed: boolean;
  chatType: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
  };
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount?: number;
}

export interface ChatDetail {
  id: number | string;
  chatId: number;
  chatDate: Date;
  message: string;
  senderId?: number;
  senderName?: string;
  isFromCustomer?: boolean;
  attachmentUrl?: string;
  attachmentType?: string;
  frTo?: number; // 0 = sent by me, 1 = received from customer
  status?: string;
  photo?: string;
  mimeType?: string;
}

// Shape returned by backend: /api/Conversation/GetAllChat
export interface BackendChatItem {
  customerId: number;
  customerName: string;
  userId: number;
  chatMasterDate: string; // ISO date
  id: number; // message id
  chatId: number;
  chatDate: string; // ISO date
  message: string;
  photo?: string | null;
}

export interface SendMessageRequest {
  chatId: number;
  message: string;
  attachment?: File;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // ========================================
  // MOCK DATA FOR TESTING - REMOVE WHEN BACKEND IS READY
  // ========================================
  // To switch back to real API calls:
  // 1. Uncomment the API calls in each method
  // 2. Comment out or remove the mock data and mock logic
  // 3. Remove the 'of' and 'delay' imports if not used elsewhere
  // ========================================

  // Mock data for testing
  private mockChatMasters: ChatMaster[] = [
    {
      chatId: 1,
      chatDate: new Date('2024-01-15T10:30:00'),
      customerId: 101,
      userId: 1,
      isClosed: false,
      chatType: 'Support',
      customer: {
        id: 101,
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
      },
      user: {
        id: 1,
        name: 'Support Agent',
        email: 'support@company.com',
      },
      lastMessage: 'Thank you for your help!',
      lastMessageDate: new Date('2024-01-15T14:20:00'),
      unreadCount: 0,
    },
    {
      chatId: 2,
      chatDate: new Date('2024-01-14T09:15:00'),
      customerId: 102,
      userId: 2,
      isClosed: true,
      chatType: 'Sales',
      customer: {
        id: 102,
        name: 'Sarah Mohamed',
        email: 'sarah.mohamed@email.com',
      },
      user: {
        id: 2,
        name: 'Sales Manager',
        email: 'sales@company.com',
      },
      lastMessage: 'I will consider your offer and get back to you.',
      lastMessageDate: new Date('2024-01-14T16:45:00'),
      unreadCount: 0,
    },
  ];

  private mockChatDetails: { [chatId: number]: ChatDetail[] } = {
    1: [
      {
        id: 1,
        chatId: 1,
        chatDate: new Date('2024-01-15T10:30:00'),
        message: 'Hello, I need help with my order. It seems to be delayed.',
        senderId: 101,
        senderName: 'Ahmed Hassan',
        isFromCustomer: true,
      },
      {
        id: 2,
        chatId: 1,
        chatDate: new Date('2024-01-15T10:35:00'),
        message:
          "Hello Ahmed! I'm sorry to hear about the delay. Let me check your order status for you.",
        senderId: 1,
        senderName: 'Support Agent',
        isFromCustomer: false,
      },
      {
        id: 3,
        chatId: 1,
        chatDate: new Date('2024-01-15T10:40:00'),
        message:
          'I can see that your order #12345 is currently being processed and should be shipped within 24 hours.',
        senderId: 1,
        senderName: 'Support Agent',
        isFromCustomer: false,
      },
      {
        id: 4,
        chatId: 1,
        chatDate: new Date('2024-01-15T10:45:00'),
        message: "That's great! Will I receive a tracking number?",
        senderId: 101,
        senderName: 'Ahmed Hassan',
        isFromCustomer: true,
      },
      {
        id: 5,
        chatId: 1,
        chatDate: new Date('2024-01-15T10:50:00'),
        message:
          'Yes, you will receive a tracking number via email once the order is shipped.',
        senderId: 1,
        senderName: 'Support Agent',
        isFromCustomer: false,
      },
      {
        id: 6,
        chatId: 1,
        chatDate: new Date('2024-01-15T14:20:00'),
        message: 'Thank you for your help!',
        senderId: 101,
        senderName: 'Ahmed Hassan',
        isFromCustomer: true,
      },
    ],
    2: [
      {
        id: 7,
        chatId: 2,
        chatDate: new Date('2024-01-14T09:15:00'),
        message:
          "Hi, I'm interested in your premium package. Can you tell me more about it?",
        senderId: 102,
        senderName: 'Sarah Mohamed',
        isFromCustomer: true,
      },
      {
        id: 8,
        chatId: 2,
        chatDate: new Date('2024-01-14T09:20:00'),
        message:
          "Hello Sarah! I'd be happy to help you with information about our premium package. It includes advanced features, priority support, and extended storage.",
        senderId: 2,
        senderName: 'Sales Manager',
        isFromCustomer: false,
      },
      {
        id: 9,
        chatId: 2,
        chatDate: new Date('2024-01-14T09:25:00'),
        message: "What's the pricing for the premium package?",
        senderId: 102,
        senderName: 'Sarah Mohamed',
        isFromCustomer: true,
      },
      {
        id: 10,
        chatId: 2,
        chatDate: new Date('2024-01-14T09:30:00'),
        message:
          'The premium package is $99/month or $999/year (which saves you $189). Would you like me to send you a detailed proposal?',
        senderId: 2,
        senderName: 'Sales Manager',
        isFromCustomer: false,
      },
      {
        id: 11,
        chatId: 2,
        chatDate: new Date('2024-01-14T16:45:00'),
        message: 'I will consider your offer and get back to you.',
        senderId: 102,
        senderName: 'Sarah Mohamed',
        isFromCustomer: true,
      },
    ],
  };

  private mockCustomers = [
    { id: 101, name: 'Ahmed Hassan', email: 'ahmed.hassan@email.com' },
    { id: 102, name: 'Sarah Mohamed', email: 'sarah.mohamed@email.com' },
    { id: 103, name: 'Omar Ali', email: 'omar.ali@email.com' },
    { id: 104, name: 'Fatima Ahmed', email: 'fatima.ahmed@email.com' },
  ];

  constructor(private apiController: ApiController) {}

  // Get all chat masters (chats list)
  getChatMasters(): Observable<any> {
    return this.apiController.getApi('api/Conversation/GetAllChat').pipe(
      map((response: any) => {
        // Expected shape: { data: { items: BackendChatItem[] } }
        const items: BackendChatItem[] =
          (response?.data?.items as BackendChatItem[]) ?? [];

        // Map BackendChatItem[] → ChatMaster[] (group by chatId, keep latest message)
        const chatMap = new Map<
          number,
          { master: ChatMaster; lastDate: number }
        >();
        items.forEach((it) => {
          const existing = chatMap.get(it.chatId);
          const messageDate = it.chatDate || it.chatMasterDate;
          const messageDateMs = messageDate
            ? new Date(messageDate).getTime()
            : 0;
          const baseMaster: ChatMaster = {
            chatId: it.chatId,
            chatDate: new Date(it.chatMasterDate || it.chatDate || new Date()),
            customerId: it.customerId,
            userId: it.userId,
            isClosed: false,
            chatType: 'Support',
            customer: { id: it.customerId, name: it.customerName },
            user: { id: it.userId, name: 'Agent' },
            lastMessage: it.message,
            lastMessageDate: it.chatDate ? new Date(it.chatDate) : undefined,
            unreadCount: 0,
          };

          if (!existing || messageDateMs > existing.lastDate) {
            chatMap.set(it.chatId, {
              master: baseMaster,
              lastDate: messageDateMs,
            });
          }
        });

        const data = Array.from(chatMap.values())
          .map((v) => v.master)
          .sort(
            (a, b) =>
              (b.lastMessageDate?.getTime() || 0) -
              (a.lastMessageDate?.getTime() || 0)
          );

        return { succeeded: true, data, message: 'Chats loaded successfully' };
      })
    );
  }

  // Send chat message to backend API: /api/Conversation/AddChat
  addChatMessageBackend(
    chatId: number,
    message: string,
    attachment?: File
  ): Observable<any> {
    const url = `api/Conversation/AddChat?ChatId=${encodeURIComponent(
      chatId
    )}&Message=${encodeURIComponent(message || '')}`;
    let body: any = null;
    if (attachment) {
      const formData = new FormData();
      formData.append('ChatPhoto', attachment);
      body = formData;
    }
    return this.apiController.PostApi(body, url);
  }

  // Get chat details by chat ID
  getChatDetails(chatId: number): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // return this.apiController.getApi(`api/Chat/GetChatDetails?chatId=${chatId}`);

    const chatMaster = this.mockChatMasters.find(
      (chat) => chat.chatId === chatId
    );
    const messages = this.mockChatDetails[chatId] || [];

    return of({
      succeeded: true,
      data: {
        chatMaster: chatMaster,
        messages: messages,
      },
      message: 'Chat details loaded successfully',
    }).pipe(delay(300)); // Simulate API delay
  }

  // Get chat details using the new API endpoint (paginated)
  getChatDetailsNew(chatId: number, pageNumber: number = 1, pageSize: number = 8): Observable<any> {
    return this.apiController
      .getApi(`api/Conversation/GetChatDtl?chatId=${chatId}&pageNumber=${pageNumber}&pageSize=${pageSize}`)
      .pipe(
        map((response: any) => {
          console.log('Raw response from GetChatDtl:', response);
          if (response.succeeded && response.data && response.data.items) {
            // Transform the API response to match our ChatDetail interface
            const messages: ChatDetail[] = response.data.items
              .map((item: any) => ({
                id: item.id,
                chatId: item.chatId,
                chatDate: new Date(item.chatDate),
                message: item.message,
                frTo: item.frTo,
                status: item.status,
                photo: item.photo,
                isFromCustomer: item.frTo === 0, // 0 = received from customer, 1 = sent by me
                attachmentUrl: item.photo || undefined,
                attachmentType: item.photo ? 'image' : undefined,
              }));

            return {
              succeeded: true,
              data: {
                messages: messages,
                totalCount: response.data.totalCount,
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalPages: response.data.totalPages,
              },
              message: response.message || 'Chat details loaded successfully',
            };
          } else {
            return {
              succeeded: false,
              data: { messages: [] },
              message: response.message || 'Failed to load chat details',
            };
          }
        })
      );
  }

  // Send a new message
  sendMessage(request: SendMessageRequest): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // const formData = new FormData();
    // formData.append('chatId', request.chatId.toString());
    // formData.append('message', request.message);
    // if (request.attachment) {
    //   formData.append('attachment', request.attachment);
    // }
    // return this.apiController.PostApi(formData, 'api/Chat/SendMessage');

    // Mock: Add new message to the chat
    const newMessage: ChatDetail = {
      id: Date.now(), // Simple ID generation for mock
      chatId: request.chatId,
      chatDate: new Date(),
      message: request.message,
      senderId: 1, // Mock agent ID
      senderName: 'Support Agent',
      isFromCustomer: false,
    };

    if (!this.mockChatDetails[request.chatId]) {
      this.mockChatDetails[request.chatId] = [];
    }
    this.mockChatDetails[request.chatId].push(newMessage);

    // Update last message in chat master
    const chatMaster = this.mockChatMasters.find(
      (chat) => chat.chatId === request.chatId
    );
    if (chatMaster) {
      chatMaster.lastMessage = request.message;
      chatMaster.lastMessageDate = new Date();
    }

    return of({
      succeeded: true,
      data: newMessage,
      message: 'Message sent successfully',
    }).pipe(delay(200)); // Simulate API delay
  }

  // Create a new chat
  createChat(
    customerId: number,
    chatType: string = 'Support'
  ): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // const body = {
    //   customerId: customerId,
    //   chatType: chatType
    // };
    // return this.apiController.PostApi(body, 'api/Chat/CreateChat');

    const customer = this.mockCustomers.find((c) => c.id === customerId);
    const newChatId =
      Math.max(...this.mockChatMasters.map((c) => c.chatId)) + 1;

    const newChat: ChatMaster = {
      chatId: newChatId,
      chatDate: new Date(),
      customerId: customerId,
      userId: 1, // Mock assigned user
      isClosed: false,
      chatType: chatType,
      customer: customer,
      user: {
        id: 1,
        name: 'Support Agent',
        email: 'support@company.com',
      },
      lastMessage: '',
      lastMessageDate: new Date(),
      unreadCount: 0,
    };

    this.mockChatMasters.unshift(newChat); // Add to beginning
    this.mockChatDetails[newChatId] = []; // Initialize empty messages

    return of({
      succeeded: true,
      data: newChat,
      message: 'Chat created successfully',
    }).pipe(delay(300)); // Simulate API delay
  }

  // Close a chat
  closeChat(chatId: number): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // return this.apiController.PostApi({ chatId }, 'api/Chat/CloseChat');

    const chatMaster = this.mockChatMasters.find(
      (chat) => chat.chatId === chatId
    );
    if (chatMaster) {
      chatMaster.isClosed = true;
    }

    return of({
      succeeded: true,
      data: chatMaster,
      message: 'Chat closed successfully',
    }).pipe(delay(200)); // Simulate API delay
  }

  // Reopen a chat
  reopenChat(chatId: number): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // return this.apiController.PostApi({ chatId }, 'api/Chat/ReopenChat');

    const chatMaster = this.mockChatMasters.find(
      (chat) => chat.chatId === chatId
    );
    if (chatMaster) {
      chatMaster.isClosed = false;
    }

    return of({
      succeeded: true,
      data: chatMaster,
      message: 'Chat reopened successfully',
    }).pipe(delay(200)); // Simulate API delay
  }

  // Get customers for chat creation
  getCustomers(): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // return this.apiController.getApi('api/Customer/GetCustomers');

    return of({
      succeeded: true,
      data: this.mockCustomers,
      message: 'Customers loaded successfully',
    }).pipe(delay(300)); // Simulate API delay
  }

  // Mark messages as read
  markAsRead(chatId: number): Observable<any> {
    // TODO: Replace with real API call when backend is ready
    // return this.apiController.PostApi({ chatId }, 'api/Chat/MarkAsRead');

    const chatMaster = this.mockChatMasters.find(
      (chat) => chat.chatId === chatId
    );
    if (chatMaster) {
      chatMaster.unreadCount = 0;
    }

    return of({
      succeeded: true,
      data: null,
      message: 'Messages marked as read',
    }).pipe(delay(100)); // Simulate API delay
  }
}
