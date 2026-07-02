export type User = {
  lastLogin?: string;
  active: boolean;
  isVerifiedPhone: boolean;
  isVerifiedEmail: boolean;
  registerProvider: string;
  departmentId: string;
  departmentName: string;
  signatures: UserSignature[];
  id: string;
  userName: string;
  fullname: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  role: number;
  positionId: string;
  positionName: string | null;
  employeeCode?: string;
  note?: string;
};

type UserSignature = {
  id: string;
  userId: string;
  signatureType: number;
  signatureFile: string;
  certificateId?: number;
  isPinSaved: boolean;
  isDefault: boolean;
  createdOn: string;
};
