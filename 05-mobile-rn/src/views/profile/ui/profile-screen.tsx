import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AVATAR_OPTIONS, avatarSrc, updateMe, type AvatarId, type User } from "@/entities/user";
import { authErrorMessage, loginOrRegister, useSession, type AuthMode } from "@/features/auth";
import { ApiError } from "@/shared/api/error";
import { formatDate } from "@/shared/lib/format";
import { useTheme } from "@/shared/lib/theme";
import { cn } from "@/shared/lib/utils";
import { BottomSheet, Button, Input } from "@/shared/ui";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-inter-medium text-sm text-foreground">{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="font-sans text-muted-foreground">{label}</Text>
      <Text className="font-sans text-foreground">{value}</Text>
    </View>
  );
}

/* ── Гость: вход/регистрация ─────────────────────────────────────────────── */
function AuthForm() {
  const { setUser } = useSession();
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

  return (
    <View className="gap-3 px-6 pt-8">
      <Text className="font-inter-bold text-2xl text-foreground">
        {mode === "login" ? "Вход" : "Регистрация"}
      </Text>
      <Input
        placeholder="email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="пароль (мин. 8)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text className="font-sans text-destructive">{error}</Text>}
      <Button
        label={mode === "login" ? "Войти" : "Зарегистрироваться"}
        loading={busy}
        onPress={submit}
      />
      <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
        <Text className="text-center font-sans text-primary">
          {mode === "login" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
        </Text>
      </Pressable>
    </View>
  );
}

/* ── Залогинен: профиль ──────────────────────────────────────────────────── */
function ProfileView({
  user,
  setUser,
  logout,
}: {
  user: User;
  setUser: (u: User) => void;
  logout: () => void | Promise<void>;
}) {
  const { colorScheme, toggle } = useTheme();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const initials = (
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
    user.email[0] ||
    "?"
  ).toUpperCase();
  const src = avatarSrc(user.avatarId);

  function startEdit() {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      setUser(
        await updateMe({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      );
      setEditing(false);
    } catch (e) {
      Alert.alert("Не удалось сохранить", e instanceof ApiError ? e.message : "Попробуйте позже");
    } finally {
      setSaving(false);
    }
  }

  async function pickAvatar(id: AvatarId) {
    setAvatarSaving(true);
    try {
      setUser(await updateMe({ avatarId: id }));
      setPickerOpen(false);
    } catch (e) {
      Alert.alert(
        "Не удалось обновить аватар",
        e instanceof ApiError ? e.message : "Попробуйте позже",
      );
    } finally {
      setAvatarSaving(false);
    }
  }

  return (
    <ScrollView contentContainerClassName="gap-4 p-4">
      {/* Шапка */}
      <View className="items-center gap-3 rounded-xl bg-card p-5">
        <Pressable onPress={() => setPickerOpen(true)} className="items-center active:opacity-80">
          <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary">
            {src ? (
              <Image
                source={{ uri: src }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <Text className="font-inter-bold text-2xl text-secondary-foreground">{initials}</Text>
            )}
          </View>
          <Text className="mt-1 font-sans text-xs text-primary">Сменить</Text>
        </Pressable>
        <View className="items-center">
          <Text className="font-inter-bold text-lg text-card-foreground">{displayName}</Text>
          <Text className="font-sans text-sm text-muted-foreground">{user.email}</Text>
          <Text className="mt-0.5 font-sans text-xs text-muted-foreground">
            С нами с {formatDate(user.createdAt)}
          </Text>
        </View>
      </View>

      {/* Личные данные */}
      <View className="gap-3 rounded-xl bg-card p-4">
        <Text className="font-inter-semibold text-base text-card-foreground">Личные данные</Text>
        {editing ? (
          <>
            <Field label="Имя" value={firstName} onChangeText={setFirstName} placeholder="Имя" />
            <Field
              label="Фамилия"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Фамилия"
            />
            <Field
              label="Телефон"
              value={phone}
              onChangeText={setPhone}
              placeholder="+7..."
              keyboardType="phone-pad"
            />
            <View className="flex-row gap-2">
              <Button label="Сохранить" className="flex-1" loading={saving} onPress={save} />
              <Button
                label="Отмена"
                variant="ghost"
                className="flex-1"
                disabled={saving}
                onPress={() => setEditing(false)}
              />
            </View>
          </>
        ) : (
          <>
            <Row label="Имя" value={displayName} />
            <Row label="Телефон" value={user.phone ?? "Не указан"} />
            <Button label="Редактировать" variant="outline" onPress={startEdit} />
          </>
        )}
      </View>

      {/* Тема */}
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between rounded-xl bg-card p-4 active:opacity-80"
      >
        <Text className="font-inter-semibold text-base text-card-foreground">Тёмная тема</Text>
        <Text className="font-sans text-sm text-muted-foreground">
          {colorScheme === "dark" ? "Вкл" : "Выкл"}
        </Text>
      </Pressable>

      {user.role === "ADMIN" && (
        <Button label="Админ-панель" variant="outline" onPress={() => router.push("/admin")} />
      )}

      {/* Выход */}
      <Button label="Выйти" variant="destructive" onPress={() => void logout()} />

      {/* Пикер аватара */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <Text className="mb-4 text-center font-inter-semibold text-base text-card-foreground">
          Выбор аватара
        </Text>
        <View className="flex-row justify-center gap-6">
          {AVATAR_OPTIONS.map((opt) => {
            const url = avatarSrc(opt.id);
            const active = user.avatarId === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => pickAvatar(opt.id)}
                disabled={avatarSaving}
                className="items-center gap-2 active:opacity-80"
              >
                <View
                  className={cn(
                    "h-20 w-20 overflow-hidden rounded-full border-2",
                    active ? "border-primary" : "border-transparent",
                  )}
                >
                  {url ? (
                    <Image
                      source={{ uri: url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  ) : null}
                </View>
                <Text className="font-sans text-sm text-foreground">{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

export function ProfileScreen() {
  const { user, loading, setUser, logout } = useSession();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Text className="px-4 py-3 font-inter-bold text-2xl text-foreground">Профиль</Text>
      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : user ? (
        <ProfileView user={user} setUser={setUser} logout={logout} />
      ) : (
        <AuthForm />
      )}
    </SafeAreaView>
  );
}
