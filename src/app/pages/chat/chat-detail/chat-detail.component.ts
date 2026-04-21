/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import {
  ChatService,
  ChatMaster,
  ChatDetail,
  SendMessageRequest,
} from 'services/chat.service';
import { Subscription } from 'rxjs';
import { SignalRService, ChatMessage } from '../../../services/signalr.service';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  providers: [ChatService],
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss'],
})
export class ChatDetailComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  chatId!: number;
  chatMaster: ChatMaster | null = null;
  messages: ChatDetail[] = [];
  loading = false;
  sendingMessage = false;
  errorMessage = '';
  showError = false;

  // Pagination
  private pageNumber = 1;
  private readonly pageSize = 8;
  private totalPages: number | null = null;
  private isLoadingMore = false;

  // Message input
  newMessage = '';
  selectedFile: File | null = null;
  filePreview: string | null = null;

  private messagesSubscription?: Subscription;
  private signalrSub?: Subscription;
  private notificationSignalrSub?: Subscription;

  // Scroll management
  private shouldScrollToBottom = false;

  // Simple notification using Web Audio API
  private playNotification(): void {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.22);
    } catch (_) {
      // no-op if audio not supported or blocked
    }
  }

  // Image preview
  showImagePreview = false;
  previewImageUrl = '';

  constructor(
    private chatService: ChatService,
    private signalrService: SignalRService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state; // history.state covers normal navigations too
    console.log(JSON.stringify(state) + " STATE");
    if (state?.['chatMaster']) {
      this.chatMaster = state['chatMaster'] as ChatMaster;
      // don't start SignalR yet; wait till chatId is known below
    }
  }

  ngOnInit(): void {
    console.log("NG ON INIT");
    this.route.params.subscribe((params) => {
      console.log(JSON.stringify(params) + " PARAMS");
      this.chatId = +params['id'];
      if (this.chatId) {
        // Try to get chatMaster from router state first
        const navigation = this.router.getCurrentNavigation();
        console.log(JSON.stringify(navigation) + " NAVIGATION");
        if (this.chatMaster) {
          console.log('✅ ChatMaster received from router state:', this.chatMaster);
          this.startRealtimeMessages();
          this.subscribeSignalR();
        } else {
          // Fallback to loading from API if not available in state
          console.log('⚠️ ChatMaster not found in router state, loading from API...');
          this.loadChatHeaderOnce();
          this.startRealtimeMessages();
          this.subscribeSignalR();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
    if (this.signalrSub) this.signalrSub.unsubscribe();
    if (this.notificationSignalrSub) this.notificationSignalrSub.unsubscribe();
    // Unregister from notifications when leaving chat
    this.signalrService.unregisterFromChatNotifications();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadChatHeaderOnce(): void {
    this.loading = true;
    this.showError = false;
    this.errorMessage = '';
    console.log('Loading chat header for chatId:', this.chatId);
    
    // Since getChatDetailsNew only returns messages, we need to get chat master from a different endpoint
    // For now, we'll just load the messages and mark as read
    this.loadMessagesFromAPI();
  }

  startRealtimeMessages(): void {
    // Initial load from API
    this.pageNumber = 1;
    this.totalPages = null;
    this.messages = [];
    this.loadMessagesFromAPI();
  }

  private subscribeSignalR(): void {
    // Get userId from localStorage and register for notifications
    const userId = localStorage.getItem('userId');
    if (userId && this.chatMaster?.customerId) {
      console.log("User ID: " + userId, "Customer ID: " + this.chatMaster.customerId);
      console.log("Chat Master: " + JSON.stringify(this.chatMaster));
      this.signalrService.registerForChatNotifications(userId, this.chatMaster.customerId.toString(), this.chatId);
    } else {
      console.log("⚠️ Cannot register for notifications - missing userId or chatMaster.customerId");
      console.log("  - User ID:", userId);
      console.log("  - Chat Master:", this.chatMaster);
    }
    
    this.signalrSub = this.signalrService.chatMessages$.subscribe((msgList) => {
      // Filter by current chat - use loose comparison to handle type differences
      const relevant = msgList.filter(m => m.chatId == this.chatId);
      if (relevant.length) {
        // Map SignalR ChatMessage to ChatDetail view model
        const mapped: ChatDetail[] = relevant.map((m) => ({
          id: m.id,
          chatId: this.chatId,
          chatDate: m.timestamp,
          message: m.message,
          frTo: m.senderType === 'customer' ? 0 : 1, // 0 = received from customer, 1 = sent by me
          isFromCustomer: m.senderType === 'customer',
          senderName: m.senderName,
        } as ChatDetail));
        // Merge into existing list while avoiding duplicates by id
        const existingById = new Set(this.messages.map(x => x.id));
        const merged = [...this.messages];
        let addedIncoming = false;
        for (const msg of mapped) {
          if (!existingById.has(msg.id)) {
            merged.push(msg);
            if (msg.frTo === 0) addedIncoming = true; // from customer
          }
        }
        this.messages = this.sortMessagesByDate(merged);
        this.shouldScrollToBottom = true;
        if (addedIncoming) this.playNotification();
      }
    });

    // Also subscribe to notification messages for SignalR messages
    this.notificationSignalrSub = this.signalrService.notificationMessages$.subscribe((msgList) => {
      console.log('📨 Received notification messages:', msgList);
      console.log('📨 Current chatId:', this.chatId, 'Type:', typeof this.chatId);
      console.log('📨 Message chatIds:', msgList.map(m => ({ id: m.id, chatId: m.chatId, type: typeof m.chatId })));
      // Filter by current chat - use loose comparison to handle type differences
      const relevant = msgList.filter(m => m.chatId == this.chatId);
      console.log('📨 Relevant messages after filtering:', relevant);
      if (relevant.length) {
        console.log('📨 Processing relevant notification messages:', relevant);
        // Map SignalR ChatMessage to ChatDetail view model
        const mapped: ChatDetail[] = relevant.map((m) => ({
          id: m.id,
          chatId: this.chatId,
          chatDate: m.timestamp,
          message: m.message,
          frTo: m.senderType === 'customer' ? 0 : 1, // 0 = received from customer, 1 = sent by me
          isFromCustomer: m.senderType === 'customer',
          senderName: m.senderName,
        } as ChatDetail));
        // Merge into existing list while avoiding duplicates by id
        const existingById = new Set(this.messages.map(x => x.id));
        const merged = [...this.messages];
        let addedIncoming = false;
        for (const msg of mapped) {
          if (!existingById.has(msg.id)) {
            merged.push(msg);
            if (msg.frTo === 0) addedIncoming = true; // from customer
          }
        }
        this.messages = this.sortMessagesByDate(merged);
        this.shouldScrollToBottom = true;
        console.log('✅ Notification messages added to chat UI');
        if (addedIncoming) this.playNotification();
      }
    });
  }

  private sortMessagesByDate(messages: ChatDetail[]): ChatDetail[] {
    return [...messages].sort((a, b) => {
      const dateA = new Date(a.chatDate).getTime();
      const dateB = new Date(b.chatDate).getTime();
      return dateA - dateB; // Ascending order (oldest first)
    });
  }

  loadMessagesFromAPI(): void {
    this.loading = this.pageNumber === 1;
    this.showError = false;
    this.errorMessage = '';

    this.chatService.getChatDetailsNew(this.chatId, this.pageNumber, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          const incoming: ChatDetail[] = response.data?.messages || [];

          if (this.pageNumber === 1) {
            // First page → set and scroll to bottom
            this.messages = this.sortMessagesByDate(incoming);
            this.shouldScrollToBottom = true;
            // Force immediate scroll after data loads
            setTimeout(() => this.scrollToBottom(), 100);
          } else {
            // Next pages → prepend while preserving scroll position
            const container = this.messagesContainer?.nativeElement;
            const prevScrollHeight = container ? container.scrollHeight : 0;
            this.messages = this.sortMessagesByDate([...incoming, ...this.messages]);
            setTimeout(() => {
              if (container) {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - prevScrollHeight;
              }
            });
          }

          // Update pagination state
          this.totalPages = response.data?.totalPages ?? this.totalPages;
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Failed to load messages';
          console.error('Failed to load messages:', response.message);
        }
      },
      error: (error: any) => {
        this.showError = true;
        this.errorMessage = 'Error loading messages. Please try again.';
        console.error('Error loading messages:', error);
      },
      complete: () => {
        this.loading = false;
        this.isLoadingMore = false;
      },
    });
  }

  onMessagesScroll(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container || this.isLoadingMore) return;
    const nearTop = container.scrollTop <= 50;
    const hasMore = this.totalPages === null || this.pageNumber < (this.totalPages || 0);
    if (nearTop && hasMore) {
      this.isLoadingMore = true;
      this.pageNumber += 1;
      this.loadMessagesFromAPI();
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) {
      return;
    }

    this.sendingMessage = true;
    this.showError = false;
    this.errorMessage = '';

    const messageText = this.newMessage.trim();
    
    // First, add the message to the UI optimistically
    const tempMessage: ChatDetail = {
      id: 'temp_' + Date.now(),
      chatId: this.chatId,
      chatDate: new Date(),
      message: messageText,
      frTo: 1, // 1 = sent by agent (me)
      isFromCustomer: false,
      senderName: this.getUserName(),
    };
    this.messages = this.sortMessagesByDate([...this.messages, tempMessage]);
    this.shouldScrollToBottom = true;
    console.log("ALOOOOOO");
    console.log(this.chatMaster + " CHAT MASTER")
    // Send via API for persistence
    const request: SendMessageRequest = {
      chatId: this.chatId,
      message: messageText,
      attachment: this.selectedFile || undefined,
    };

    this.chatService
      .addChatMessageBackend(
        this.chatId,
        request.message,
        this.selectedFile || undefined
      )
      .subscribe({
        next: (response: any) => {
          if (response.succeeded) {
            // Remove temp message and add the real one
            this.messages = this.messages.filter(m => m.id !== tempMessage.id);
            const realMessage: ChatDetail = {
              id: response.data?.id || Date.now().toString(),
              chatId: this.chatId,
              chatDate: new Date(),
              message: messageText,
              frTo: 1, // 1 means I'm sending the message
              isFromCustomer: false,
              senderName: this.getUserName(),
            };
            this.messages = this.sortMessagesByDate([...this.messages, realMessage]);
            
            // Send to customer via notification hub
            if (this.chatMaster?.customerId) {
              console.log('📤 Sending message to customer via notification hub:', this.chatMaster.customerId);
              this.signalrService.sendMessageToCustomer(this.chatMaster.customerId.toString(), messageText);
            } else {
              console.log('⚠️ Cannot send to customer - chatMaster.customerId not available');
            }
            
            this.newMessage = '';
            this.clearFileSelection();
          } else {
            // Remove the temp message and show error
            this.messages = this.messages.filter(m => m.id !== tempMessage.id);
            this.showError = true;
            this.errorMessage = response.message || 'Failed to send message to customer';
            console.error('Failed to send message:', response.message);
          }
        },
        error: (error: any) => {
          // Remove the temp message and show error
          this.messages = this.messages.filter(m => m.id !== tempMessage.id);
          this.showError = true;
          this.errorMessage = 'Error sending message. Please try again.';
          console.error('Error sending message:', error);
        },
        complete: () => {
          this.sendingMessage = false;
          // Focus after sending completes (input will be re-enabled)
          setTimeout(() => this.focusMessageInput(), 0);
        },
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showError = true;
        this.errorMessage = 'Please select an image file only.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showError = true;
        this.errorMessage = 'File size must be less than 5MB.';
        return;
      }

      this.selectedFile = file;
      this.createFilePreview(file);
    }
  }

  private createFilePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clearFileSelection(): void {
    this.selectedFile = null;
    this.filePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private focusMessageInput(): void {
    try {
      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.focus();
      }
    } catch (_) {}
  }

  markAsRead(): void {
    this.chatService.markAsRead(this.chatId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error marking as read:', error);
      },
    });
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 0);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/chat']);
  }

  closeChat(): void {
    if (confirm('Are you sure you want to close this chat?')) {
      this.chatService.closeChat(this.chatId).subscribe({
        next: (response: any) => {
          if (response.succeeded) {
            this.goBack();
          } else {
            this.showError = true;
            this.errorMessage = response.message || 'Failed to close chat';
          }
        },
        error: (error: any) => {
          this.showError = true;
          this.errorMessage = 'Error closing chat. Please try again.';
          console.error('Error closing chat:', error);
        },
      });
    }
  }

  clearError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  formatMessageTime(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return (
        d.toLocaleDateString() +
        ' ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }

  isFromCustomer(message: ChatDetail): string | boolean {
    if (message.frTo !== undefined) {
      return message.frTo === 0; // 0 = from customer, 1 = from agent (me)
    }
    return message.isFromCustomer || false;
  }

  getSenderName(message: ChatDetail): string {
    if (this.isFromCustomer(message)) {
      return (
        this.chatMaster?.customer?.name ||
        'Customer #' + this.chatMaster?.customerId
      );
    } else {
      return (
        message.senderName || this.chatMaster?.user?.name || 'Support Agent'
      );
    }
  }

  getMessageClass(message: ChatDetail): string {
    return this.isFromCustomer(message) ? 'customer-message' : 'agent-message';
  }

  getCustomerName(): string {
    return (
      this.chatMaster?.customer?.name ||
      'Customer #' + this.chatMaster?.customerId
    );
  }

  getUserName(): string {
    return this.chatMaster?.user?.name || 'Unassigned';
  }

  getChatStatus(): string {
    return this.chatMaster?.isClosed ? 'Closed' : 'Open';
  }

  getChatStatusClass(): string {
    return this.chatMaster?.isClosed ? 'text-danger' : 'text-success';
  }

  openImagePreview(imageUrl: string): void {
    if (imageUrl && imageUrl.trim() !== '') {
      this.previewImageUrl = imageUrl;
      this.showImagePreview = true;
    }
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
    this.previewImageUrl = '';
  }

  refreshMessages(): void {
    this.pageNumber = 1;
    this.totalPages = null;
    this.messages = [];
    this.loadMessagesFromAPI();
  }

  getImageSrc(message: ChatDetail): string {
    const raw = (message.photo ?? '').trim();
    if (!raw) return '';
    if (raw.startsWith('data:')) return raw;
    const mime =
      message.mimeType?.trim() ||
      (raw.startsWith('/9j/') ? 'image/jpeg' : 'image/jpeg');
    const pureBase64 = raw.replace(/^data:.*;base64,/, '').replace(/\s+/g, '');
    return `data:${mime};base64,${pureBase64}`;
  }

  // Test methods for debugging SignalR connection
  testSendToGroup(): void {
    console.log('🧪 Testing send to Test group...');
    this.signalrService.sendTestMessage('Test message from Angular app to Test group');
  }

  testSendToUser(): void {
    console.log('🧪 Testing send to user 3C...');
    this.signalrService.sendTestMessageToUser('3C', 'Test message from Angular app to user 3C');
  }

  testSendToCurrentChat(): void {
    console.log('🧪 Testing send to current chat customer...' + this.chatMaster?.customerId); 
    if (this.chatMaster?.customerId) {
      console.log('🧪 Testing send to current chat customer...' + this.chatMaster.customerId);
      this.signalrService.sendMessageToCustomer(this.chatMaster.customerId.toString(), 'Test message to current chat customer');
    } else {
      console.log('❌ No current chat customer ID available');
    }
  }
}
