import { Step } from '@/components/stepper/type';
import { ContractBasicInformationForm } from '@/features/main/contract/edit/basic-information/form';
import { ContractFormatForm } from '@/features/main/contract/edit/contract-format/form';
import { ContractSignFlowsForm } from '@/features/main/contract/edit/sign-flows/form';
import { ContractSignPostionsForm } from '@/features/main/contract/edit/sign-postions/form';
import { ContractRenewReviewForm } from './ContractRenewReviewForm';

// Steps cho hợp đồng phê duyệt (có luồng ký)
export const CONTRACT_RENEW_STEPS: Step[] = [
  {
    code: 'contract-format',
    title: 'Mẫu hợp đồng',
    content: <ContractFormatForm />,
  },
  {
    code: 'contract-basic-information',
    title: 'Thông tin hợp đồng',
    content: <ContractBasicInformationForm />,
  },
  {
    code: 'contract-signers',
    title: 'Thành phần ký',
    content: <ContractSignFlowsForm />,
  },
  {
    code: 'contract-sign-positions',
    title: 'Vị trí ký',
    content: <ContractSignPostionsForm />,
  },
  {
    code: 'contract-review',
    title: 'Kiểm tra và hoàn tất',
    content: <ContractRenewReviewForm />,
  },
];

// Steps cho hợp đồng lưu trữ (không có luồng ký)
export const CONTRACT_RENEW_ARCHIVE_STEPS: Step[] = [
  {
    code: 'contract-format',
    title: 'Mẫu hợp đồng',
    content: <ContractFormatForm />,
  },
  {
    code: 'contract-basic-information',
    title: 'Thông tin hợp đồng',
    content: <ContractBasicInformationForm />,
  },
  {
    code: 'contract-review',
    title: 'Kiểm tra và hoàn tất',
    content: <ContractRenewReviewForm />,
  },
];