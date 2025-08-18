'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation';

const DashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/account');
  };

  if (isLoading) return <p>Loading...</p>;

  if (!user) {
    router.push('/account');
    return null;
  }
  // React.useEffect(() => {
  //   if (!user && !isLoading) {
  //     router.push('/account');
  //   }
  // }, [user, isLoading, router]);

  // if (!user) {
  //   return null;
  // }
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome{user.name ? `, ${user.name}` : ''}
      </h1>
      <div className="space-y-2">
        {user.email && <p><strong>Email:</strong> {user.email}</p>}
        {user.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full" />
        )}
        {/* <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p> */}
      </div>
    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
      Logout
    </button>
    </div>
  );
};

export default DashboardPage;
