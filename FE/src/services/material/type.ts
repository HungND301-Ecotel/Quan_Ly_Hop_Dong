export type Material = {
  id: string;
  materialCode: string;
  name: string;
  unitOfMeasureId: string | null;
  unitOfMeasureName: string | null;
  price: number | null;
  isOtherMaterial?: boolean;
  isSynced?: boolean;
};

export type CreateMaterialReq = {
  materialCode: string;
  name: string;
  unitOfMeasureId: string | null;
  price: number | null;
  isOtherMaterial?: boolean;
};

export type UpdateMaterialReq = {
  id: string;           // cần id để biết update cái nào
  materialCode: string;
  name: string;
  unitOfMeasureId: string | null;
  price: number | null;
  isOtherMaterial?: boolean;
};