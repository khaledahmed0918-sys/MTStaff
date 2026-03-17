import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
