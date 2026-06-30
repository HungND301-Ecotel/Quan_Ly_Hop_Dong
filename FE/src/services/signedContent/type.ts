export type SignedContent = {
  id: string;
  title: string;
  name?: string;
  level3CodeId: string;
  level3CodeName?: string;
  isActive?: boolean;
  description?: string;
};
 
export type CreateSignedContentReq = {
  title: string;
  level3CodeId: string;
  description?: string;
};
 
export type UpdateSignedContentReq = {
  id: string;
  title: string;
  level3CodeId: string;
  description?: string;
};
 