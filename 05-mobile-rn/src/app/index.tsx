import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ApiError } from "@/shared/api/error";
import { authErrorMessage, loginOrRegister, useSession, type AuthMode } from "@/features/auth";

export default function Index() {
  const { user, loading, setUser, logout } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("register");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      setUser(await loginOrRegister(email.trim(), password, mode));
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      const code = e instanceof ApiError ? e.code : undefined;
      setError(authErrorMessage(status, code, mode));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (user) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="font-inter-bold text-xl text-foreground">Вы вошли ✅</Text>
        <Text className="font-sans text-muted-foreground">{user.email}</Text>
        <Text className="font-sans text-muted-foreground">роль: {user.role}</Text>
        <Pressable onPress={logout} className="rounded-lg bg-destructive px-6 py-3 active:opacity-80">
          <Text className="font-inter-semibold text-destructive-foreground">Выйти</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center gap-3 bg-background px-6">
      <Text className="font-inter-bold text-2xl text-foreground">
        {mode === "login" ? "Вход" : "Регистрация"}
      </Text>
      <TextInput
        className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
        placeholder="email"
        placeholderTextColor="#646a75"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
        placeholder="пароль (мин. 8)"
        placeholderTextColor="#646a75"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text className="font-sans text-destructive">{error}</Text>}
      <Pressable onPress={submit} disabled={busy} className="rounded-lg bg-primary px-6 py-3 active:opacity-80">
        <Text className="text-center font-inter-semibold text-primary-foreground">
          {busy ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
        <Text className="text-center font-sans text-primary">
          {mode === "login" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
        </Text>
      </Pressable>
    </View>
  );
}
