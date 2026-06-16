export type Level3Code = {
  id: string;
  code: string;
  description: string;
  level1CodeId: string;
  level1CodeName?: string;
  level2CodeId?: string;
  level2CodeName?: string;
  isActive?: boolean;
};
 
export type CreateLevel3CodeReq = {
  code: string;
  description: string;
  level1CodeId: string;
  level2CodeId?: string;
};
 
export type UpdateLevel3CodeReq = {
  id: string;
  code: string;
  description: string;
  level1CodeId: string;
  level2CodeId?: string;
};