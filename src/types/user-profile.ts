export interface ResidentProfile {
  uid: string;
  fullName: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfile {
  uid: string;
  fullName: string | null;
  idNumber: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
