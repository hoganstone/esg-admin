import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'ESG永續管理後台',
  description: 'ESG永續發展網站管理系統',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const userRole = (session.user as { role?: string }).role;

  // Allow ADMIN, SUPER_ADMIN, and EDITOR
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'EDITOR'];
  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect('/admin/login');
  }

  const userWithRole = {
    ...session.user,
    role: userRole,
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar user={userWithRole} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
