export type UserRole = 'guide' | 'staff';

export interface GuideInfo {
  lastName: string;
  firstName: string;
  phone: string;
}

export interface Booking {
  id: string;
  guideId: string;
  guideName: string;
  groupName: string;
  arrivalDate: string;
  arrivalTime: string;
  maleTourists: number;
  femaleTourists: number;
  saunaMale: number;
  saunaFemale: number;
  guide: GuideInfo;
  busNumber: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
}

export type BookingFormData = Omit<Booking, 'id' | 'guideId' | 'guideName' | 'status' | 'createdAt' | 'updatedAt'>;
