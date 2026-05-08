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
    return this.getChatDetailsNew(chatId, 1, 100);
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
    return this.addChatMessageBackend(request.chatId, request.message, request.attachment);
  }

  // Create a new chat
  createChat(
    customerId: number,
    chatType: string = 'Support'
  ): Observable<any> {
    return this.apiController.PostLiteApi(`api/Conversation/CreateChat?customerId=${customerId}&chatType=${chatType}`);
  }

  // Close a chat
  closeChat(chatId: number): Observable<any> {
    return this.apiController.PostLiteApi(`api/Conversation/CloseChat?chatId=${chatId}`);
  }

  // Reopen a chat
  reopenChat(chatId: number): Observable<any> {
    return this.apiController.PostLiteApi(`api/Conversation/ReopenChat?chatId=${chatId}`);
  }

  // Get customers for chat creation
  getCustomers(): Observable<any> {
    return this.apiController.getApi('api/AuthController/GetAllCustomers');
  }

  // Mark messages as read
  markAsRead(chatId: number): Observable<any> {
    return this.apiController.PostLiteApi(`api/Conversation/MarkAsRead?chatId=${chatId}`);
  }
}
