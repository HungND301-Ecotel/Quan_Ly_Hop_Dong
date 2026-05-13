import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  Building2,
  Save,
  Search,
  Shield,
  Undo,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type DepartmentName = 'Pháp Chế' | 'Giám Đốc' | 'Kinh Doanh' | 'Kế Toán';
type RoleName = 'Nhân viên' | 'Giám đốc' | 'Trưởng phòng' | 'Phó phòng';

interface ModulePermissions {
  [key: string]: boolean;
}

interface SubModulePermissions {
  [key: string]: boolean;
}

interface Department {
  id: string;
  name: DepartmentName;
  modules: ModulePermissions;
}

interface Role {
  id: string;
  name: RoleName;
  department: DepartmentName;
  subModules: SubModulePermissions;
}

interface User {
  id: string;
  name: string;
  email: string;
  department: DepartmentName;
  role: RoleName;
  avatar?: string;
  subModules: SubModulePermissions;
}

// Module definitions
const moduleGroups = {
  contract: {
    label: 'Quản lý hợp đồng',
    subModules: {
      contractView: 'Xem',
      contractCreate: 'Thêm',
      contractEdit: 'Sửa',
      contractDelete: 'Xóa',
      contractApprove: 'Duyệt',
    },
  },
  finance: {
    label: 'Tài chính công nợ',
    subModules: {
      debtManagement: 'Quản lý công nợ',
      paymentVoucher: 'Phiếu thanh toán',
    },
  },
  settings: {
    label: 'Cài đặt',
    subModules: {
      categoryManagement: 'Quản lý danh mục',
      notificationConfig: 'Cấu hình thông báo',
      permissionManagement: 'Quản lý phân quyền',
    },
  },
  profile: {
    label: 'Profile',
    subModules: {
      profileManagement: 'Quản lý profile',
      signatureUpload: 'Upload chữ ký',
    },
  },
};

// Mock data
const mockDepartments: Department[] = [
  {
    id: 'dept1',
    name: 'Pháp Chế',
    modules: {
      contract: true,
      finance: false,
      settings: false,
      profile: true,
    },
  },
  {
    id: 'dept2',
    name: 'Giám Đốc',
    modules: {
      contract: true,
      finance: true,
      settings: true,
      profile: true,
    },
  },
  {
    id: 'dept3',
    name: 'Kinh Doanh',
    modules: {
      contract: true,
      finance: true,
      settings: false,
      profile: true,
    },
  },
  {
    id: 'dept4',
    name: 'Kế Toán',
    modules: {
      contract: true,
      finance: true,
      settings: false,
      profile: true,
    },
  },
];

const mockRoles: Role[] = [
  {
    id: 'role1',
    name: 'Giám đốc',
    department: 'Giám Đốc',
    subModules: {
      contractView: true,
      contractCreate: true,
      contractEdit: true,
      contractDelete: true,
      contractApprove: true,
      debtManagement: true,
      paymentVoucher: true,
      categoryManagement: true,
      notificationConfig: true,
      permissionManagement: true,
      profileManagement: true,
      signatureUpload: true,
    },
  },
  {
    id: 'role2',
    name: 'Trưởng phòng',
    department: 'Pháp Chế',
    subModules: {
      contractView: true,
      contractCreate: true,
      contractEdit: true,
      contractDelete: false,
      contractApprove: true,
      debtManagement: false,
      paymentVoucher: false,
      categoryManagement: false,
      notificationConfig: false,
      permissionManagement: false,
      profileManagement: true,
      signatureUpload: true,
    },
  },
  {
    id: 'role3',
    name: 'Phó phòng',
    department: 'Kinh Doanh',
    subModules: {
      contractView: true,
      contractCreate: true,
      contractEdit: true,
      contractDelete: false,
      contractApprove: false,
      debtManagement: true,
      paymentVoucher: true,
      categoryManagement: false,
      notificationConfig: false,
      permissionManagement: false,
      profileManagement: true,
      signatureUpload: true,
    },
  },
  {
    id: 'role4',
    name: 'Nhân viên',
    department: 'Kế Toán',
    subModules: {
      contractView: true,
      contractCreate: false,
      contractEdit: false,
      contractDelete: false,
      contractApprove: false,
      debtManagement: true,
      paymentVoucher: true,
      categoryManagement: false,
      notificationConfig: false,
      permissionManagement: false,
      profileManagement: true,
      signatureUpload: true,
    },
  },
];

