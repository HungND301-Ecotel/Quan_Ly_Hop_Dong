import { Step } from '@/components/stepper/type';
import { ContractArchiveReviewForm } from '@/features/main/contract/archive/create/review';
import { ContractBasicInformationForm } from '@/features/main/contract/edit/basic-information/form';
import { ContractFormatForm } from '@/features/main/contract/edit/contract-format/form';
 
export const CONTRACT_ARCHIVE_STEPS: Step[] = [
  {
    code: 'contract-format',
    title: 'Mẫu hợp đồng',
    content: <ContractFormatForm isArchive />,
  },
  {
    code: 'contract-basic-information',
    title: 'Thông tin hợp đồng',
    content: <ContractBasicInformationForm />,
  },
  {
    code: 'contract-review',
    title: 'Kiểm tra và hoàn tất',
    content: <ContractArchiveReviewForm />,
  },
];
 