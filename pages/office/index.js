import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCurrentUser } from '../../components/useCurrentUser.js';
import OfficeDashboard from '../../components/OfficeDashboard.jsx';

export default function OfficePage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Garage Vision - Office</title>
      </Head>
      <OfficeDashboard />
    </>
  );
}
