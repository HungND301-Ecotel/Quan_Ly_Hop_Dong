export type Material = {
  id: string;
  materialCode: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  price: number;
  isOtherMaterial?: boolean;
};

export type CreateMaterialReq = {
  materialCode: string;
  name: string;
  unitOfMeasureId: string;
  price: number;
  isOtherMaterial?: boolean;
};

export type UpdateMaterialReq = {
  id: string;           // cần id để biết update cái nào
  materialCode: string;
  name: string;
  unitOfMeasureId: string;
  price: number;
  isOtherMaterial?: boolean;
};