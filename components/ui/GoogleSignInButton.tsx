'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: (data: {
    name: string;
    email: string;
    picture?: string;
    sub?: string;
  }) => void;
  onError?: (error: Error) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Load Google Identity Services script if not already loaded
      if (!(window as any).google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Google Sign-In
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: async (response: any) => {
            try {
              // Call backend API to verify token
              const apiResponse = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  credential: response.credential,
                }),
              });

              const data = await apiResponse.json();

              if (!apiResponse.ok) {
                throw new Error(data.error || data.message || 'Authentication failed');
              }

              // Store token in sessionStorage
              if (data.token) {
                sessionStorage.setItem('auth_token', data.token);
              }

              // Decode JWT token for client-side use
              const jwtParts = response.credential.split('.');
              const decoded = JSON.parse(
                atob(jwtParts[1])
              );

              const userData = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                sub: decoded.sub,
              };

              // Store user info for persistence across navigation
              sessionStorage.setItem('user_info', JSON.stringify(userData));

              onSuccess?.(userData);

              setIsLoading(false);
            } catch (error) {
              console.error('Backend auth error:', error);
              onError?.(error instanceof Error ? error : new Error('Authentication failed'));
              setIsLoading(false);
            }
          },
        });

        // Render Google Sign-In button
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv && !(buttonDiv as any).hasBeenRendered) {
          (window as any).google.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            locale: 'en',
          });
          (buttonDiv as any).hasBeenRendered = true;
        }
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError?.(error instanceof Error ? error : new Error('Sign-in failed'));
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Google Sign-In Button Container */}
      <div
        id="google-signin-button"
        className="flex justify-center mb-4"
        onClick={handleGoogleSignIn}
      />

      {/* Fallback Button */}
      <motion.button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
        whileTap={{ scale: 0.98 }}
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
