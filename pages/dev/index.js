import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DevIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dev/dashboard');
  }, [router]);
  return null;
}
