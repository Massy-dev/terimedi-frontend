import AdminDashboard from './AdminDashboard';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function Page() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}
