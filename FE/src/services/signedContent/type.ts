export type SignedContent = {
  id: string;
  title: string;
  name?: string;
  level3CodeId: string;
  level3CodeName?: string;
  isActive?: boolean;
};
 
export type CreateSignedContentReq = {
  title: string;
  level3CodeId: string;
};
 
export type UpdateSignedContentReq = {
  id: string;
  title: string;
  level3CodeId: string;
};
 