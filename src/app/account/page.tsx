'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  getRedirectResult,
} from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaYahoo } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

const AuthDashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [redirectPath, setRedirectPath] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) setRedirectPath(redirect);
  }, []);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push(redirectPath);
        }
      })
      .catch(console.error);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      router.push(redirectPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleYahooLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new OAuthProvider('yahoo.com'));
      console.log('Yahoo login result:', result.user);
    } catch (error) {
      console.error('Yahoo login error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) return <p>Loading...</p>;

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-900 px-4 overflow-hidden">
        {/* Bubbles */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] sm:w-[500px] md:w-[600px] rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-70 animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] sm:w-[500px] md:w-[600px] rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 opacity-70 animate-blob animation-delay-2000" />

        {/* Login Card */}
        <div className="bg-white rounded-[30px] shadow-2xl p-8 w-full max-w-sm z-10">
          <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-4">Welcome</h1>
          <p className="text-center text-gray-600 mb-6 text-sm">Create account or Sign in to continue</p>

          <button
            onClick={handleGoogleLogin}
            className="w-full mb-4 bg-gray-700 hover:bg-gray-900 text-white py-2.5 rounded-3xl font-semibold shadow-lg flex items-center justify-center gap-3 text-sm"
          >
            <FcGoogle className="text-xl" />
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={handleYahooLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-3xl font-semibold shadow-lg flex items-center justify-center gap-3 text-sm"
          >
            <FaYahoo className="text-lg" />
            <span>Sign in with Yahoo</span>
          </button>
        </div>

        {/* Animation CSS */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite ease-in-out; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome{user.name ? `, ${user.name}` : ''}
      </h1>
      <div className="space-y-2">
        {user.email && <p><strong>Email:</strong> {user.email}</p>}
        {user.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile Image" className="w-24 h-24 rounded-full" />
        )}
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default AuthDashboardPage;
