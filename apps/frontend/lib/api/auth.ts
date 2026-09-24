import { AUTH_API } from '@repo/config';
import { apiRequest } from './client';

type SignInPayload = {
  email: string;
  password: string;
};

type SignUpPayload = SignInPayload & {
  username: string;
};

export type AuthResponse = {
  token?: string;
  message?: string;
};

export function signIn(payload: SignInPayload) {
  return apiRequest<AuthResponse>(AUTH_API.signin, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function signUp(payload: SignUpPayload) {
  return apiRequest<AuthResponse>(AUTH_API.signup, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
