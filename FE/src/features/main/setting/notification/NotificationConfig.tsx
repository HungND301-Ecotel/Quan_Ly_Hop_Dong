import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Save,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

interface NotificationConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  daysBeforeNotification: number;
  icon: React.ReactNode;
  category: 'status' | 'countdown';
}

const NotificationSettings = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configs, setConfigs] = useState<NotificationConfig[]>([
    {
      id: 'contract_created',
      name: 'Hợp đồng được tạo mới',
      description: 'Thông báo khi có hợp đồng mới được tạo trong hệ thống',
      enabled: true,
      daysBeforeNotification: 0,
      icon: <FileText className='w-5 h-5 text-green-600' />,
      category: 'status',
    },
    {
      id: 'contract_rejected',
      name: 'Hợp đồng bị từ chối',
      description:
        'Thông báo khi hợp đồng bị từ chối hoặc không được phê duyệt',
      enabled: true,
      daysBeforeNotification: 0,
      icon: <XCircle className='w-5 h-5 text-red-600' />,
      category: 'status',
    },
    {
      id: 'contract_approved',
      name: 'Hợp đồng được phê duyệt',
      description: 'Thông báo khi hợp đồng được phê duyệt thành công',
      enabled: true,
      daysBeforeNotification: 0,
      icon: <CheckCircle className='w-5 h-5 text-blue-600' />,
      category: 'status',
    },
    {
      id: 'contract_expiring',
      name: 'Hợp đồng sắp hết hạn',
      description: 'Nhắc nhở khi hợp đồng sắp đến ngày hết hạn',
      enabled: true,
      daysBeforeNotification: 30,
      icon: <AlertTriangle className='w-5 h-5 text-orange-600' />,
      category: 'countdown',
    },
    {
      id: 'contract_signing_due',
      name: 'Hợp đồng đến hạn/quá hạn ký',
      description: 'Cảnh báo khi hợp đồng đến hạn hoặc quá hạn ký kết',
      enabled: true,
      daysBeforeNotification: 7,
      icon: <AlertTriangle className='w-5 h-5 text-red-600' />,
      category: 'countdown',
    },
    {
      id: 'payment_reminder',
      name: 'Sắp đến kỳ thanh toán',
      description: 'Nhắc nhở trước kỳ thanh toán theo hợp đồng',
      enabled: true,
      daysBeforeNotification: 15,
      icon: <Clock className='w-5 h-5 text-purple-600' />,
      category: 'countdown',
    },
    {
      id: 'inspection_reminder',
      name: 'Lịch nghiệm thu sắp đến',
      description: 'Nhắc nhở trước lịch nghiệm thu công trình/dịch vụ',
      enabled: true,
      daysBeforeNotification: 10,
      icon: <Calendar className='w-5 h-5 text-indigo-600' />,
      category: 'countdown',
    },
    {
      id: 'contract_validity_ending',
      name: 'Hợp đồng sắp hết hiệu lực',
      description: 'Cảnh báo khi hợp đồng sắp hết hiệu lực pháp lý',
      enabled: true,
      daysBeforeNotification: 45,
      icon: <AlertTriangle className='w-5 h-5 text-yellow-600' />,
      category: 'countdown',
    },
  ]);

  const handleToggle = (id: string) => {
    setConfigs(
      configs.map((config) =>
        config.id === id ? { ...config, enabled: !config.enabled } : config
      )
    );
  };

  const handleDaysChange = (id: string, value: string) => {
    const days = parseInt(value) || 0;
    setConfigs(
      configs.map((config) =>
        config.id === id
          ? { ...config, daysBeforeNotification: Math.max(0, days) }
          : config
      )
    );
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const statusConfigs = configs.filter((c) => c.category === 'status');
  const countdownConfigs = configs.filter((c) => c.category === 'countdown');

  return (
    <>
      <div className='mx-auto space-y-6'>
        {saveSuccess && (
          <Alert className='border-green-200 bg-green-50'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <AlertDescription className='text-green-800'>
              Cấu hình đã được lưu thành công!
            </AlertDescription>
          </Alert>
        )}

        {/* Status Notifications */}
        <Card className='shadow-lg'>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              Thông báo theo trạng thái hợp đồng
            </CardTitle>
            <CardDescription>
              Nhận thông báo khi trạng thái hợp đồng thay đổi
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6 space-y-4'>
            {statusConfigs.map((config) => (
              <div
                key={config.id}
                className='flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-md transition-shadow'
              >
                <div className='flex items-start gap-3 flex-1'>
                  <div className='mt-1'>{config.icon}</div>
                  <div className='flex-1'>
                    <Label className='text-base font-semibold text-slate-800'>
                      {config.name}
                    </Label>
                    <p className='text-sm text-slate-600 mt-1'>
                      {config.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() => handleToggle(config.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Countdown Notifications */}
        <Card className='shadow-lg'>
          <CardHeader className='bg-gradient-to-r from-orange-50 to-yellow-50'>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='w-5 h-5' />
              Thông báo đếm ngược & nhắc nhở
            </CardTitle>
            <CardDescription>
              Cấu hình số ngày thông báo trước các sự kiện quan trọng
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6 space-y-4'>
            {countdownConfigs.map((config) => (
              <div
                key={config.id}
                className='p-4 rounded-lg border bg-white hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between gap-4 mb-3'>
                  <div className='flex items-start gap-3 flex-1'>
                    <div className='mt-1'>{config.icon}</div>
                    <div className='flex-1'>
                      <Label className='text-base font-semibold text-slate-800'>
                        {config.name}
                      </Label>
                      <p className='text-sm text-slate-600 mt-1'>
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={() => handleToggle(config.id)}
                  />
                </div>
                {config.enabled && (
                  <div className='flex items-center gap-3 ml-8 mt-3 bg-slate-50 p-3 rounded-md'>
                    <Label
                      htmlFor={`days-${config.id}`}
                      className='text-sm font-medium text-slate-700 whitespace-nowrap'
                    >
                      Thông báo trước:
                    </Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        id={`days-${config.id}`}
                        type='number'
                        min='0'
                        value={config.daysBeforeNotification}
                        onChange={(e) =>
                          handleDaysChange(config.id, e.target.value)
                        }
                        className='w-20 text-center font-semibold'
                      />
                      <span className='text-sm text-slate-600 font-medium'>
                        ngày
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className='flex justify-end gap-3 pt-4'>
          <Button variant='outline' className='px-6'>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSave}
            className='px-6 bg-blue-600 hover:bg-blue-700'
          >
            <Save className='w-4 h-4 mr-2' />
            Lưu cấu hình
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;
