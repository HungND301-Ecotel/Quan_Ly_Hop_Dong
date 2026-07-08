import { BasicInformationValues } from '@/features/main/contract/edit/basic-information/schema';
import {
  ContractEditContext,
  ContractEditContextValue,
} from '@/features/main/contract/edit/context';
import { ContractFormatValues } from '@/features/main/contract/edit/contract-format/schema';
import { SignFlowsValues } from '@/features/main/contract/edit/sign-flows/schema';
import { SignPositionsValues } from '@/features/main/contract/edit/sign-postions/schema';
import { contractService } from '@/services/contract';
import { useQuery } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';

export type ContractCreateProviderProps = PropsWithChildren<{
  contractId?: string;
  callback?: () => void | Promise<void>;
  defaultFormat?: number;
  defaultIsDebtTracking?: boolean;
  defaultParentContractId?: string;
  defaultBasicInformation?: Partial<BasicInformationValues>;
}>;

export function ContractEditProvider({
  children,
  contractId,
  callback,
  defaultFormat, // ← Nhận prop
  defaultIsDebtTracking, // ← Nhận prop
  defaultParentContractId, // ← Nhận prop
  defaultBasicInformation,
}: ContractCreateProviderProps) {
  const [contractFormat, setContractFormat] = useState<ContractFormatValues | undefined>(() => {
    if (!contractId && (defaultFormat !== undefined || defaultIsDebtTracking !== undefined)) {
      return {
        contractFormat: defaultFormat,
        isDebtTrackingEnabled: defaultIsDebtTracking,
        parentContractId: defaultParentContractId, // ← thêm
      } as ContractFormatValues;
    }
    return undefined;
  });
  const [basicInformation, setBasicInformation] = useState<BasicInformationValues | undefined>(() => {
    if (!contractId && defaultBasicInformation) {
      return defaultBasicInformation as BasicInformationValues;
    }
    return undefined;
  });
  const [signFlows, setSignFlows] = useState<SignFlowsValues>();
  const [signPositions, setSignPositions] = useState<SignPositionsValues>();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);

  const { data, isPending } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => {
      return contractId
        ? contractService.getContractDetail(contractId)
        : undefined;
    },
  });

  useEffect(() => {
    if (!contractId || !data) return;

    // Load contractFormat từ contract
    setContractFormat({
      contractFormat: data.contractFormat,
      isDebtTrackingEnabled: data.isDebtTrackingEnabled,
      parentContractId: data.parentContractId,
    } as ContractFormatValues);

    // Load signingFlows vào signPositions
    if (data.signingFlows && data.signingFlows.length > 0) {
      const positions: any[] = [];
      data.signingFlows.forEach((flow) => {
        if (flow.signPositions) {
          try {
            const parsed = JSON.parse(flow.signPositions);
            if (Array.isArray(parsed)) {
              parsed.forEach((pos) => {
                positions.push({
                  userId: flow.userId,
                  signatureType: flow.signatureType,
                  sequenceOrder: flow.sequenceOrder,
                  positionX: pos.positionX,
                  positionY: pos.positionY,
                  pageNumber: pos.pageNumber,
                  width: pos.width,
                  height: pos.height,
                  fileIndex: pos.fileIndex ?? 0,
                });
              });
              return;
            }
          } catch (e) {
            console.error('Failed to parse signPositions', e);
          }
        }

        positions.push({
          userId: flow.userId,
          positionX: flow.positionX,
          positionY: flow.positionY,
          pageNumber: flow.pageNumber,
          signatureType: flow.signatureType,
          sequenceOrder: flow.sequenceOrder,
          width: flow.width,
          height: flow.height,
          fileIndex: 0,
        });
      });

      setSignPositions({
        postions: positions,
      });
    }

    // Load signers vào signFlows
    if (data.signingFlows && data.signingFlows.length > 0) {
      setSignFlows({
        signers: data.signingFlows.map((flow) => ({
          signerId: flow.userId,
          signTypeId: String(flow.signatureType),
          departmentId: flow.departmentId || '',
        })),
      });
    }
  }, [contractId, data]);

  const value: ContractEditContextValue = {
    contractFormat,
    setContractFormat,
    basicInformation,
    setBasicInformation,
    signFlows,
    setSignFlows,
    signPositions,
    setSignPositions,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    isUpdate: !!contractId,
    contract: data,
    loading: isPending,
    callback,
  };

  return (
    <ContractEditContext.Provider value={value}>
      {children}
    </ContractEditContext.Provider>
  );
}