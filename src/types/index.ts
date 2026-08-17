// src/types/index.ts

export type TuitionStatus = 'UpToDate' | 'Pending' | 'Overdue';

export interface Product {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  pointsCost: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  totalPoints: number;
  tuitionStatus: TuitionStatus | string;
  pointsEarnedToday?: number;
  remainingPointsToday?: number;
  maxDailyPoints?: number;
}

export interface StudentProfile extends Student {
  totalRedemptions: number;
  pendingRedemptions: number;
  collectedRedemptions: number;
  recentRedemptions: Redemption[];
}

export interface CreateStudentDto {
  name: string;
  email: string;
  password: string;
  tuitionStatus?: number | TuitionStatus;
}

export interface AwardDailyPointsDto {
  assiduidade?: boolean;
  participacao?: boolean;
  fazerTarefa?: boolean;
  observation?: string;
}

export interface DailyPointsSummary {
  studentId: string;
  studentName: string;
  pointsEarnedToday: number;
  remainingPointsToday: number;
  maxDailyPoints: number;
  activitiesCompletedToday: string[];
}

export interface Redemption {
  id: string;
  studentId: string;
  studentName: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  pointsSpent: number;
  voucherCode: string;
  status: 'Pending' | 'Collected' | 'Cancelled' | string;
  createdAt: string;
  expiresAt: string;
  collectedAt?: string;
}

export interface RedemptionResult {
  success: boolean;
  message: string;
  remainingPoints: number;
  redemptionId?: string;
  voucherCode?: string;
  expiresAt?: string;
}

export interface RedemptionValidationResult {
  success: boolean;
  message: string;
  redemption?: Redemption;
}