const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Nguyễn Văn Minh',
    email: 'nguyen.minh@company.vn',
    department: 'Giám Đốc',
    role: 'Giám đốc',
    subModules: {
      contractView: true,
      contractCreate: true,
      contractEdit: true,
      contractDelete: true,
      contractApprove: true,
      debtManagement: true,
      paymentVoucher: true,
      categoryManagement: true,
      notificationConfig: true,
      permissionManagement: true,
      profileManagement: true,
      signatureUpload: true,
    },
  },
  {
    id: 'user2',
    name: 'Trần Thị Hương',
    email: 'tran.huong@company.vn',
    department: 'Pháp Chế',
    role: 'Trưởng phòng',
    subModules: {
      contractView: true,
      contractCreate: false, // Bỏ quyền tạo cho trưởng phòng
      contractEdit: true,
      contractDelete: false,
      contractApprove: true,
      debtManagement: false,
      paymentVoucher: false,
      categoryManagement: false,
      notificationConfig: false,
      permissionManagement: false,
      profileManagement: true,
      signatureUpload: true,
    },
  },
  {
    id: 'user3',
    name: 'Lê Hoàng Nam',
    email: 'le.nam@company.vn',
    department: 'Kinh Doanh',
    role: 'Phó phòng',
    subModules: {
      contractView: true,
      contractCreate: true,
      contractEdit: true,
      contractDelete: false,
      contractApprove: false,
      debtManagement: true,
      paymentVoucher: true,
      categoryManagement: false,
      notificationConfig: false,
      permissionManagement: false,
      profileManagement: true,
      signatureUpload: true,
    },
  },
  {
    id: 'user4',
    name: 'Phạm Thị Lan',
    email: 'pham.lan@company.vn',
    department: 'Kế Toán',
    role: 'Nhân viên',
    subModules: {
      contractView: false, // Tắt quyền xem cho nhân viên A
      contractCreate: false,
      contractEdit: false,
      contractDelete: false,
      contractApprove: false,
      debtManagement: true,
      paymentVoucher: true,
      categoryManagement: false,
      notificationConfig: false,
      permissionManagement: false,
      profileManagement: true,
      signatureUpload: true,
    },
  },
];

