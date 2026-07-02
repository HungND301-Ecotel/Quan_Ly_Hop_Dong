export type Level2Code = {
  id: string;
  code: string;
  description?: string;
  level1CodeId: string;
  level1CodeName?: string;
  isActive?: boolean;
};

export type Level2CodeLookup = {
  id: string;
  code: string;
};

export type CreateLevel2CodeReq = {
  code: string;
  description?: string;
  level1CodeId: string;
};

export type UpdateLevel2CodeReq = {
  id: string;
  code: string;
  description?: string;
  level1CodeId: string;
};
