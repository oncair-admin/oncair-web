/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { ChatService, ChatMaster } from 'services/chat.service';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  providers: [ChatService],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit {
  chats: ChatMaster[] = [];
  filteredChats: ChatMaster[] = [];
  loading = false;
  showCreateModal = false;
  selectedChat: ChatMaster | null = null;

  // Form data
  newChatCustomerId = 0;
  newChatType = 'Support';
  customers: any[] = [];

  // Statistics
  totalChats = 0;
  openChats = 0;
  closedChats = 0;

  // Error handling
  errorMessage = '';
  showError = false;

  // Search
  searchTerm = '';

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChats();
    this.loadCustomers();
  }

  loadChats(): void {
    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.chatService.getChatMasters().subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.chats = response.data || [];
          this.filteredChats = [...this.chats];
          this.calculateStats();
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Failed to load chats';
          console.error('Failed to load chats:', response.message);
        }
      },
      error: (error: any) => {
        this.showError = true;
        this.errorMessage = 'Error loading chats. Please try again.';
        console.error('Error loading chats:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  loadCustomers(): void {
    this.chatService.getCustomers().subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.customers = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading customers:', error);
      },
    });
  }

  calculateStats(): void {
    this.totalChats = this.chats.length;
    // Backend does not provide closed state; assume all open for now
    this.openChats = this.chats.length;
    this.closedChats = 0;
  }

  openCreateModal(): void {
    this.newChatCustomerId = 0;
    this.newChatType = 'Support';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newChatCustomerId = 0;
    this.newChatType = 'Support';
  }

  createChat(): void {
    if (!this.newChatCustomerId) {
      return;
    }

    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.chatService.createChat(this.newChatCustomerId, this.newChatType).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.loadChats();
          this.closeCreateModal();
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Failed to create chat';
          console.error('Failed to create chat:', response.message);
        }
      },
      error: (error: any) => {
        this.showError = true;
        this.errorMessage = 'Error creating chat. Please try again.';
        console.error('Error creating chat:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  openChat(chat: ChatMaster): void {
    console.log(JSON.stringify(chat) + " CHAT");
    // Pass the chatMaster data through router state
    this.router.navigate(['/dashboard/chat', chat.chatId], {
      state: { chatMaster: chat }
    });
  }

  closeChat(chat: ChatMaster): void {
    if (confirm(`Are you sure you want to close this chat?`)) {
      this.loading = true;
      this.showError = false;
      this.errorMessage = '';

      this.chatService.closeChat(chat.chatId).subscribe({
        next: (response: any) => {
          if (response.succeeded) {
            this.loadChats();
          } else {
            this.showError = true;
            this.errorMessage = response.message || 'Failed to close chat';
            console.error('Failed to close chat:', response.message);
          }
        },
        error: (error: any) => {
          this.showError = true;
          this.errorMessage = 'Error closing chat. Please try again.';
          console.error('Error closing chat:', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }

  reopenChat(chat: ChatMaster): void {
    this.loading = true;
    this.showError = false;
    this.errorMessage = '';

    this.chatService.reopenChat(chat.chatId).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.loadChats();
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Failed to reopen chat';
          console.error('Failed to reopen chat:', response.message);
        }
      },
      error: (error: any) => {
        this.showError = true;
        this.errorMessage = 'Error reopening chat. Please try again.';
        console.error('Error reopening chat:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  searchChats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredChats = [...this.chats];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredChats = this.chats.filter(chat => 
      chat.customer?.name?.toLowerCase().includes(term) ||
      chat.user?.name?.toLowerCase().includes(term) ||
      (chat.chatType || '').toLowerCase().includes(term) ||
      (chat.lastMessage || '').toLowerCase().includes(term)
    );
  }

  clearError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  getStatusBadgeClass(chat: ChatMaster): string {
    return 'bg-success';
  }

  getStatusText(chat: ChatMaster): string {
    return 'Open';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getCustomerName(chat: ChatMaster): string {
    return chat.customer?.name || 'Customer #' + chat.customerId;
  }

  getUserName(chat: ChatMaster): string {
    return chat.user?.name || 'Unassigned';
  }
}
