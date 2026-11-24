import * as SecureStore from "expo-secure-store";

const ACCESS = "auth.access";
const REFRESH = "auth.refresh";
const SESSION = "auth.session";

export type Tokens = { accessToken: string; refreshToken: string; sessionId: string };

export async function saveTokens(t: Tokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS, t.accessToken),
    SecureStore.setItemAsync(REFRESH, t.refreshToken),
    SecureStore.setItemAsync(SESSION, t.sessionId),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS);
}

/** refresh + sessionId вместе — бэк для /auth/refresh требует оба. */
export async function getRefreshData(): Promise<{ refreshToken: string; sessionId: string } | null> {
  const [refreshToken, sessionId] = await Promise.all([
    SecureStore.getItemAsync(REFRESH),
    SecureStore.getItemAsync(SESSION),
  ]);
  return refreshToken && sessionId ? { refreshToken, sessionId } : null;
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS),
    SecureStore.deleteItemAsync(REFRESH),
    SecureStore.deleteItemAsync(SESSION),
  ]);
}
