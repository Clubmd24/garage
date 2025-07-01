import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCurrentUser } from '../../components/useCurrentUser.js';
import OfficeDashboard from '../../components/OfficeDashboard.jsx';
import OfficeLayout from '../../components/OfficeLayout.jsx';

export default function OfficePage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Garage Vision - Office</title>
      </Head>
      <OfficeLayout>
        <OfficeDashboard />
      </OfficeLayout>
    </>
  );
}
