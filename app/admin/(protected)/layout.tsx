import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';

// Cualquier página bajo este grupo requiere sesión — /admin/login queda
// afuera a propósito (está en app/admin/login, hermano de este grupo, no
// adentro), si no quedaría en un loop de redirect contra sí misma.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
  return <div className="bg-background-alt min-h-full flex-1">{children}</div>;
}
