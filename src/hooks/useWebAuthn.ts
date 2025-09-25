import { useState, useCallback } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuthState';
import { useToast } from './use-toast';

interface WebAuthnResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function useWebAuthn() {
  const { user, session } = useAuthState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const invokeEdgeFunction = useCallback(async (path: string, body?: any) => {
    if (!session) {
      throw new Error('User session not found. Please log in.');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webauthn-auth/${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Edge function call failed: ${response.statusText}`);
    }

    return response.json();
  }, [session]);

  const registerCredential = useCallback(async (): Promise<WebAuthnResult> => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to register a biometric credential.',
          variant: 'destructive',
        });
        return { success: false, error: 'Authentication Required' };
      }

      // 1. Request registration options from the server
      const options: PublicKeyCredentialCreationOptionsJSON = await invokeEdgeFunction('register-challenge');

      // 2. Pass options to the browser for credential creation
      const attResp: RegistrationResponseJSON = await startRegistration(options);

      // 3. Send the response back to the server for verification
      const verificationResult = await invokeEdgeFunction('register-verify', attResp);

      if (verificationResult.verified) {
        toast({
          title: 'Enrollment Successful',
          description: 'Your biometric credential has been registered!',
        });
        return { success: true, message: 'Enrollment successful' };
      } else {
        throw new Error('Registration verification failed on server.');
      }
    } catch (error: any) {
      console.error('WebAuthn Registration Error:', error);
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Failed to register biometric credential.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, invokeEdgeFunction, toast]);

  const authenticateCredential = useCallback(async (): Promise<WebAuthnResult> => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to authenticate with biometrics.',
          variant: 'destructive',
        });
        return { success: false, error: 'Authentication Required' };
      }

      // 1. Request authentication options from the server
      const options: PublicKeyCredentialRequestOptionsJSON = await invokeEdgeFunction('authenticate-challenge');

      // 2. Pass options to the browser for credential authentication
      const authResp: AuthenticationResponseJSON = await startAuthentication(options);

      // 3. Send the response back to the server for verification
      const verificationResult = await invokeEdgeFunction('authenticate-verify', authResp);

      if (verificationResult.verified) {
        toast({
          title: 'Authentication Successful',
          description: 'Biometric authentication successful!',
        });
        return { success: true, message: 'Authentication successful' };
      } else {
        throw new Error('Authentication verification failed on server.');
      }
    } catch (error: any) {
      console.error('WebAuthn Authentication Error:', error);
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Failed to authenticate with biometrics.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, invokeEdgeFunction, toast]);

  return {
    isLoading,
    registerCredential,
    authenticateCredential,
  };
}