export default function ThreeTierPermissionPage() {
  const [activeTab, setActiveTab] = useState<'department' | 'role' | 'user'>(
    'department'
  );
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [originalDepartments, setOriginalDepartments] =
    useState<Department[]>(mockDepartments);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [originalRoles, setOriginalRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [originalUsers, setOriginalUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      JSON.stringify(departments) !== JSON.stringify(originalDepartments) ||
      JSON.stringify(roles) !== JSON.stringify(originalRoles) ||
      JSON.stringify(users) !== JSON.stringify(originalUsers);
    setHasChanges(changed);
  }, [
    departments,
    originalDepartments,
    roles,
    originalRoles,
    users,
    originalUsers,
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const handleDepartmentModuleChange = (deptId: string, module: string) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? {
              ...d,
              modules: {
                ...d.modules,
                [module]: !d.modules[module],
              },
            }
          : d
      )
    );
  };

  const handleRoleSubModuleChange = (roleId: string, subModule: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              subModules: {
                ...r.subModules,
                [subModule]: !r.subModules[subModule],
              },
            }
          : r
      )
    );
  };

  const handleUserSubModuleChange = (userId: string, subModule: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              subModules: {
                ...u.subModules,
                [subModule]: !u.subModules[subModule],
              },
            }
          : u
      )
    );
  };

  const handleSaveAll = () => {
    setOriginalDepartments([...departments]);
    setOriginalRoles([...roles]);
    setOriginalUsers([...users]);
    alert('Tất cả quyền đã được lưu thành công!');
  };

  const handleCancel = () => {
    setDepartments([...originalDepartments]);
    setRoles([...originalRoles]);
    setUsers([...originalUsers]);
    alert('Đã hủy tất cả thay đổi.');
  };

  return (
    <>
      <div className='flex gap-2 justify-end'>
        <Button variant='outline' onClick={handleCancel} className='gap-2'>
          <Undo className='w-4 h-4' /> Hủy
        </Button>
        <Button onClick={handleSaveAll} disabled={!hasChanges}>
          <Save className='w-4 h-4' /> Lưu tất cả
        </Button>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setActiveTab('department')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'department'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className='w-4 h-4' />
          1. Phòng ban
        </button>
        <button
          onClick={() => setActiveTab('role')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'role'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase className='w-4 h-4' />
          2. Chức vụ
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'user'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className='w-4 h-4' />
          3. Tài khoản
        </button>
      </div>

      {hasChanges && (
        <div className='bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg'>
          <strong>Lưu ý:</strong> Có thay đổi chưa lưu. Nhấn "Lưu tất cả" để áp
          dụng.
        </div>
      )}

      {/* Department Permissions Table */}
      {activeTab === 'department' && (
        <Card>
          <CardHeader>
            <CardTitle>Bước 1: Phân quyền Module theo Phòng ban</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Xác định phạm vi dữ liệu (module) mà mỗi phòng ban được truy cập
            </p>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full table-auto border-collapse'>
                <thead>
                  <tr className='bg-slate-50 border-b'>
                    <th className='text-left p-4 font-semibold sticky left-0 bg-slate-50 z-10 min-w-64'>
                      Phòng ban
                    </th>
                    {Object.entries(moduleGroups).map(([key, group]) => (
                      <th
                        key={key}
                        className='text-center p-4 font-semibold border-l min-w-48'
                      >
                        {group.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr
                      key={dept.id}
                      className='border-b hover:bg-slate-50 transition'
                    >
                      <td className='p-4 sticky left-0 bg-white z-10'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
                            <Building2 className='w-5 h-5 text-red-600' />
                          </div>
                          <div>
                            <p className='font-medium'>{dept.name}</p>
                          </div>
                        </div>
                      </td>
                      {Object.keys(moduleGroups).map((moduleKey) => (
                        <td key={moduleKey} className='text-center p-4'>
                          <input
                            type='checkbox'
                            checked={dept.modules[moduleKey]}
                            onChange={() =>
                              handleDepartmentModuleChange(dept.id, moduleKey)
                            }
                            className='w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer'
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Table */}
      {activeTab === 'role' && (
        <>
          <Card>
            <CardHeader>
              <div className='flex gap-4 items-center'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    placeholder='Tìm theo chức vụ hoặc phòng ban...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Bước 2: Phân quyền CRUD Sub-Module theo Chức vụ
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Xác định các quyền CRUD chi tiết cho từng chức vụ trong phòng
                ban
              </p>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <table className='w-full table-auto border-collapse'>
                  <thead>
                    <tr className='bg-slate-50 border-b'>
                      <th className='text-left p-4 font-semibold sticky left-0 bg-slate-50 z-10 min-w-72'>
                        Chức vụ
                      </th>
                      {Object.entries(moduleGroups).map(([groupKey, group]) => (
                        <th
                          key={groupKey}
                          colSpan={Object.keys(group.subModules).length}
                          className='text-center p-4 font-semibold border-l'
                        >
                          {group.label}
                        </th>
                      ))}
                    </tr>
                    <tr className='bg-slate-100 border-b text-xs'>
                      <th className='sticky left-0 bg-slate-100 z-10'></th>
                      {Object.entries(moduleGroups).map(([groupKey, group]) =>
                        Object.entries(group.subModules).map(
                          ([subKey, label]) => (
                            <th
                              key={`${groupKey}-${subKey}`}
                              className='text-center p-2 font-medium min-w-28'
                            >
                              {label}
                            </th>
                          )
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr
                        key={role.id}
                        className='border-b hover:bg-slate-50 transition'
                      >
                        <td className='p-4 sticky left-0 bg-white z-10'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                              <Briefcase className='w-5 h-5 text-blue-600' />
                            </div>
                            <div>
                              <p className='font-medium'>{role.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {role.department}
                              </p>
                            </div>
                          </div>
                        </td>

                        {Object.entries(moduleGroups).map(([groupKey, group]) =>
                          Object.keys(group.subModules).map((subKey) => (
                            <td
                              key={`${groupKey}-${subKey}`}
                              className='text-center p-4'
                            >
                              <input
                                type='checkbox'
                                checked={role.subModules[subKey]}
                                onChange={() =>
                                  handleRoleSubModuleChange(role.id, subKey)
                                }
                                className='w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer'
                              />
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRoles.length === 0 && (
                  <div className='text-center py-12 text-muted-foreground'>
                    Không tìm thấy chức vụ nào.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* User Permissions Table */}
      {activeTab === 'user' && (
        <>
          <Card>
            <CardHeader>
              <div className='flex gap-4 items-center'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    placeholder='Tìm theo tên, email hoặc phòng ban...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Bước 3: Tùy chỉnh quyền chi tiết cho Tài khoản
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Điều chỉnh quyền cụ thể cho từng tài khoản cá nhân (ghi đè quyền
                chức vụ)
              </p>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <table className='w-full table-auto border-collapse'>
                  <thead>
                    <tr className='bg-slate-50 border-b'>
                      <th className='text-left p-4 font-semibold sticky left-0 bg-slate-50 z-10 min-w-80'>
                        Người dùng
                      </th>
                      {Object.entries(moduleGroups).map(([groupKey, group]) => (
                        <th
                          key={groupKey}
                          colSpan={Object.keys(group.subModules).length}
                          className='text-center p-4 font-semibold border-l'
                        >
                          {group.label}
                        </th>
                      ))}
                    </tr>
                    <tr className='bg-slate-100 border-b text-xs'>
                      <th className='sticky left-0 bg-slate-100 z-10'></th>
                      {Object.entries(moduleGroups).map(([groupKey, group]) =>
                        Object.entries(group.subModules).map(
                          ([subKey, label]) => (
                            <th
                              key={`${groupKey}-${subKey}`}
                              className='text-center p-2 font-medium min-w-28'
                            >
                              {label}
                            </th>
                          )
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className='border-b hover:bg-slate-50 transition'
                      >
                        <td className='p-4 sticky left-0 bg-white z-10'>
                          <div className='flex items-center gap-3'>
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className='w-10 h-10 rounded-full object-cover'
                              />
                            ) : (
                              <div className='w-10 h-10 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center'>
                                <span className='text-sm font-bold text-white'>
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className='font-medium flex items-center gap-2'>
                                {user.name}
                                {user.role === 'Giám đốc' && (
                                  <span className='inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full'>
                                    <Shield className='w-3 h-3 mr-1' />
                                    {user.role.toUpperCase()}
                                  </span>
                                )}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                {user.email} • {user.department} • {user.role}
                              </p>
                            </div>
                          </div>
                        </td>

                        {Object.entries(moduleGroups).map(([groupKey, group]) =>
                          Object.keys(group.subModules).map((subKey) => (
                            <td
                              key={`${groupKey}-${subKey}`}
                              className='text-center p-4'
                            >
                              <input
                                type='checkbox'
                                checked={user.subModules[subKey]}
                                onChange={() =>
                                  handleUserSubModuleChange(user.id, subKey)
                                }
                                className='w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer'
                              />
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className='text-center py-12 text-muted-foreground'>
                    Không tìm thấy người dùng nào.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
