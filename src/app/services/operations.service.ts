import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import {
  OperationsDashboardStats,
  BranchPerformance,
  Escalation,
  Courier,
  DeliveryAssignment,
  HubPackage,
  HubTransfer,
  DeliveryQueueItem,
  PickupRequest,
  Hub
} from '../models/operations.models';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private couriersSubject = new BehaviorSubject<Courier[]>([]);
  private deliveryQueueSubject = new BehaviorSubject<DeliveryQueueItem[]>([]);
  private pickupRequestsSubject = new BehaviorSubject<PickupRequest[]>([]);
  private hubPackagesSubject = new BehaviorSubject<HubPackage[]>([]);

  public couriers$ = this.couriersSubject.asObservable();
  public deliveryQueue$ = this.deliveryQueueSubject.asObservable();
  public pickupRequests$ = this.pickupRequestsSubject.asObservable();
  public hubPackages$ = this.hubPackagesSubject.asObservable();

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData(): void {
    // Initialize Couriers
    const couriers: Courier[] = [
      {
        id: 1,
        name: 'Ahmed Hassan',
        phone: '01012345678',
        email: 'ahmed.hassan@courier.com',
        status: 'Busy',
        currentOrders: 3,
        maxCapacity: 10,
        branchId: 1,
        branchName: 'Cairo Main Branch',
        vehicleType: 'Motorcycle',
        currentLocation: { latitude: 30.0444, longitude: 31.2357 },
        todayDeliveries: 12,
        rating: 4.5
      },
      {
        id: 2,
        name: 'Mohamed Ali',
        phone: '01098765432',
        email: 'mohamed.ali@courier.com',
        status: 'Available',
        currentOrders: 0,
        maxCapacity: 10,
        branchId: 1,
        branchName: 'Cairo Main Branch',
        vehicleType: 'Van',
        currentLocation: { latitude: 30.0544, longitude: 31.2457 },
        todayDeliveries: 8,
        rating: 4.7
      },
      {
        id: 3,
        name: 'Omar Khaled',
        phone: '01123456789',
        email: 'omar.khaled@courier.com',
        status: 'Busy',
        currentOrders: 5,
        maxCapacity: 8,
        branchId: 1,
        branchName: 'Cairo Main Branch',
        vehicleType: 'Motorcycle',
        currentLocation: { latitude: 30.0344, longitude: 31.2257 },
        todayDeliveries: 15,
        rating: 4.8
      },
      {
        id: 4,
        name: 'Youssef Mahmoud',
        phone: '01234567890',
        status: 'Available',
        currentOrders: 1,
        maxCapacity: 10,
        branchId: 2,
        branchName: 'Giza Branch',
        vehicleType: 'Van',
        currentLocation: { latitude: 30.0644, longitude: 31.2557 },
        todayDeliveries: 6,
        rating: 4.3
      },
      {
        id: 5,
        name: 'Hassan Ibrahim',
        phone: '01156789012',
        status: 'On Break',
        currentOrders: 0,
        maxCapacity: 10,
        branchId: 1,
        branchName: 'Cairo Main Branch',
        vehicleType: 'Motorcycle',
        todayDeliveries: 10,
        rating: 4.6
      }
    ];

    // Initialize Delivery Queue
    const deliveryQueue: DeliveryQueueItem[] = [
      {
        id: 1,
        orderNumber: 'ORD-2025-0001',
        customerName: 'Ahmed Mohamed',
        customerPhone: '01012345678',
        deliveryAddress: '123 Nasr City, Cairo',
        city: 'Cairo',
        packageDescription: 'Electronics',
        scheduledDate: new Date('2025-09-30'),
        timeSlot: 'Morning (9-12)',
        status: 'Assigned',
        courierId: 1,
        courierName: 'Ahmed Hassan',
        priority: 'High',
        deliveryType: 'Express',
        codAmount: 5000,
        attempts: 0
      },
      {
        id: 2,
        orderNumber: 'ORD-2025-0002',
        customerName: 'Sara Ahmed',
        customerPhone: '01123456789',
        deliveryAddress: '456 Maadi, Cairo',
        city: 'Cairo',
        packageDescription: 'Clothing',
        scheduledDate: new Date('2025-09-30'),
        timeSlot: 'Afternoon (12-3)',
        status: 'Scheduled',
        priority: 'Normal',
        deliveryType: 'Standard',
        codAmount: 1500,
        attempts: 0
      },
      {
        id: 3,
        orderNumber: 'ORD-2025-0003',
        customerName: 'Khaled Omar',
        customerPhone: '01234567890',
        deliveryAddress: '789 Heliopolis, Cairo',
        city: 'Cairo',
        packageDescription: 'Books',
        scheduledDate: new Date('2025-09-30'),
        timeSlot: 'Evening (3-6)',
        status: 'In Progress',
        courierId: 3,
        courierName: 'Omar Khaled',
        priority: 'Normal',
        deliveryType: 'Standard',
        codAmount: 500,
        attempts: 0
      },
      {
        id: 4,
        orderNumber: 'ORD-2025-0004',
        customerName: 'Nour Hassan',
        customerPhone: '01098765432',
        deliveryAddress: '321 Dokki, Giza',
        city: 'Giza',
        packageDescription: 'Cosmetics',
        scheduledDate: new Date('2025-10-01'),
        timeSlot: 'Morning (9-12)',
        status: 'Scheduled',
        priority: 'Low',
        deliveryType: 'Standard',
        attempts: 0
      },
      {
        id: 5,
        orderNumber: 'ORD-2025-0005',
        customerName: 'Yasmin Ahmed',
        customerPhone: '01154321098',
        deliveryAddress: '555 New Cairo',
        city: 'Cairo',
        packageDescription: 'Laptop',
        scheduledDate: new Date('2025-09-30'),
        timeSlot: 'Anytime',
        status: 'Assigned',
        courierId: 1,
        courierName: 'Ahmed Hassan',
        priority: 'Urgent',
        deliveryType: 'Same Day',
        codAmount: 15000,
        attempts: 0
      }
    ];

    // Initialize Pickup Requests
    const pickupRequests: PickupRequest[] = [
      {
        id: 1,
        requestNumber: 'PU-2025-0001',
        customerName: 'Mohamed Ahmed',
        customerPhone: '01012345678',
        customerEmail: 'mohamed@email.com',
        pickupAddress: '123 Zamalek, Cairo',
        city: 'Cairo',
        district: 'Zamalek',
        packageType: 'Documents',
        estimatedWeight: 0.5,
        estimatedPackages: 1,
        preferredDate: new Date('2025-10-01'),
        preferredTimeSlot: 'Morning (9-12)',
        requestDate: new Date('2025-09-29'),
        status: 'Pending',
        priority: 'Normal',
        specialInstructions: 'Please call before arrival'
      },
      {
        id: 2,
        requestNumber: 'PU-2025-0002',
        customerName: 'Fatma Ali',
        customerPhone: '01123456789',
        pickupAddress: '456 Mohandessin, Giza',
        city: 'Giza',
        district: 'Mohandessin',
        packageType: 'Electronics',
        estimatedWeight: 5,
        estimatedPackages: 2,
        preferredDate: new Date('2025-10-01'),
        preferredTimeSlot: 'Afternoon (12-3)',
        requestDate: new Date('2025-09-30'),
        status: 'Approved',
        priority: 'High',
        assignedCourierId: 2,
        assignedCourierName: 'Mohamed Ali',
        branchId: 1,
        branchName: 'Cairo Main Branch',
        scheduledDate: new Date('2025-10-01')
      },
      {
        id: 3,
        requestNumber: 'PU-2025-0003',
        customerName: 'Ali Hassan',
        customerPhone: '01234567890',
        pickupAddress: '789 Helwan, Cairo',
        city: 'Cairo',
        district: 'Helwan',
        packageType: 'Clothing',
        estimatedWeight: 3,
        estimatedPackages: 3,
        preferredDate: new Date('2025-10-02'),
        preferredTimeSlot: 'Anytime',
        requestDate: new Date('2025-09-30'),
        status: 'Scheduled',
        priority: 'Normal',
        assignedCourierId: 4,
        assignedCourierName: 'Youssef Mahmoud',
        branchId: 2,
        branchName: 'Giza Branch',
        scheduledDate: new Date('2025-10-02')
      }
    ];

    // Initialize Hub Packages
    const hubPackages: HubPackage[] = [
      {
        id: 1,
        trackingNumber: 'TRK-2025-0001',
        orderNumber: 'ORD-2025-0010',
        senderName: 'Cairo Store',
        recipientName: 'Ahmed Ali',
        recipientAddress: 'Alexandria City Center',
        packageType: 'Electronics',
        weight: 2.5,
        dimensions: '30x20x15 cm',
        currentHubId: 1,
        currentHubName: 'Cairo Hub',
        destinationHubId: 3,
        destinationHubName: 'Alexandria Hub',
        receivedDate: new Date('2025-09-30'),
        receivedBy: 'Hassan Ibrahim',
        packageCondition: 'Good',
        status: 'Ready for Transfer'
      },
      {
        id: 2,
        trackingNumber: 'TRK-2025-0002',
        orderNumber: 'ORD-2025-0011',
        senderName: 'Giza Shop',
        recipientName: 'Sara Mohamed',
        recipientAddress: 'Cairo Downtown',
        packageType: 'Clothing',
        weight: 1.5,
        currentHubId: 2,
        currentHubName: 'Giza Hub',
        receivedDate: new Date('2025-09-29'),
        receivedBy: 'Omar Khaled',
        packageCondition: 'Excellent',
        conditionRemarks: 'Package in perfect condition',
        status: 'In Storage'
      },
      {
        id: 3,
        trackingNumber: 'TRK-2025-0003',
        orderNumber: 'ORD-2025-0012',
        senderName: 'Alexandria Warehouse',
        recipientName: 'Khaled Ahmed',
        recipientAddress: 'Giza Square',
        packageType: 'Books',
        weight: 4,
        dimensions: '40x30x20 cm',
        currentHubId: 3,
        currentHubName: 'Alexandria Hub',
        destinationHubId: 2,
        destinationHubName: 'Giza Hub',
        receivedDate: new Date('2025-09-28'),
        receivedBy: 'Mohamed Hassan',
        packageCondition: 'Fair',
        conditionRemarks: 'Minor scratches on outer packaging',
        status: 'In Transit',
        transferDate: new Date('2025-09-29'),
        transferredBy: 'Ahmed Ali'
      }
    ];

    this.couriersSubject.next(couriers);
    this.deliveryQueueSubject.next(deliveryQueue);
    this.pickupRequestsSubject.next(pickupRequests);
    this.hubPackagesSubject.next(hubPackages);
  }

  getDashboardStats(): Observable<OperationsDashboardStats> {
    const stats: OperationsDashboardStats = {
      deliveriesCompleted: 45,
      inTransitShipments: 23,
      pendingPickups: 8,
      failedDeliveries: 3,
      todayRevenue: 12500,
      activeRoutes: 15,
      activeCouriers: 12,
      averageDeliveryTime: 45
    };
    return of(stats).pipe(delay(300));
  }

  getBranchPerformance(): Observable<BranchPerformance[]> {
    const performance: BranchPerformance[] = [
      {
        branchId: 1,
        branchName: 'Cairo Main Branch',
        deliveries: 156,
        successRate: 94.5,
        avgDeliveryTime: 42,
        revenue: 45000,
        activeCouriers: 8
      },
      {
        branchId: 2,
        branchName: 'Giza Branch',
        deliveries: 98,
        successRate: 91.2,
        avgDeliveryTime: 48,
        revenue: 28000,
        activeCouriers: 4
      },
      {
        branchId: 3,
        branchName: 'Alexandria Branch',
        deliveries: 76,
        successRate: 89.5,
        avgDeliveryTime: 52,
        revenue: 22000,
        activeCouriers: 3
      }
    ];
    return of(performance).pipe(delay(300));
  }

  getEscalations(): Observable<Escalation[]> {
    const escalations: Escalation[] = [
      {
        id: 1,
        orderId: 123,
        orderNumber: 'ORD-2025-0001',
        type: 'Delay',
        priority: 'High',
        description: 'Delivery delayed by 2 hours',
        reportedBy: 'Customer Service',
        reportedDate: new Date('2025-09-30'),
        status: 'Open',
        assignedTo: 'Operations Manager'
      },
      {
        id: 2,
        orderId: 456,
        orderNumber: 'ORD-2025-0002',
        type: 'Customer Complaint',
        priority: 'Medium',
        description: 'Customer unhappy with delivery time',
        reportedBy: 'Ahmed Hassan',
        reportedDate: new Date('2025-09-29'),
        status: 'In Progress',
        assignedTo: 'Branch Manager'
      }
    ];
    return of(escalations).pipe(delay(300));
  }

  getCouriers(): Observable<Courier[]> {
    return this.couriers$;
  }

  updateCourierStatus(courierId: number, status: 'Available' | 'Busy' | 'On Break' | 'Offline'): Observable<{succeeded: boolean, message: string}> {
    const couriers = this.couriersSubject.value;
    const courier = couriers.find(c => c.id === courierId);
    
    if (courier) {
      courier.status = status;
      this.couriersSubject.next([...couriers]);
      return of({ succeeded: true, message: 'Courier status updated' }).pipe(delay(300));
    }
    
    return of({ succeeded: false, message: 'Courier not found' });
  }

  getDeliveryQueue(): Observable<DeliveryQueueItem[]> {
    return this.deliveryQueue$;
  }

  assignCourierToDelivery(deliveryId: number, courierId: number): Observable<{succeeded: boolean, message: string}> {
    const deliveries = this.deliveryQueueSubject.value;
    const couriers = this.couriersSubject.value;
    
    const delivery = deliveries.find(d => d.id === deliveryId);
    const courier = couriers.find(c => c.id === courierId);
    
    if (delivery && courier) {
      delivery.courierId = courierId;
      delivery.courierName = courier.name;
      delivery.status = 'Assigned';
      
      courier.currentOrders += 1;
      
      this.deliveryQueueSubject.next([...deliveries]);
      this.couriersSubject.next([...couriers]);
      
      return of({ succeeded: true, message: 'Courier assigned successfully' }).pipe(delay(300));
    }
    
    return of({ succeeded: false, message: 'Delivery or courier not found' });
  }

  getPickupRequests(): Observable<PickupRequest[]> {
    return this.pickupRequests$;
  }

  updatePickupRequest(id: number, updates: Partial<PickupRequest>): Observable<{succeeded: boolean, message: string}> {
    const requests = this.pickupRequestsSubject.value;
    const index = requests.findIndex(r => r.id === id);
    
    if (index >= 0) {
      requests[index] = { ...requests[index], ...updates };
      this.pickupRequestsSubject.next([...requests]);
      return of({ succeeded: true, message: 'Pickup request updated' }).pipe(delay(300));
    }
    
    return of({ succeeded: false, message: 'Request not found' });
  }

  getHubPackages(): Observable<HubPackage[]> {
    return this.hubPackages$;
  }

  receivePackageAtHub(packageData: Partial<HubPackage>): Observable<{succeeded: boolean, message: string, data?: HubPackage}> {
    const packages = this.hubPackagesSubject.value;
    const newPackage: HubPackage = {
      ...packageData as HubPackage,
      id: Math.max(...packages.map(p => p.id), 0) + 1
    };
    
    packages.push(newPackage);
    this.hubPackagesSubject.next([...packages]);
    
    return of({ succeeded: true, message: 'Package received successfully', data: newPackage }).pipe(delay(500));
  }

  transferPackage(packageId: number, toHubId: number, toHubName: string, transferredBy: string): Observable<{succeeded: boolean, message: string}> {
    const packages = this.hubPackagesSubject.value;
    const pkg = packages.find(p => p.id === packageId);
    
    if (pkg) {
      pkg.destinationHubId = toHubId;
      pkg.destinationHubName = toHubName;
      pkg.status = 'In Transit';
      pkg.transferDate = new Date();
      pkg.transferredBy = transferredBy;
      
      this.hubPackagesSubject.next([...packages]);
      return of({ succeeded: true, message: 'Package transfer initiated' }).pipe(delay(500));
    }
    
    return of({ succeeded: false, message: 'Package not found' });
  }

  getHubs(): Observable<Hub[]> {
    const hubs: Hub[] = [
      {
        id: 1,
        name: 'Cairo Hub',
        code: 'CAI-HUB-01',
        address: '123 Industrial Zone, Cairo',
        city: 'Cairo',
        phone: '0223456789',
        managerName: 'Ahmed Mohamed',
        capacity: 1000,
        currentLoad: 650,
        isActive: true
      },
      {
        id: 2,
        name: 'Giza Hub',
        code: 'GIZ-HUB-01',
        address: '456 Logistics Area, Giza',
        city: 'Giza',
        phone: '0223456788',
        managerName: 'Mohamed Ali',
        capacity: 800,
        currentLoad: 420,
        isActive: true
      },
      {
        id: 3,
        name: 'Alexandria Hub',
        code: 'ALX-HUB-01',
        address: '789 Port Area, Alexandria',
        city: 'Alexandria',
        phone: '0223456787',
        managerName: 'Hassan Omar',
        capacity: 600,
        currentLoad: 280,
        isActive: true
      }
    ];
    return of(hubs).pipe(delay(300));
  }
}
