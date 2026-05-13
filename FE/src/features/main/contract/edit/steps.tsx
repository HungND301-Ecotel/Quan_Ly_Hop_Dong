import { Step } from '@/components/stepper/type';
import { ContractBasicInformationForm } from '@/features/main/contract/edit/basic-information/form';
import { ContractFormatForm } from '@/features/main/contract/edit/contract-format/form';
import { ContractReviewForm } from '@/features/main/contract/edit/review/form';
import { ContractSignFlowsForm } from '@/features/main/contract/edit/sign-flows/form';
import { ContractSignPostionsForm } from '@/features/main/contract/edit/sign-postions/form';

export const CONTRACT_EDIT_STEPS: Step[] = [
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
    content: <ContractReviewForm />,
  },
];
