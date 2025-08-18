'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';

interface WithAuthProps {
  user: User;
}

const withAuth = <P extends WithAuthProps>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: Omit<P, 'user'>) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/account');
      }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
      return <div className="text-center py-16">Loading...</div>;
    }

    // At this point, user is guaranteed to be non-null and have all required fields
    const typedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber
    };

    return <WrappedComponent {...props as P} user={typedUser} />;
  };

  return AuthComponent;
};

export default withAuth;
