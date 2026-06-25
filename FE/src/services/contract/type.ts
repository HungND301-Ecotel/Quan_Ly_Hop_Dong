import { ContractAction } from '@/constants/contract-action';

export type ContractType = {
  id: string;
  name: string;
  code: string;
  description: string | null;
};

export enum ContractStatus {
  Draft = 0,
  PendingApproval = 1,
  Effective = 2,
  Expired = 3,
  Liquidated = 4,
  Archive = 5,
}

export enum ContractSubStatusEnum {
  None = 0,
  HardCopyReceivedByAccounting = 1,
}

export type CreateContractReq = {
  level1CodeId: string;
  level2CodeId?: string;
  level2Code?: string;
  level3CodeId: string;
  contractNumber: string;
  appendixNumber?: string;
  paymentPlanType?: number;
  title: string;
  contractStructure?: string;
  procurementMethodId?: string;
  contractTypeId: string;
  contractFieldId?: string;
  contractRegisterId?: string;
  contractFormat: number;
  parentContractId?: string;
  partnerId: string;
  departmentId: string;
  contractValue: number;
  draftDate: string;
  signDeadline: string;
  startDate: string;
  endDate: string;
  notes: string;
  description?: string;
  contractContent?: string;
  contractFilePath: string;
  attachmentFiles?: ContractAttachment[];
  signingFlows: ContractSignFlow[];
  contractUserRoles?: ContractUserRole[];
  paymentSchedules?: PaymentSchedule[];
  contractItems?: ContractItem[];
  contractGuarantee?: ContractGuarantee;
};

export type ContractSignFlow = {
  userId: string;
  sequenceOrder: number;
  signatureType: number;
  positionX?: number;
  positionY?: number;
  pageNumber?: number;
  width?: number;
  height?: number;
};

export type UpdateContractSignFlow = ContractSignFlow & {
  id?: string;
};

export type UpdateContractReq = {
  id: string; // Path parameter
  title: string;
  contractTypeId: string;
  contractFieldId?: string;
  contractFormat: number;
  parentContractId?: string;
  partnerId: string;
  departmentId: string;
  contractValue: number;
  draftDate: string;
  startDate: string;
  endDate: string;
  notes: string;
  description: string;
  status?: string;
  subStatus?: string;
  signingFlows: UpdateContractSignFlow[];
  signDeadline: string;
  level1CodeId?: string;
  level2CodeId?: string;
  level3CodeId?: string;
};

export type ContractAttachment = {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
};

export type ContractItem = {
  materialId: string;
  quantity: number;
  price: number;
};

export type PaymentSchedule = {
  id: string;
  contractId: string;
  amountType?: number;
  amount: number;
  paymentStatus: number;
  days: number;
};

export type ContractUserRole = {
  userId: string;
  role: number;
};

export type ContractUserRoleDetail = {
  userId: string;
  fullname: string;
  departmentId?: string;
  departmentName: string;
  positionName: string;
  role: number;
};

export type BankAccountDetail = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
};

export type ContractGuarantee = {
  guaranteeType: number;
  value: number;
  valueType: number;
  durationValue?: number;
  durationUnit?: number;
  durationDate?: string;
  bankAccountId?: string | null;
  bankAccount?: BankAccountDetail | null;
};


export type UploadContractReq = {
  ContractFile: File;
  ContractNumber: string;
};

export type UploadAttachmentReq = {
  AttachmentFiles: File[];
  ContractNumber: string;
};

export type ChildContractRelationship = {
  childContractId: string;
  childContractTitle: string;
  childContractNumber: string;
  childContractFormat: number;
  relationType: number;
};

export type InvoicesDueSoon = {
  numberInvoice: string;
  dateInvoice: string;
  dueDate: string;
  amount: number;
};

export type Contract = {
  level1CodeId: string;
  level1CodeCode: string;
  level2CodeId?: string;
  level2Code: string;
  level3CodeId: string;
  level3Code: string;
  id: string;
  contractNumber: string;
  title: string;
  contractTypeId: string;
  contractTypeName: string;
  contractFieldId?: string;
  contractFieldName?: string;
  contractFormat: number;
  isDebtTrackingEnabled?: boolean;
  parentContractId?: string;
  parentContractNumber?: string;
  parentContractTitle?: string;
  partnerId: string;
  partnerName: string;
  partnerDetail?: {
    id: string;
    name: string;
    taxCode: string;
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
  } | null;
  departmentId: string;
  departmentName: string;
  contractValue: number;
  vatPercentage: number;
  contractValueAfterVat?: number;
  draftDate: string;
  signDeadline: string;
  signingDate: string;
  effectiveDate: string;
  completionDate: string;
  warrantyExpirationDate: string;
  status: string;
  subStatus: string;
  contractName: string;
  filePath: string;
  signedFilePath: string | null;
  notes: string;
  isArchiveContract?: boolean
  description: string;
  signingFlows:
  | {
    id: string;
    contractId: string;
    userId: string;
    userName: string;
    fullName: string;
    role: number;
    sequenceOrder: number;
    signatureType: number;
    positionX: number;
    positionY: number;
    pageNumber: number;
    width: number;
    height: number;
    status: string;
    signedAt: string | null;
    rejectionReason: string | null;
    revisionNotes: string | null;
    departmentId: string;
    departmentName: string;
  }[]
  | null;
  contractStructure?: string;
  contractStructureId?: string;
  contractStructureName?: string;
  appendixNumber?: string;
  paymentPlanType?: number;
  procurementMethodId?: string;
  procurementMethodCode?: string;
  procurementMethodName?: string;
  contractRegisterId?: string;
  contractRegisterName?: string;
  contractUserRoles?: ContractUserRoleDetail[];
  paymentSchedules?: PaymentSchedule[];
  contractItems?: (ContractItem & {
    materialCode?: string;
    materialName?: string;
    unitOfMeasureName?: string;
    amount?: number;
    price?: number;
  })[];
  contractOthersValue?: number;
  contractOtherItems?: {
    materialId: string;
    materialName?: string;
    unitOfMeasureName?: string;
    quantity: number;
    price?: number;
  }[];
  discountType?: number;
  discountValue?: number;
  contractGuarantee?: ContractGuarantee[];
  contractGuarantees?: {
    performanceBondGuarantee?: ContractGuarantee;
    warrantyBondGuarantee?: ContractGuarantee;
    depositGuarantee?: ContractGuarantee;
  };
  childContractRelationships?: ChildContractRelationship[];
  attachments: ContractAttachment[] | null;
  invoicesDueSoon?: InvoicesDueSoon[];
};

export type ContractSignHistory = {
  id: string;
  contractId: string;
  userId: string;
  userName: string;
  fullName: string;
  positionId: string;
  positionName: string;
  action: ContractAction | null;
  fromStatus: string;
  toStatus: string;
  fromSubStatus: string;
  toSubStatus: string;
  comment?: string;
  createdOn: string;
};

export type RejectContractReq = {
  contractId: string;
  action: number;
  rejectionReason: string;
};

export type ApproveContractReq = {
  contractId: string;
  action: number;
  signatureId: string;
  signingFlowPositions?: {
    positionX: number;
    positionY: number;
    pageNumber: number;
    width: number;
    height: number;
  };
};
