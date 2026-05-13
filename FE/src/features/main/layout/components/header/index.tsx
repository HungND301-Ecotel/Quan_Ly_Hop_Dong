import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthContext } from '@/features/context';
import { cn } from '@/lib/utils';
import { contractService } from '@/services/contract';
import {
  Bell,
  ChevronDownIcon,
  LogOutIcon,
  MapPinnedIcon,
  MenuIcon,
  PhoneIcon,
  PrinterIcon,
  Text,
  UserIcon,
  Webcam,
} from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavigationItem, NavigationItems } from './items';

type NavBadgeCounts = Record<string, number>;

const NavBadgeContext = React.createContext<NavBadgeCounts>({});

export function MainHeader() {
  const { user, signOut } = useAuthContext();
  const [navBadges, setNavBadges] = useState<NavBadgeCounts>({});

  useEffect(() => {
    contractService.getContractPendingList()
      .then(res => {
        const count = res?.length ?? 0;
        setNavBadges({ 'Quản lý hợp đồng': count, 'Hợp đồng phê duyệt': count });
      })
      .catch(() => { });
  }, []);

  return (
    <header className='border-b flex flex-col items-center shadow justify-center text-center bg-blue-600 text-primary-foreground h-fit'>
      <div className='border-b-2 border-blue-500 w-full px-4 sm:px-6 md:px-8 py-3 md:py-4'>
        <h1 className='uppercase text-lg sm:text-xl md:text-2xl font-bold leading-tight'>
          Phần mềm quản lý hợp đồng
        </h1>
        <h3 className='uppercase font-bold text-xs sm:text-sm md:text-base'>
          CÔNG TY TNHH ECOTEL
        </h3>
        <div className='hidden lg:flex flex-wrap gap-4 text-xs xl:text-sm w-full justify-center items-center mt-2'>
          <span className='flex gap-2 items-center'>
            <PhoneIcon className='size-4' /> <b>Điện thoại:</b> 0378665822
          </span>
          <span className='flex gap-2 items-center'>
            <PrinterIcon className='size-4' /> <b>Email:</b> info@ecotel.com.vn
          </span>
          <span className='flex gap-2 items-center'>
            <Webcam className='size-4' /> <b>Website:</b> ecotel.com.vn
          </span>
          <span className='flex gap-2 items-center'>
            <Text className='size-4' /> <b>MST:</b> 0110782543
          </span>
          <span className='flex gap-2 items-center w-full justify-center'>
            <MapPinnedIcon className='size-4' /> <b>Địa chỉ:</b> Số 4-Q28, 136 Ngõ Nguyễn An Ninh, Phường Tương Mai, Thành phố Hà Nội
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between w-full h-12 md:h-14 gap-2 px-4 md:px-6'>
        <NavBadgeContext.Provider value={navBadges}>
          <div className='hidden lg:flex items-center gap-1'>
            {NavigationItems.map((navItem) => (
              <HeaderNavItem key={navItem.name} item={navItem} badgeCount={navBadges[navItem.name]} />
            ))}
          </div>
        </NavBadgeContext.Provider>

        <div className='flex lg:hidden items-center'>
          <MobileNav navBadges={navBadges} />
        </div>

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <Button
              variant='ghost'
              size='icon-lg'
              className='relative gap-2 p-0 text-primary-foreground hover:bg-white/15 hover:text-white data-[state=open]:bg-white/20 data-[state=open]:text-white'
            >
              <Link to={'/notification'}>
                <Avatar className='size-8 border-none outline-none after:border-none'>
                  <AvatarFallback className='bg-transparent text-white border-none outline-0'>
                    <Bell className='size-4.5' />
                  </AvatarFallback>
                </Avatar>
                <span className='absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center leading-none'>
                  13
                </span>
              </Link>
            </Button>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon-lg'
                className='gap-2 p-0 text-primary-foreground hover:bg-white/15 hover:text-white data-[state=open]:bg-white/20 data-[state=open]:text-white'
              >
                <Avatar className='size-8 border-none outline-none after:border-none'>
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className='bg-transparent text-white border-none outline-0'>
                    <UserIcon className='size-4.5' />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-fit mt-2'>
              <DropdownMenuLabel className='text-base font-semibold'>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Link to='/profile' className='flex items-center w-full font-medium'>
                    <UserIcon className='mr-2 size-4' />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10'
                  onClick={signOut}
                >
                  <LogOutIcon className='mr-2 size-4' />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// ─── NavBadge ─────────────────────────────────────────────────────────────────

function NavBadge({ count, className, style }: { count: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cn(
        'absolute min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none pointer-events-none z-20',
        className
      )}
      style={style}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────

function MobileNav({ navBadges }: { navBadges: NavBadgeCounts }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='text-white hover:bg-white/15'>
          <MenuIcon className='size-6' />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-80 flex flex-col p-0 overflow-hidden'>
        <SheetHeader className='border-b p-6 bg-blue-600 text-white'>
          <SheetTitle className='text-white text-left font-bold uppercase text-lg leading-tight'>
            Hệ thống quản lý <br /> hợp đồng
          </SheetTitle>
        </SheetHeader>
        <div className='flex-1 overflow-y-auto'>
          <div className='p-4'>
            <Accordion type='single' collapsible className='w-full'>
              {NavigationItems.map((item) => (
                <MobileNavItem key={item.name} item={item} depth={0} badgeCount={navBadges[item.name]} />
              ))}
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Mobile Nav Item ──────────────────────────────────────────────────────────

function MobileNavItem({
  item,
  depth = 0,
  badgeCount,
}: {
  item: NavigationItem;
  depth?: number;
  badgeCount?: number;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const checkActive = (navItem: NavigationItem): boolean => {
    if (navItem.url) {
      if (navItem.url === '/') return pathname === '/';
      return pathname.startsWith(navItem.url);
    }
    return navItem.children?.some(checkActive) ?? false;
  };

  const isActive = checkActive(item);

  if (!hasChildren) {
    return (
      <Button
        variant='ghost'
        className={cn(
          'w-full justify-start text-sm font-medium py-6 px-4 mb-1',
          isActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-slate-600',
          depth > 0 && 'h-10 py-2',
        )}
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        onClick={() => item.url && navigate(item.url)}
      >
        {item.icon && (
          <DynamicIcon name={item.icon} className={cn('mr-3 size-5', depth > 0 && 'size-4')} />
        )}
        {item.name}
        {badgeCount !== undefined && (
          <span className='ml-auto min-w-5 h-5 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center'>
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem value={`${item.name}-${depth}`} className='border-none'>
        <AccordionTrigger
          className={cn(
            'hover:no-underline py-3 rounded-md mb-1',
            isActive ? 'text-blue-600 font-bold' : 'text-slate-600',
          )}
          style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        >
          <div className='flex items-center gap-2'>
            {item.icon && (
              <DynamicIcon name={item.icon} className={cn('size-5', depth > 0 && 'size-4')} />
            )}
            {item.name}
            {badgeCount !== undefined && (
              <span className='min-w-5 h-5 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center'>
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className='pb-1'>
          {item.children?.map((child) => (
            <MobileNavItem key={child.name} item={child} depth={depth + 1} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// ─── Desktop Nav Item ─────────────────────────────────────────────────────────

function HeaderNavItem({
  item,
  isSub = false,
  badgeCount,
}: {
  item: NavigationItem;
  isSub?: boolean;
  badgeCount?: number;
}) {
  const navBadges = React.useContext(NavBadgeContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  function checkActive(navItem: NavigationItem): boolean {
    if (navItem.url) {
      if (navItem.url === '/') return pathname === '/';
      return pathname.startsWith(navItem.url);
    }
    return navItem.children?.some(checkActive) ?? false;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = checkActive(item);

  if (!hasChildren) {
    if (isSub) {
      return (
        <DropdownMenuItem
          onClick={() => item.url && navigate(item.url)}
          className={cn(
            'cursor-pointer font-medium w-full',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          {item.icon && <DynamicIcon name={item.icon} className='mr-2 size-4' />}
          <span className='whitespace-nowrap'>{item.name}</span>
          {badgeCount !== undefined && (
            <span className='ml-2 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none'>
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </DropdownMenuItem>
      );
    }

    return (
      <Button
        variant='ghost'
        size='lg'
        className={cn(
          'text-primary-foreground hover:bg-white/15 hover:text-white px-3 h-10',
          isActive && 'bg-white/20'
        )}
        onClick={() => item.url && navigate(item.url)}
      >
        {item.icon && <DynamicIcon name={item.icon} className='mr-2 size-4' />}
        <span className='font-medium'>{item.name}</span>
      </Button>
    );
  }

  if (isSub) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className='cursor-pointer font-medium'>
          {item.icon && <DynamicIcon name={item.icon} className='mr-2 size-4' />}
          <span>{item.name}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className='min-w-48'>
          {item.children?.map((child) => (
            <HeaderNavItem key={child.name} item={child} isSub badgeCount={navBadges[child.name]} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  // Top-level dropdown
  // Tìm tất cả children có badge để hiển thị ngoài khi dropdown mở
  const childrenWithBadge = item.children?.filter(
    child => navBadges[child.name] !== undefined
  ) ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='lg'
          className={cn(
            'relative z-10 text-primary-foreground hover:bg-white/10 px-3 hover:text-white data-[state=open]:bg-white/20 data-[state=open]:text-white h-10',
            isActive && 'bg-white/20 font-bold'
          )}
        >
          {item.icon && <DynamicIcon name={item.icon} className='mr-2 size-4' />}
          <span className='font-medium'>{item.name}</span>
          <ChevronDownIcon className='ml-1 size-4 opacity-100 text-white' />
          {/* Badge của chính item này — luôn hiện */}
          {badgeCount !== undefined && (
            <NavBadge count={badgeCount} className='-top-1.5 -right-1.5' />
          )}
          {/* Badge của các children — chỉ hiện khi dropdown mở, nằm ngoài button */}
          {open && childrenWithBadge.map((child, index) => (
            <NavBadge
              key={child.name}
              count={navBadges[child.name]}
              className='top-28.5'
              style={{ right: `${-1.5 - (index + 1) * 5}px` }}  // cách nhau 20px
            />
          ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='w-fit mt-2'>
        {item.children?.map((child) => (
          <HeaderNavItem
            key={child.name}
            item={child}
            isSub
            badgeCount={navBadges[child.name]} // ← thêm dòng này
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}