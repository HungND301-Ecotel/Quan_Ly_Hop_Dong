import { useAuthContext } from '@/features/context';
import { MapPinnedIcon, PhoneIcon, PrinterIcon, Text, Webcam } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

export function AuthLayout() {
  const { user } = useAuthContext();

  if (user) return <Navigate to='/' />;

  return (
    // background fade from bottom to center, from primary to transparent
    <div className='w-screen h-screen flex flex-col gap-4'>
      <header className='bg-primary border-b flex text-primary-foreground flex-col items-center justify-center gap-2 py-6'>
        <h1 className='uppercase text-4xl font-bold'>
          Phần mềm quản lý hợp đồng
        </h1>
        <h3 className='uppercase font-bold text-xl'>
          CÔNG TY TNHH ECOTEL
        </h3>
        <p className='flex flex-wrap gap-4 text-base justify-center'>
          <span className='flex gap-2 items-center'>
            <PhoneIcon className='size-5' /> <b>Điện thoại:</b> 0378665822
          </span>
          <span className='flex gap-2 items-center'>
            <PrinterIcon className='size-5' /> <b>Email:</b> info@ecotel.com.vn
          </span>
          <span className='flex gap-2 items-center'>
            <Webcam className='size-4' /> <b>Website:</b> ecotel.com.vn
          </span>
          <span className='flex gap-2 items-center'>
            <Text className='size-4' /> <b>MST:</b> 0110782543
          </span>
          <span className='flex gap-2 items-center w-full justify-center'>
            <MapPinnedIcon className='size-5' /> <b>Địa chỉ:</b> Số 4-Q28, 136 Ngõ Nguyễn An Ninh, Phường Tương Mai, Thành phố Hà Nội
          </span>
        </p>
      </header>

      <div className='flex-1 px-4 flex items-center justify-center'>
        <Outlet />
      </div>
    </div>
  );
}
