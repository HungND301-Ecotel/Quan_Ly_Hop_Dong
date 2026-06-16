export type Level1Code = {
  id: string;
  code: string;
  description: string;
  contractTypeId: string;
  contractTypeName?: string;
  contractRegisterId?: string;
  contractRegisterName?: string;
  isActive?: boolean;
};
 
export type CreateLevel1CodeReq = {
  code: string;
  description: string;
  contractTypeId: string;
  contractRegisterId: string;
};
 
export type UpdateLevel1CodeReq = {
  id: string;
  code: string;
  description: string;
  contractTypeId: string;
  contractRegisterId: string;
};
 