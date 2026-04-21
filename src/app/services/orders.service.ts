import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { Order, OrderStatus, OrderStatistics, TrackingEvent, ReturnDelivery, CorporateAccount } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData(): void {
    const dummyOrders: Order[] = [
      {
        id: 1,
        orderNumber: 'ORD-2025-0001',
        customerName: 'Ahmed Mohamed',
        customerPhone: '01012345678',
        customerEmail: 'ahmed.m@email.com',
        senderName: 'Cairo Store',
        senderPhone: '0223456789',
        senderAddress: '123 Tahrir Square, Cairo',
        recipientName: 'Mohamed Ali',
        recipientPhone: '01098765432',
        recipientAddress: '456 Nasr City, Cairo',
        recipientCity: 'Cairo',
        recipientDistrict: 'Nasr City',
        packageDescription: 'Electronics - Mobile Phone',
        packageWeight: 0.5,
        packageDimensions: '20x15x5 cm',
        packageValue: 5000,
        deliveryType: 'Express',
        paymentMethod: 'Cash on Delivery',
        shippingCost: 50,
        codAmount: 5000,
        status: 'In Transit',
        courierId: 1,
        courierName: 'Ahmed Hassan',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        createdDate: new Date('2025-09-25'),
        pickupDate: new Date('2025-09-26'),
        estimatedDeliveryDate: new Date('2025-09-28'),
        attemptCount: 0,
        isCorporate: false
      },
      {
        id: 2,
        orderNumber: 'ORD-2025-0002',
        customerName: 'Sara Ahmed',
        customerPhone: '01123456789',
        customerEmail: 'sara.ahmed@email.com',
        senderName: 'Fashion House',
        senderPhone: '0223456788',
        senderAddress: '789 Zamalek, Cairo',
        recipientName: 'Fatma Hassan',
        recipientPhone: '01187654321',
        recipientAddress: '321 Maadi, Cairo',
        recipientCity: 'Cairo',
        recipientDistrict: 'Maadi',
        packageDescription: 'Clothing - Dress',
        packageWeight: 1.2,
        packageDimensions: '40x30x10 cm',
        packageValue: 1500,
        deliveryType: 'Standard',
        paymentMethod: 'Prepaid',
        shippingCost: 35,
        status: 'Delivered',
        courierId: 2,
        courierName: 'Mohamed Ali',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        createdDate: new Date('2025-09-20'),
        pickupDate: new Date('2025-09-21'),
        deliveryDate: new Date('2025-09-24'),
        estimatedDeliveryDate: new Date('2025-09-24'),
        attemptCount: 0,
        isCorporate: false
      },
      {
        id: 3,
        orderNumber: 'ORD-2025-0003',
        customerName: 'Omar Khaled',
        customerPhone: '01234567890',
        senderName: 'Tech Store',
        senderPhone: '0223456787',
        senderAddress: '555 Downtown, Cairo',
        recipientName: 'Hassan Ibrahim',
        recipientPhone: '01276543210',
        recipientAddress: '888 Heliopolis, Cairo',
        recipientCity: 'Cairo',
        recipientDistrict: 'Heliopolis',
        packageDescription: 'Electronics - Laptop',
        packageWeight: 2.5,
        packageDimensions: '50x35x5 cm',
        packageValue: 15000,
        deliveryType: 'Same Day',
        paymentMethod: 'Cash on Delivery',
        shippingCost: 100,
        codAmount: 15000,
        status: 'Delivery Attempted',
        courierId: 3,
        courierName: 'Omar Khaled',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        createdDate: new Date('2025-09-28'),
        pickupDate: new Date('2025-09-28'),
        estimatedDeliveryDate: new Date('2025-09-28'),
        attemptCount: 1,
        notes: 'Customer not available at first attempt',
        isCorporate: false
      },
      {
        id: 4,
        orderNumber: 'ORD-2025-0004',
        customerName: 'Tech Solutions LLC',
        customerPhone: '0221234567',
        customerEmail: 'orders@techsolutions.com',
        senderName: 'Tech Solutions Warehouse',
        senderPhone: '0221234567',
        senderAddress: '100 Industrial Zone, 6th October',
        recipientName: 'Client ABC Corp',
        recipientPhone: '0229876543',
        recipientAddress: '200 Smart Village, Giza',
        recipientCity: 'Giza',
        recipientDistrict: 'Smart Village',
        packageDescription: 'IT Equipment - Servers',
        packageWeight: 25,
        packageDimensions: '80x60x40 cm',
        packageValue: 50000,
        deliveryType: 'Express',
        paymentMethod: 'Bank Transfer',
        shippingCost: 250,
        status: 'Pending',
        branchId: 2,
        branchName: 'Giza Branch',
        createdDate: new Date('2025-09-29'),
        estimatedDeliveryDate: new Date('2025-10-01'),
        attemptCount: 0,
        isCorporate: true,
        corporateAccountId: 1
      },
      {
        id: 5,
        orderNumber: 'ORD-2025-0005',
        customerName: 'Nour Hassan',
        customerPhone: '01098765432',
        customerEmail: 'nour.h@email.com',
        senderName: 'Books Store',
        senderPhone: '0223456786',
        senderAddress: '777 Garden City, Cairo',
        recipientName: 'Ali Mohamed',
        recipientPhone: '01165432109',
        recipientAddress: '999 Dokki, Giza',
        recipientCity: 'Giza',
        recipientDistrict: 'Dokki',
        packageDescription: 'Books - Collection',
        packageWeight: 3,
        packageDimensions: '30x25x15 cm',
        packageValue: 500,
        deliveryType: 'Standard',
        paymentMethod: 'Cash on Delivery',
        shippingCost: 40,
        codAmount: 500,
        status: 'Failed',
        courierId: 4,
        courierName: 'Youssef Mahmoud',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        createdDate: new Date('2025-09-22'),
        pickupDate: new Date('2025-09-23'),
        estimatedDeliveryDate: new Date('2025-09-26'),
        attemptCount: 3,
        returnReason: 'Customer not available after 3 attempts',
        notes: 'Customer phone switched off',
        isCorporate: false
      },
      {
        id: 6,
        orderNumber: 'ORD-2025-0006',
        customerName: 'Yasmin Ahmed',
        customerPhone: '01154321098',
        senderName: 'Beauty Shop',
        senderPhone: '0223456785',
        senderAddress: '333 Mohandessin, Giza',
        recipientName: 'Dina Ali',
        recipientPhone: '01243210987',
        recipientAddress: '444 New Cairo',
        recipientCity: 'Cairo',
        recipientDistrict: 'New Cairo',
        packageDescription: 'Cosmetics',
        packageWeight: 0.8,
        packageDimensions: '25x20x10 cm',
        packageValue: 2000,
        deliveryType: 'Next Day',
        paymentMethod: 'Credit Card',
        shippingCost: 60,
        status: 'Out for Delivery',
        courierId: 1,
        courierName: 'Ahmed Hassan',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        createdDate: new Date('2025-09-28'),
        pickupDate: new Date('2025-09-29'),
        estimatedDeliveryDate: new Date('2025-09-30'),
        attemptCount: 0,
        isCorporate: false
      },
      {
        id: 7,
        orderNumber: 'ORD-2025-0007',
        customerName: 'Khaled Omar',
        customerPhone: '01032109876',
        customerEmail: 'khaled.o@email.com',
        senderName: 'Sports Store',
        senderPhone: '0223456784',
        senderAddress: '111 Helwan, Cairo',
        recipientName: 'Ibrahim Khaled',
        recipientPhone: '01121098765',
        recipientAddress: '222 Shubra, Cairo',
        recipientCity: 'Cairo',
        recipientDistrict: 'Shubra',
        packageDescription: 'Sports Equipment',
        packageWeight: 5,
        packageDimensions: '60x40x30 cm',
        packageValue: 3500,
        deliveryType: 'Standard',
        paymentMethod: 'Cash on Delivery',
        shippingCost: 45,
        codAmount: 3500,
        status: 'Confirmed',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        createdDate: new Date('2025-09-29'),
        estimatedDeliveryDate: new Date('2025-10-02'),
        attemptCount: 0,
        isCorporate: false
      },
      {
        id: 8,
        orderNumber: 'ORD-2025-0008',
        customerName: 'Mariam Hassan',
        customerPhone: '01210987654',
        senderName: 'Home Appliances',
        senderPhone: '0223456783',
        senderAddress: '666 Ain Shams, Cairo',
        recipientName: 'Hoda Mohamed',
        recipientPhone: '01109876543',
        recipientAddress: '888 Giza Square, Giza',
        recipientCity: 'Giza',
        recipientDistrict: 'Giza Square',
        packageDescription: 'Kitchen Appliance',
        packageWeight: 8,
        packageDimensions: '70x50x40 cm',
        packageValue: 4500,
        deliveryType: 'Express',
        paymentMethod: 'Prepaid',
        shippingCost: 80,
        status: 'Picked Up',
        courierId: 2,
        courierName: 'Mohamed Ali',
        branchId: 2,
        branchName: 'Giza Branch',
        createdDate: new Date('2025-09-29'),
        pickupDate: new Date('2025-09-30'),
        estimatedDeliveryDate: new Date('2025-10-01'),
        attemptCount: 0,
        isCorporate: false
      }
    ];

    this.ordersSubject.next(dummyOrders);
  }

  getAllOrders(): Observable<Order[]> {
    return this.orders$;
  }

  getOrderById(id: number): Observable<Order | undefined> {
    const orders = this.ordersSubject.value;
    return of(orders.find(o => o.id === id));
  }

  createOrder(order: Order): Observable<{succeeded: boolean, message: string, data?: Order}> {
    const orders = this.ordersSubject.value;
    const newOrder = {
      ...order,
      id: Math.max(...orders.map(o => o.id)) + 1,
      orderNumber: `ORD-2025-${String(orders.length + 1).padStart(4, '0')}`,
      createdDate: new Date(),
      status: 'Pending' as OrderStatus,
      attemptCount: 0
    };
    
    orders.push(newOrder);
    this.ordersSubject.next([...orders]);
    
    return of({
      succeeded: true,
      message: 'Order created successfully',
      data: newOrder
    }).pipe(delay(500));
  }

  updateOrder(id: number, updates: Partial<Order>): Observable<{succeeded: boolean, message: string}> {
    const orders = this.ordersSubject.value;
    const index = orders.findIndex(o => o.id === id);
    
    if (index >= 0) {
      orders[index] = { ...orders[index], ...updates };
      this.ordersSubject.next([...orders]);
      
      return of({
        succeeded: true,
        message: 'Order updated successfully'
      }).pipe(delay(500));
    }
    
    return of({
      succeeded: false,
      message: 'Order not found'
    });
  }

  deleteOrder(id: number): Observable<{succeeded: boolean, message: string}> {
    const orders = this.ordersSubject.value;
    const filtered = orders.filter(o => o.id !== id);
    
    if (filtered.length < orders.length) {
      this.ordersSubject.next(filtered);
      return of({
        succeeded: true,
        message: 'Order deleted successfully'
      }).pipe(delay(500));
    }
    
    return of({
      succeeded: false,
      message: 'Order not found'
    });
  }

  getOrderStatistics(): Observable<OrderStatistics> {
    const orders = this.ordersSubject.value;
    
    const stats: OrderStatistics = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length,
      inTransitOrders: orders.filter(o => o.status === 'In Transit' || o.status === 'Out for Delivery' || o.status === 'Picked Up').length,
      deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
      failedOrders: orders.filter(o => o.status === 'Failed').length,
      returnedOrders: orders.filter(o => o.status === 'Returned').length,
      totalRevenue: orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + o.shippingCost, 0),
      averageDeliveryTime: 2.5 // days
    };
    
    return of(stats).pipe(delay(300));
  }

  getReturnDeliveries(): Observable<ReturnDelivery[]> {
    const dummyReturns: ReturnDelivery[] = [
      {
        id: 1,
        orderId: 5,
        orderNumber: 'ORD-2025-0005',
        customerName: 'Nour Hassan',
        returnReason: 'Customer Not Available',
        returnReasonDetails: 'Customer phone switched off after 3 attempts',
        returnDate: new Date('2025-09-26'),
        returnStatus: 'Pending',
        reattemptCount: 3,
        courierNotes: 'Unable to reach customer'
      },
      {
        id: 2,
        orderId: 3,
        orderNumber: 'ORD-2025-0003',
        customerName: 'Omar Khaled',
        returnReason: 'Customer Not Available',
        returnReasonDetails: 'First delivery attempt failed',
        returnDate: new Date('2025-09-28'),
        returnStatus: 'Reattempt Scheduled',
        reattemptDate: new Date('2025-09-30'),
        reattemptCount: 1,
        customerFeedback: 'Please deliver in the evening'
      }
    ];
    
    return of(dummyReturns).pipe(delay(300));
  }

  getCorporateAccounts(): Observable<CorporateAccount[]> {
    const dummyAccounts: CorporateAccount[] = [
      {
        id: 1,
        companyName: 'Tech Solutions LLC',
        contactPerson: 'Ahmed Mohamed',
        email: 'orders@techsolutions.com',
        phone: '0221234567',
        address: '100 Industrial Zone, 6th October',
        isActive: true,
        createdDate: new Date('2025-01-15'),
        subUsers: [
          {
            id: 1,
            corporateAccountId: 1,
            name: 'Mohamed Ali',
            email: 'mohamed@techsolutions.com',
            phone: '01012345678',
            role: 'Order Manager',
            canPlaceOrders: true,
            canViewAllOrders: true,
            isActive: true
          },
          {
            id: 2,
            corporateAccountId: 1,
            name: 'Sara Ahmed',
            email: 'sara@techsolutions.com',
            phone: '01123456789',
            role: 'Assistant',
            canPlaceOrders: true,
            canViewAllOrders: false,
            isActive: true
          }
        ]
      }
    ];
    
    return of(dummyAccounts).pipe(delay(300));
  }
}
