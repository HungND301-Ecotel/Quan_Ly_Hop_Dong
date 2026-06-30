export type User = {
  id: string;
  userName: string;
  fullname: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  role: number;
  positionId: string;
  positionName: string;
  isVerifiedPhone: boolean | null;
  employeeCode?: string;
  note?: string;
  isVerifiedEmail: boolean | null;
  registerProvider: string | null;
  departments: {
    departmentId: string;
    departmentName: string;
    isPrimary: boolean;
  }[];
  signatures: {
    id: string;
    userId: string;
    signatureType: number;
    signatureFile: string;
    certificateId: string | null;
    isPinSaved: boolean;
    isDefault: boolean;
  }[];
};

export type CreateSignatureReq = {
  SignatureType: number;
  SignatureFile?: File;
  Pin: string;
  SavePin: boolean;
};

export type CreateUserReq = {
  userName: string;
  fullname: string;
  phoneNumber: string;
  email: string;
  password?: string;
  userRole: number;
  departmentId: string;
  positionId: string;
  employeeCode?: string;
  note?: string;
};

export type UpdateUserReq = {
  id: string;
  fullname: string;
  phoneNumber: string;
  email: string;
  role: number;
  positionId: string;
  department: string;
  employeeCode?: string;
  note?: string;
};
