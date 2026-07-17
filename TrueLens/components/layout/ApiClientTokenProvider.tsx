'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setTokenProvider } from '../../lib/api';

export default function ApiClientTokenProvider() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Register the Clerk getToken method so the API client can fetch fresh JWTs dynamically
    setTokenProvider(() => getToken());
  }, [getToken]);

  return null;
}
