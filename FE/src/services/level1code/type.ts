export type Level1Code = {
  id: string;
  code: string;
  description: string;
  contractTypeId: string;
  contractTypeName?: string;
  isActive?: boolean;
};
 
export type CreateLevel1CodeReq = {
  code: string;
  description: string;
  contractTypeId: string;
};
 
export type UpdateLevel1CodeReq = {
  id: string;
  code: string;
  description: string;
  contractTypeId: string;
};
 