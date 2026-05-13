import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockNotifications, type Notification } from './MockData';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function NotificationList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className='h-5 w-5 text-success' />;
      case 'ERROR':
        return <XCircle className='h-5 w-5 text-destructive' />;
      case 'WARNING':
        return <AlertTriangle className='h-5 w-5 text-warning' />;
      default:
        return <Info className='h-5 w-5 text-primary' />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success('Đã đánh dấu đã đọc');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className='p-8 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Bell className='h-8 w-8' />
            Thông báo
          </h1>
          <p className='text-muted-foreground mt-1'>
            Bạn có {unreadCount} thông báo chưa đọc
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant='outline'>
            <CheckCheck className='mr-2 h-4 w-4' />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className='space-y-3'>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.read
                  ? 'border-l-4 border-l-primary bg-primary/5'
                  : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className='flex items-start gap-4 p-4'>
                <div className='mt-1'>{getIcon(notification.type)}</div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <h3
                      className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <Badge className='bg-primary text-primary-foreground'>
                        Mới
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {notification.message}
                  </p>
                  <p className='text-xs text-muted-foreground mt-2'>
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Bell className='h-12 w-12 text-muted-foreground mb-4' />
              <p className='text-lg font-semibold'>Không có thông báo</p>
              <p className='text-muted-foreground mt-1'>
                Bạn đã xem hết tất cả thông báo
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
