export type ContractStructureCatalog = {
  id: string;
  name: string;
  code?: string | null;
  description?: string;
  isActive?: boolean;
};
 
export type CreateContractStructureCatalogReq = {
  name: string;
  code?: string | null;
  description?: string;
  isActive?: boolean;
};
 
export type UpdateContractStructureCatalogReq = {
  id: string;
  name: string;
  code?: string | null;
  description?: string;
  isActive?: boolean;
};
 