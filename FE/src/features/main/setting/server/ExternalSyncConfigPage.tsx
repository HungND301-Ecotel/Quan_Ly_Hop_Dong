import React, { useEffect } from 'react';
import {
  useExternalSyncConnections,
  useConnectionForm,
} from '@/hooks/useExternalSyncConnections';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useMainLayoutContext } from '@/features/main/layout/context';

export function ExternalSyncConfigPage() {
  const { setAction } = useMainLayoutContext();

  const {
    connections,
    loading,
    error,
    loadConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    clearError,
  } = useExternalSyncConnections();

  const form = useConnectionForm();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    setAction(
      <Button
        onClick={() => {
          form.reset();
          setEditingId(null);
          setOpenDialog(true);
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Thêm kết nối mới
      </Button>
    );

    return () => setAction(undefined);
  }, [setAction]); // ← không phụ thuộc showForm nữa, nút luôn hiển thị

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!form.validate()) return;

    const success = editingId
      ? await updateConnection(editingId, {
          connection: form.formData.connection,
          isActive: form.formData.isActive,
        })
      : await createConnection({
          connection: form.formData.connection,
          isActive: form.formData.isActive,
        });

    if (success) {
      setSaveSuccess(true);
      form.reset();
      setOpenDialog(false);
      setEditingId(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleEdit = (conn: any) => {
    form.setFormData(conn);
    setEditingId(conn.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa cấu hình kết nối này?')) {
      await deleteConnection(id);
    }
  };

  const handleCloseDialog = () => {
    form.reset();
    clearError();
    setOpenDialog(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {editingId ? 'Cập nhật' : 'Tạo'} cấu hình kết nối thành công!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-600 hover:text-red-700 font-bold">
              ✕
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="max-w-2xl!">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {editingId ? 'Chỉnh sửa kết nối' : 'Tạo kết nối mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin kết nối cơ sở dữ liệu bên ngoài
            </DialogDescription>
          </DialogHeader>

          {form.validationErrors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <ul className="list-disc list-inside mt-1">
                  {form.validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="server" className="text-sm font-semibold">
                  Máy chủ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="server"
                  type="text"
                  placeholder=""
                  value={form.formData.connection.server}
                  onChange={(e) => form.updateField('connection.server', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Địa chỉ hoặc tên hostname của máy chủ</p>
              </div>

              <div>
                <Label htmlFor="port" className="text-sm font-semibold">
                  Cổng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="1433"
                  value={form.formData.connection.port}
                  onChange={(e) => form.updateField('connection.port', e.target.value)}
                  min="1"
                  max="65535"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Cổng mặc định SQL Server: 1433</p>
              </div>

              <div>
                <Label htmlFor="database" className="text-sm font-semibold">
                  Cơ sở dữ liệu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="database"
                  type="text"
                  placeholder="Tên cơ sở dữ liệu"
                  value={form.formData.connection.database}
                  onChange={(e) => form.updateField('connection.database', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Tên cơ sở dữ liệu cần kết nối</p>
              </div>

              <div>
                <Label htmlFor="userId" className="text-sm font-semibold">
                  Tên người dùng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="sa"
                  value={form.formData.connection.userId}
                  onChange={(e) => form.updateField('connection.userId', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Tài khoản đăng nhập cơ sở dữ liệu</p>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.formData.connection.password}
                  onChange={(e) => form.updateField('connection.password', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Mật khẩu đăng nhập cơ sở dữ liệu</p>
              </div>

              <div>
                <Label htmlFor="timeout" className="text-sm font-semibold">
                  Thời gian chờ (giây) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  placeholder="30"
                  value={form.formData.connection.commandTimeoutSeconds}
                  onChange={(e) => form.updateField('connection.commandTimeoutSeconds', e.target.value)}
                  min="0"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Thời gian chờ tối đa cho mỗi lệnh</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Switch
                  checked={form.formData.connection.trustServerCertificate}
                  onCheckedChange={(checked) =>
                    form.updateField('connection.trustServerCertificate', checked)
                  }
                />
                <div>
                  <p className="font-medium text-sm text-slate-800">Tin tưởng chứng chỉ máy chủ</p>
                  <p className="text-xs text-slate-500">
                    Chỉ sử dụng cho môi trường phát triển hoặc các máy chủ được tin tưởng
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border-2 border-blue-100">
                <Switch
                  checked={form.formData.isActive}
                  onCheckedChange={(checked) => form.updateField('isActive', checked)}
                />
                <div>
                  <p className="font-medium text-sm text-slate-800">Kích hoạt kết nối</p>
                  <p className="text-xs text-slate-500">
                    Bật để sử dụng cấu hình này cho đồng bộ dữ liệu
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="px-6">
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Cập nhật' : 'Tạo'} kết nối
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Connections List */}
      <div className="grid gap-4">
        {loading && connections.length === 0 ? (
          <Card className="p-12">
            <div className="flex justify-center items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-slate-600">Đang tải cấu hình...</span>
            </div>
          </Card>
        ) : connections.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Chưa có cấu hình kết nối nào</p>
              <p className="text-slate-500 text-sm mt-1">
                Hãy tạo kết nối mới để bắt đầu đồng bộ dữ liệu
              </p>
            </div>
          </Card>
        ) : (
          connections.map((conn) => (
            <Card key={conn.id} className="shadow hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg h-fit">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-900">
                          {conn.connection.server}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            conn.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {conn.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-slate-600 font-medium text-xs">Cơ sở dữ liệu</p>
                          <p className="text-slate-900 font-semibold mt-1">{conn.connection.database}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-xs">Cổng</p>
                          <p className="text-slate-900 font-semibold mt-1">{conn.connection.port}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-xs">Người dùng</p>
                          <p className="text-slate-900 font-semibold mt-1">{conn.connection.userId}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-xs">Thời gian chờ</p>
                          <p className="text-slate-900 font-semibold mt-1">
                            {conn.connection.commandTimeoutSeconds}s
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(conn)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={() => handleDelete(conn.id!)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}