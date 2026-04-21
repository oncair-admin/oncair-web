import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { CustomerFeedback, FeedbackStatistics, CourierPerformance } from '../models/feedback.models';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private feedbacksSubject = new BehaviorSubject<CustomerFeedback[]>([]);
  public feedbacks$ = this.feedbacksSubject.asObservable();

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData(): void {
    const feedbacks: CustomerFeedback[] = [
      {
        id: 1,
        orderId: 1,
        orderNumber: 'ORD-2025-0001',
        customerId: 101,
        customerName: 'Ahmed Mohamed',
        customerEmail: 'ahmed@email.com',
        customerPhone: '01012345678',
        courierId: 1,
        courierName: 'Ahmed Hassan',
        deliveryDate: new Date('2025-09-24'),
        feedbackDate: new Date('2025-09-25'),
        overallRating: 5,
        courierRating: 5,
        deliverySpeedRating: 5,
        packageConditionRating: 5,
        communicationRating: 5,
        deliveryExperience: 'Excellent',
        wouldRecommend: true,
        positiveComments: 'Excellent service! The courier was very professional and on time.',
        status: 'Reviewed',
        reviewedBy: 'Support Team',
        reviewedDate: new Date('2025-09-26'),
        isPublic: true,
        isVerified: true
      },
      {
        id: 2,
        orderId: 2,
        orderNumber: 'ORD-2025-0002',
        customerId: 102,
        customerName: 'Sara Ahmed',
        customerPhone: '01123456789',
        courierId: 2,
        courierName: 'Mohamed Ali',
        deliveryDate: new Date('2025-09-23'),
        feedbackDate: new Date('2025-09-24'),
        overallRating: 4,
        courierRating: 4,
        deliverySpeedRating: 4,
        packageConditionRating: 5,
        communicationRating: 3,
        deliveryExperience: 'Good',
        wouldRecommend: true,
        positiveComments: 'Good delivery, but courier could communicate better.',
        issueCategories: ['Poor Communication'],
        status: 'Reviewed',
        isPublic: true,
        isVerified: true
      },
      {
        id: 3,
        orderId: 3,
        orderNumber: 'ORD-2025-0003',
        customerId: 103,
        customerName: 'Khaled Omar',
        customerPhone: '01234567890',
        courierId: 3,
        courierName: 'Omar Khaled',
        deliveryDate: new Date('2025-09-22'),
        feedbackDate: new Date('2025-09-22'),
        overallRating: 2,
        courierRating: 2,
        deliverySpeedRating: 1,
        packageConditionRating: 3,
        communicationRating: 2,
        deliveryExperience: 'Poor',
        wouldRecommend: false,
        negativeComments: 'Delivery was late and courier did not call before arrival.',
        issueCategories: ['Late Delivery', 'Poor Communication'],
        status: 'Addressed',
        reviewedBy: 'Manager',
        reviewedDate: new Date('2025-09-23'),
        adminResponse: 'We apologize for the inconvenience. We have addressed this with the courier.',
        isPublic: false,
        isVerified: true
      },
      {
        id: 4,
        orderId: 4,
        orderNumber: 'ORD-2025-0004',
        customerId: 104,
        customerName: 'Nour Hassan',
        customerEmail: 'nour@email.com',
        customerPhone: '01098765432',
        courierId: 4,
        courierName: 'Youssef Mahmoud',
        deliveryDate: new Date('2025-09-26'),
        feedbackDate: new Date('2025-09-27'),
        overallRating: 5,
        courierRating: 5,
        deliverySpeedRating: 5,
        packageConditionRating: 5,
        communicationRating: 5,
        deliveryExperience: 'Excellent',
        wouldRecommend: true,
        positiveComments: 'Amazing service! Very professional and friendly courier.',
        suggestions: 'Keep up the great work!',
        status: 'Reviewed',
        isPublic: true,
        isVerified: true
      },
      {
        id: 5,
        orderId: 5,
        orderNumber: 'ORD-2025-0005',
        customerId: 105,
        customerName: 'Yasmin Ahmed',
        customerPhone: '01154321098',
        courierId: 1,
        courierName: 'Ahmed Hassan',
        deliveryDate: new Date('2025-09-28'),
        feedbackDate: new Date('2025-09-29'),
        overallRating: 3,
        courierRating: 3,
        deliverySpeedRating: 2,
        packageConditionRating: 4,
        communicationRating: 3,
        deliveryExperience: 'Average',
        wouldRecommend: true,
        negativeComments: 'Delivery was slightly delayed but package was in good condition.',
        issueCategories: ['Late Delivery'],
        status: 'Pending',
        isPublic: false,
        isVerified: true
      },
      {
        id: 6,
        orderId: 6,
        orderNumber: 'ORD-2025-0006',
        customerId: 106,
        customerName: 'Ali Hassan',
        customerPhone: '01210987654',
        courierId: 2,
        courierName: 'Mohamed Ali',
        deliveryDate: new Date('2025-09-25'),
        feedbackDate: new Date('2025-09-26'),
        overallRating: 1,
        courierRating: 1,
        deliverySpeedRating: 1,
        packageConditionRating: 1,
        communicationRating: 1,
        deliveryExperience: 'Very Poor',
        wouldRecommend: false,
        negativeComments: 'Package was damaged and delivery was very late. Very disappointed.',
        issueCategories: ['Late Delivery', 'Damaged Item'],
        status: 'Addressed',
        reviewedBy: 'Operations Manager',
        reviewedDate: new Date('2025-09-27'),
        adminResponse: 'We sincerely apologize. We have processed a full refund and will retrain the courier.',
        isPublic: false,
        isVerified: true
      }
    ];

    this.feedbacksSubject.next(feedbacks);
  }

  getAllFeedbacks(): Observable<CustomerFeedback[]> {
    return this.feedbacks$;
  }

  getFeedbackById(id: number): Observable<CustomerFeedback | undefined> {
    const feedbacks = this.feedbacksSubject.value;
    return of(feedbacks.find(f => f.id === id));
  }

  getStatistics(): Observable<FeedbackStatistics> {
    const feedbacks = this.feedbacksSubject.value;
    
    const stats: FeedbackStatistics = {
      totalFeedbacks: feedbacks.length,
      averageOverallRating: this.calculateAverage(feedbacks.map(f => f.overallRating)),
      averageCourierRating: this.calculateAverage(feedbacks.map(f => f.courierRating)),
      averageDeliverySpeedRating: this.calculateAverage(feedbacks.map(f => f.deliverySpeedRating)),
      averagePackageConditionRating: this.calculateAverage(feedbacks.map(f => f.packageConditionRating)),
      averageCommunicationRating: this.calculateAverage(feedbacks.map(f => f.communicationRating)),
      recommendationRate: (feedbacks.filter(f => f.wouldRecommend).length / feedbacks.length) * 100,
      pendingFeedbacks: feedbacks.filter(f => f.status === 'Pending').length,
      topCouriers: this.getTopCouriers(feedbacks),
      issueBreakdown: this.getIssueBreakdown(feedbacks)
    };
    
    return of(stats).pipe(delay(300));
  }

  private calculateAverage(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return parseFloat((sum / ratings.length).toFixed(2));
  }

  private getTopCouriers(feedbacks: CustomerFeedback[]): CourierPerformance[] {
    const courierMap = new Map<number, CourierPerformance>();
    
    feedbacks.forEach(feedback => {
      if (!courierMap.has(feedback.courierId)) {
        courierMap.set(feedback.courierId, {
          courierId: feedback.courierId,
          courierName: feedback.courierName,
          totalDeliveries: 0,
          averageRating: 0,
          totalFeedbacks: 0,
          recommendationRate: 0,
          positivePercentage: 0
        });
      }
      
      const courier = courierMap.get(feedback.courierId)!;
      courier.totalDeliveries++;
      courier.totalFeedbacks++;
    });
    
    // Calculate averages
    courierMap.forEach((courier) => {
      const courierFeedbacks = feedbacks.filter(f => f.courierId === courier.courierId);
      courier.averageRating = this.calculateAverage(courierFeedbacks.map(f => f.courierRating));
      courier.recommendationRate = (courierFeedbacks.filter(f => f.wouldRecommend).length / courierFeedbacks.length) * 100;
      courier.positivePercentage = (courierFeedbacks.filter(f => f.overallRating >= 4).length / courierFeedbacks.length) * 100;
    });
    
    return Array.from(courierMap.values())
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);
  }

  private getIssueBreakdown(feedbacks: CustomerFeedback[]): any[] {
    const issueMap = new Map<string, number>();
    
    feedbacks.forEach(feedback => {
      if (feedback.issueCategories) {
        feedback.issueCategories.forEach(category => {
          issueMap.set(category, (issueMap.get(category) || 0) + 1);
        });
      }
    });
    
    const total = Array.from(issueMap.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(issueMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  updateFeedback(id: number, updates: Partial<CustomerFeedback>): Observable<{succeeded: boolean, message: string}> {
    const feedbacks = this.feedbacksSubject.value;
    const index = feedbacks.findIndex(f => f.id === id);
    
    if (index >= 0) {
      feedbacks[index] = { ...feedbacks[index], ...updates };
      this.feedbacksSubject.next([...feedbacks]);
      return of({ succeeded: true, message: 'Feedback updated successfully' }).pipe(delay(300));
    }
    
    return of({ succeeded: false, message: 'Feedback not found' });
  }
}

