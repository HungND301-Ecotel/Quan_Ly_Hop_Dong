// setting/information/layout.tsx
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Banknote,
  BookCheck,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  FileSignature,
  FileText,
  List,
  ListCheck,
  ListTree,
  MenuIcon,
  MessageSquareDiff,
  Package,
  RemoveFormattingIcon,
  UserCircle,
  Users,
  LayoutTemplate,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

// ✅ Thêm type cho menu item
type MenuItem = {
  name: string;
  icon: React.ElementType;
  url?: string;
  children?: MenuItem[];
};

const CATALOG_ITEMS: MenuItem[] = [
  {
    name: 'Đối tác',
    icon: Users,
    url: '/setting/catalog/partner',
  },
  {
    name: 'Loại hợp đồng',
    icon: FileText,
    url: '/setting/catalog/contract-type',
  },
  {
    name: 'Lĩnh vực hợp đồng',
    icon: BookOpen,
    url: '/setting/catalog/contract-field',
  },
  {
    name: 'Hình thức hợp đồng',
    icon: LayoutTemplate,
    url: '/setting/catalog/contract-structure',
  },
  {
    name: 'Mã cấp 1',
    icon: ListTree,
    url: '/setting/catalog/level1',
  },
  {
    name: 'Mã cấp 2',
    icon: ListTree,
    url: '/setting/catalog/level2',
  },
  {
    name: 'Mã cấp 3',
    icon: ListTree,
    url: '/setting/catalog/level3',
  },
  {
    name: 'Nội dung ký kết',
    icon: FileSignature,
    url: '/setting/catalog/signing-content',
  },
  {
    name: 'Phòng ban',
    icon: Building2,
    url: '/setting/catalog/department',
  },
  {
    name: 'Tài khoản',
    icon: UserCircle,
    url: '/setting/catalog/account',
  },
  {
    name: 'Hình thức lựa chọn nhà thầu',
    icon: List,
    url: '/setting/catalog/procurement-method',
  },
  {
    name: 'Sổ theo dõi hợp đồng',
    icon: BookCheck,
    url: '/setting/catalog/contract-register',
  },
  {
    name: 'Tài khoản ngân hàng',
    icon: Banknote,
    url: '/setting/catalog/bank-account',
  },
  {
    name: 'Đơn vị tính',
    icon: RemoveFormattingIcon,
    url: '/setting/catalog/unit',
  },
  {
    name: 'Thành phần hợp đồng',
    icon: Package,
    children: [
      {
        name: 'Thành phần vật tư',
        icon: ListCheck,
        url: '/setting/catalog/material',
      },
      {
        name: 'Thành phần hợp đồng khác',
        icon: MessageSquareDiff,
        url: '/setting/catalog/material/other',
      },
    ],
  },
];

export function SettingInformationLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isActive = item.url ? location.pathname === item.url : false;

    // ✅ Kiểm tra nếu có children đang active
    const hasActiveChild = hasChildren && item.children?.some(
      child => child.url === location.pathname
    );

    if (hasChildren) {
      return (
        <div key={item.name}>
          <Tooltip disableHoverableContent={!isCollapsed}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleExpand(item.name)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative text-foreground hover:bg-muted',
                  isCollapsed && 'justify-center px-0',
                  (isExpanded || hasActiveChild) && 'bg-muted'
                )}
              >
                <item.icon
                  className={cn(
                    'shrink-0 transition-size duration-300',
                    isCollapsed ? 'size-5' : 'size-4'
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className='truncate flex-1 text-left animate-in slide-in-from-left-2 duration-300'>
                      {item.name}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className='size-4 shrink-0' />
                    ) : (
                      <ChevronRight className='size-4 shrink-0' />
                    )}
                  </>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side='right' className='font-medium'>
                {item.name}
              </TooltipContent>
            )}
          </Tooltip>

          {/* ✅ Submenu */}
          {!isCollapsed && isExpanded && (
            <div className='ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200'>
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // ✅ Menu item không có children
    return (
      <Tooltip key={item.url} disableHoverableContent={!isCollapsed}>
        <TooltipTrigger asChild>
          <Link
            to={item.url!}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative text-foreground',
              isCollapsed && 'justify-center px-0',
              isActive && 'bg-primary text-white',
              depth > 0 && !isActive && 'hover:bg-muted'
            )}
          >
            <item.icon
              className={cn(
                'shrink-0 transition-size duration-300',
                isCollapsed ? 'size-5' : 'size-4'
              )}
            />
            {!isCollapsed && (
              <span className='truncate animate-in slide-in-from-left-2 duration-300'>
                {item.name}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side='right' className='font-medium'>
            {item.name}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <div className='flex w-full h-full items-start gap-4'>
      <aside
        className={cn(
          'flex flex-col bottom-6 border bg-background transition-all duration-300 ease-in-out rounded-lg h-full',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className='flex flex-col gap-4 p-3 h-full'>
          <div
            className={cn(
              'flex items-center gap-4',
              isCollapsed && 'text-center p-0 justify-center'
            )}
          >
            <Button
              variant='outline'
              size='icon'
              className='border bg-background'
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <MenuIcon />
            </Button>
            {!isCollapsed && (
              <h2 className='text-xs font-semibold text-slate-500 uppercase tracking-wider animate-in fade-in duration-300'>
                Danh mục
              </h2>
            )}
          </div>

          <TooltipProvider delayDuration={0}>
            <nav className='flex flex-col gap-1'>
              {CATALOG_ITEMS.map((item) => renderMenuItem(item))}
            </nav>
          </TooltipProvider>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className='flex-1 min-w-0 h-full overflow-auto'>
        <Outlet />
      </main>
    </div>
  );
}