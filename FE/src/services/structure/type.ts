export type ContractStructureCatalog = {
  id: string;
  name: string;
  isActive?: boolean;
};
 
export type CreateContractStructureCatalogReq = {
  name: string;
};
 
export type UpdateContractStructureCatalogReq = {
  id: string;
  name: string;
  isActive?: boolean;
};
 