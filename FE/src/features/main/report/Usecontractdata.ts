import { useCallback, useEffect, useState } from 'react';
import { ContractRecord, mapApiResponseToContract } from './api/Apimapper';
import { contractPaymentService } from '@/services/contract-payment/index';
import { GetContractReportsReq } from '@/services/contract-payment/type';

export interface UseContractDataOptions {
    contractTypeId?: string;
    contractStructureCatalogId?: string;
    procurementMethodId?: string;
    partnerId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    isLiquidated?: boolean;
    isAutoLiquidated?: boolean;
    endDateFrom?: string;
    endDateTo?: string;
    endDate?: string;
}

export function useContractData(options: UseContractDataOptions = {}) {
    const [data, setData] = useState<ContractRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const req: GetContractReportsReq = {
                ContractTypeId: options.contractTypeId,  // ← truyền vào
                ContractStructureCatalogId: options.contractStructureCatalogId,
                ProcurementMethodId: options.procurementMethodId,
                PartnerId: options.partnerId,
                StartDateFrom: options.startDateFrom,
                EndDate: options.endDate,
                IsLiquidated: options.isLiquidated,
                IsAutoLiquidated: options.isAutoLiquidated,
                StartDateTo: options.startDateTo,
                EndDateFrom: options.endDateFrom,
                EndDateTo: options.endDateTo,
            };

            const apiData = await contractPaymentService.getContractReports(req);
            const mappedData = (apiData ?? []).map((item, index) =>
                mapApiResponseToContract(item, index)
            );
            setData(mappedData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [
        options.contractTypeId,
        options.contractStructureCatalogId,
        options.procurementMethodId,
        options.startDateFrom,
        options.startDateTo,
        options.endDateFrom,
        options.endDateTo,
        options.partnerId,
        options.endDate,
        options.isLiquidated,       // ← thêm
        options.isAutoLiquidated,   // ← thêm
    ]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    return { data, loading, error, refetch: fetchContracts };
}