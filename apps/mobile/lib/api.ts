import Constants from 'expo-constants';

const DEFAULT_API_URL = 'https://463f7f319008.ngrok-free.app';

export const API_BASE_URL: string =
  (process.env.EXPO_PUBLIC_API_URL as string) ||
  // @ts-ignore expo-constants extra may be undefined
  (Constants?.expoConfig?.extra?.API_URL as string) ||
  DEFAULT_API_URL;

type TrpcEnvelope<T> = { result?: { data?: T } };

export async function trpcMutation<TInput extends object, TOutput>(
  path: string,
  input: TInput,
  options?: { token?: string },
): Promise<TOutput> {
  const endpoint = `${API_BASE_URL}/trpc/${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  const raw = await response.text();
  
  if (raw) {
    try {
      const preview = raw.length > 500 ? raw.slice(0, 500) + '…' : raw;

    } catch {}
  }

  // Tente de parser le JSON si possible, sans relire le flux
  let parsed: any = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  // Gestion des erreurs HTTP
  if (!response.ok) {
    const serverMessage =
      parsed?.error?.message || parsed?.message || raw || `Erreur HTTP ${response.status}`;

    // Normalisation des messages usuels
    const normalized = normalizeErrorMessage(serverMessage, response.status);

    throw new Error(normalized);
  }

  // Même en 200, tRPC peut renvoyer un objet avec "error"
  if (parsed?.error?.message) {
    const normalized = normalizeErrorMessage(parsed.error.message, 400);

    throw new Error(normalized);
  }

  const envelope = parsed as TrpcEnvelope<TOutput>;
  if (envelope?.result?.data === undefined) {
    throw new Error('Réponse invalide du serveur');
  }
  return envelope.result.data as TOutput;
}

export async function trpcQuery<TInput extends object | undefined, TOutput>(
  path: string,
  input?: TInput,
  options?: { token?: string },
): Promise<TOutput> {
  const queryParam = input ? `?input=${encodeURIComponent(JSON.stringify(input))}` : '';
  const endpoint = `${API_BASE_URL}/trpc/${path}${queryParam}`;
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });
  const raw = await response.text();
  
  if (raw) {
    try {
      const preview = raw.length > 500 ? raw.slice(0, 500) + '…' : raw;

    } catch {}
  }

  let parsed: any = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const serverMessage =
      parsed?.error?.message || parsed?.message || raw || `Erreur HTTP ${response.status}`;
    const normalized = normalizeErrorMessage(serverMessage, response.status);

    throw new Error(normalized);
  }

  if (parsed?.error?.message) {
    const normalized = normalizeErrorMessage(parsed.error.message, 400);

    throw new Error(normalized);
  }

  const envelope = parsed as TrpcEnvelope<TOutput>;
  if (envelope?.result?.data === undefined) {
    throw new Error('Réponse invalide du serveur');
  }
  return envelope.result.data as TOutput;
}

function normalizeErrorMessage(message: string, status?: number): string {
  const msg = (message || '').toLowerCase();
  if (status === 401 || msg.includes('unauthorized') || msg.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect';
  }
  if (status === 409 || msg.includes('already exists')) {
    return 'Un compte existe déjà avec cet email';
  }
  if (msg.includes('not found') && msg.includes('user')) {
    return "Compte introuvable";
  }
  return message || 'Une erreur est survenue';
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  points: number;
  barcode: string;
  created_at: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}


