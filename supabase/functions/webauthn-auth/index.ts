import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from 'https://esm.sh/@simplewebauthn/server@10.0.0';
import {
  CredentialDeviceType,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from 'https://esm.sh/@simplewebauthn/types@10.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Configuration for your Relying Party (RP)
// IMPORTANT: Update RP_ID to your actual domain in production!
const RP_ID = Deno.env.get('SUPABASE_URL')?.replace('https://', '').split('.')[0] + '.supabase.co' || 'localhost:8080'; // Use Supabase URL as RP_ID for hosted functions
const RP_NAME = 'DREAMS Attendance';
const ORIGIN = Deno.env.get('SUPABASE_URL') || 'http://localhost:8080'; // Your frontend URL

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      auth: { persistSession: false },
    }
  );

  // Verify JWT and get user ID
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

  if (authError || !user) {
    console.error('Auth error:', authError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userId = user.id;
  const userEmail = user.email;

  try {
    const { path } = new URL(req.url);
    const body = await req.json();

    switch (path) {
      case '/webauthn-auth/register-challenge': {
        const { data: existingCredentials, error } = await supabaseClient
          .from('webauthn_credentials')
          .select('credential_id')
          .eq('user_id', userId);

        if (error) throw error;

        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: RP_ID,
          userID: userId,
          userName: userEmail || userId,
          attestationType: 'none',
          excludeCredentials: existingCredentials.map(cred => ({
            id: cred.credential_id,
            type: 'public-key',
            transports: ['internal', 'usb', 'nfc', 'ble'], // Include all possible transports
          })),
          authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // Prefer platform authenticators (e.g., built-in fingerprint)
          },
        });

        // Store challenge in Supabase for verification later
        await supabaseClient
          .from('profiles') // Using profiles table to store challenge temporarily
          .update({ raw_user_meta_data: { ...user.user_metadata, current_challenge: options.challenge } })
          .eq('id', userId);

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case '/webauthn-auth/register-verify': {
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .select('raw_user_meta_data')
          .eq('id', userId)
          .single();

        if (profileError || !profileData?.raw_user_meta_data?.current_challenge) {
          throw new Error('Registration challenge not found or expired.');
        }

        const expectedChallenge = profileData.raw_user_meta_data.current_challenge;

        let verification;
        try {
          verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: false, // Can be 'true' for stricter security
          });
        } catch (err) {
          console.error(err);
          return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
          const {
            credentialID,
            credentialPublicKey,
            counter,
            credentialDeviceType,
            credentialBackedUp,
            transports,
          } = registrationInfo;

          const { error: insertError } = await supabaseClient
            .from('webauthn_credentials')
            .insert({
              user_id: userId,
              credential_id: credentialID,
              public_key: credentialPublicKey,
              counter,
              transports: transports || [],
              device_type: credentialDeviceType,
              backed_up: credentialBackedUp,
            });

          if (insertError) throw insertError;

          // Update profile to mark biometric enrolled
          await supabaseClient
            .from('profiles')
            .update({ biometric_enrolled: true })
            .eq('id', userId);

          // Clear challenge
          await supabaseClient
            .from('profiles')
            .update({ raw_user_meta_data: { ...user.user_metadata, current_challenge: null } })
            .eq('id', userId);

          return new Response(JSON.stringify({ verified }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        return new Response(JSON.stringify({ verified: false, error: 'Registration verification failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      case '/webauthn-auth/authenticate-challenge': {
        const { data: userCredentials, error } = await supabaseClient
          .from('webauthn_credentials')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        if (userCredentials.length === 0) {
          return new Response(JSON.stringify({ error: 'No WebAuthn credentials registered for this user.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const options = await generateAuthenticationOptions({
          rpID: RP_ID,
          allowCredentials: userCredentials.map(cred => ({
            id: cred.credential_id,
            type: 'public-key',
            transports: cred.transports as AuthenticatorTransport[],
          })),
          userVerification: 'preferred',
        });

        // Store challenge in Supabase for verification later
        await supabaseClient
          .from('profiles')
          .update({ raw_user_meta_data: { ...user.user_metadata, current_challenge: options.challenge } })
          .eq('id', userId);

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case '/webauthn-auth/authenticate-verify': {
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .select('raw_user_meta_data')
          .eq('id', userId)
          .single();

        if (profileError || !profileData?.raw_user_meta_data?.current_challenge) {
          throw new Error('Authentication challenge not found or expired.');
        }

        const expectedChallenge = profileData.raw_user_meta_data.current_challenge;

        const { data: userCredentials, error: credError } = await supabaseClient
          .from('webauthn_credentials')
          .select('*')
          .eq('user_id', userId);

        if (credError) throw credError;
        if (userCredentials.length === 0) {
          throw new Error('No WebAuthn credentials found for this user.');
        }

        const credential = userCredentials.find(cred => cred.credential_id === body.rawId);
        if (!credential) {
          throw new Error('Credential not found for this user.');
        }

        let verification;
        try {
          verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
              credentialID: credential.credential_id,
              credentialPublicKey: credential.public_key,
              counter: credential.counter,
              transports: credential.transports as AuthenticatorTransport[],
              deviceType: credential.device_type as CredentialDeviceType,
              backedUp: credential.backed_up,
            },
            requireUserVerification: false, // Can be 'true' for stricter security
          });
        } catch (err) {
          console.error(err);
          return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { verified, authenticationInfo } = verification;

        if (verified) {
          // Update counter for replay attack protection
          const { error: updateError } = await supabaseClient
            .from('webauthn_credentials')
            .update({ counter: authenticationInfo.newCounter })
            .eq('credential_id', authenticationInfo.credentialID);

          if (updateError) throw updateError;

          // Clear challenge
          await supabaseClient
            .from('profiles')
            .update({ raw_user_meta_data: { ...user.user_metadata, current_challenge: null } })
            .eq('id', userId);

          return new Response(JSON.stringify({ verified }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        return new Response(JSON.stringify({ verified: false, error: 'Authentication verification failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Edge Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});