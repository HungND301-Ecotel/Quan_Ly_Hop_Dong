import { BasicInformationValues } from '@/features/main/contract/edit/basic-information/schema';
import { ContractFormatValues } from '@/features/main/contract/edit/contract-format/schema';
import { SignFlowsValues } from '@/features/main/contract/edit/sign-flows/schema';
import { SignPositionsValues } from '@/features/main/contract/edit/sign-postions/schema';
import { Contract } from '@/services/contract/type';
import { createContext, Dispatch, SetStateAction, useContext } from 'react';

export type ContractEditContextValue = {
  basicInformation?: BasicInformationValues;
  setBasicInformation: Dispatch<
    SetStateAction<BasicInformationValues | undefined>
  >;

  signFlows?: SignFlowsValues;
  setSignFlows: Dispatch<SetStateAction<SignFlowsValues | undefined>>;

  signPositions?: SignPositionsValues;
  setSignPositions: Dispatch<SetStateAction<SignPositionsValues | undefined>>;

  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;

  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;

  contractFormat?: ContractFormatValues;
  setContractFormat: Dispatch<SetStateAction<ContractFormatValues | undefined>>;

  isUpdate?: boolean;
  contract?: Contract;
  loading?: boolean;

  callback?: () => void | Promise<void>;
};

export const ContractEditContext = createContext<
  ContractEditContextValue | undefined
>(undefined);

export function useContractEditContext() {
  const context = useContext(ContractEditContext);
  if (!context) throw new Error('ContractEditContext not found');
  return context;
}
