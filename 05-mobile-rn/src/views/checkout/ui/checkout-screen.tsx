import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View, type KeyboardTypeOptions } from "react-native";

import { useSession } from "@/features/auth";
import { CART_QUERY_KEY, useCart } from "@/features/cart";
import { createOrder, estimateDelivery, reverseGeocode, type DeliveryEstimate } from "@/features/checkout";
import { ApiError } from "@/shared/api/error";
import { formatPrice } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button, Input, MapPicker, type MapPickerCoords } from "@/shared/ui";

const DEFAULT_COORDS: MapPickerCoords = { lat: 55.7558, lng: 37.6173 }; // Москва
const FALLBACK_COST = 149;

/** Склонение «день/дня/дней». */
function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} дня`;
  return `${n} дней`;
}

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
      <Input value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-muted-foreground"}>{label}</Text>
      <Text className={bold ? "font-inter-bold text-foreground" : "font-sans text-foreground"}>{value}</Text>
    </View>
  );
}

export function CheckoutScreen() {
  const { user } = useSession();
  const { lines, subtotal } = useCart();
  const qc = useQueryClient();

  const [coords, setCoords] = useState<MapPickerCoords>(DEFAULT_COORDS);
  const [street, setStreet] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [comment, setComment] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debounced = useDebouncedValue(coords, 400);

  // Живой расчёт доставки при смене точки (с дебаунсом).
  useEffect(() => {
    let cancelled = false;
    void estimateDelivery(debounced.lat, debounced.lng).then((e) => {
      if (!cancelled) setEstimate(e);
    });
    return () => {
      cancelled = true;
    };
  }, [debounced.lat, debounced.lng]);

  // Клик/перетаскивание точки → обратный геокодинг → автозаполнение адреса.
  function handleMapChange(c: MapPickerCoords) {
    setCoords(c);
    setGeocoding(true);
    void reverseGeocode(c.lat, c.lng).then((addr) => {
      setGeocoding(false);
      if (!addr) return;
      if (addr.city) setCity(addr.city);
      if (addr.street) setStreet(addr.street);
      if (addr.zip) setZip(addr.zip);
    });
  }

  const deliveryCost = estimate?.cost ?? FALLBACK_COST;
  const total = subtotal + deliveryCost;
  const eta = estimate ? pluralDays(estimate.days) : "—";

  async function onSubmit() {
    // Гость → предлагаем войти (заказ создаётся из серверной корзины).
    if (!user) {
      Alert.alert("Нужен вход", "Войдите или зарегистрируйтесь, чтобы оформить заказ.", [
        { text: "Отмена", style: "cancel" },
        { text: "Войти", onPress: () => router.push("/profile") },
      ]);
      return;
    }
    if (lines.length === 0) {
      Alert.alert("Корзина пуста");
      return;
    }
    if (street.trim().length < 5) {
      Alert.alert("Проверьте адрес", "Укажите улицу и дом");
      return;
    }
    if (city.trim().length < 2) {
      Alert.alert("Проверьте адрес", "Укажите город");
      return;
    }

    const deliveryAddress = [city, street, apt && `кв./оф. ${apt}`, zip, comment]
      .filter(Boolean)
      .join(", ");

    setSubmitting(true);
    try {
      await createOrder({ deliveryAddress, deliveryLat: coords.lat, deliveryLng: coords.lng });
      qc.setQueryData(CART_QUERY_KEY, []); // бэк уже очистил корзину — сбрасываем кеш
      router.replace("/checkout/success");
    } catch (e) {
      Alert.alert("Не удалось оформить", e instanceof ApiError ? e.message : "Попробуйте позже");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="font-inter-bold text-xl text-foreground">Корзина пуста</Text>
        <Text className="text-center font-sans text-muted-foreground">Добавьте товары, чтобы оформить заказ</Text>
        <Button label="В каталог" onPress={() => router.replace("/catalog")} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      {/* Адрес */}
      <View className="gap-4 rounded-xl bg-card p-4">
        <Text className="font-inter-semibold text-base text-card-foreground">Адрес доставки</Text>
        <Field label="Улица, дом" value={street} onChangeText={setStreet} placeholder="ул. Ленина, д. 10" />
        <Field label="Квартира / офис" value={apt} onChangeText={setApt} placeholder="Кв. 42" />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="Город" value={city} onChangeText={setCity} placeholder="Москва" />
          </View>
          <View className="flex-1">
            <Field label="Индекс" value={zip} onChangeText={setZip} placeholder="101000" keyboardType="number-pad" />
          </View>
        </View>
        <Field label="Комментарий курьеру" value={comment} onChangeText={setComment} placeholder="Код домофона, этаж" />
      </View>

      {/* Карта */}
      <View className="gap-2 overflow-hidden rounded-xl bg-card p-2">
        <View className="flex-row items-center gap-1.5 px-1">
          <MapPin size={14} color="#646a75" />
          <Text className="font-sans text-xs text-muted-foreground">
            {geocoding ? "Определяем адрес по точке…" : "Нажмите на карту — адрес заполнится сам"}
          </Text>
        </View>
        <View className="overflow-hidden rounded-lg">
          <MapPicker value={coords} onChange={handleMapChange} height={300} />
        </View>
      </View>

      {/* Сводка */}
      <View className="gap-3 rounded-xl bg-card p-4">
        <Text className="font-inter-semibold text-base text-card-foreground">Ваш заказ</Text>
        {lines.map((l) => (
          <View key={l.product.id} className="flex-row justify-between gap-2">
            <Text numberOfLines={1} className="flex-1 font-sans text-sm text-foreground">
              {l.product.title} ×{l.quantity}
            </Text>
            <Text className="font-inter-medium text-sm text-foreground">{formatPrice(l.product.price * l.quantity)}</Text>
          </View>
        ))}
        <View className="h-px bg-border" />
        <Row label="Товары" value={formatPrice(subtotal)} />
        <Row label="Доставка" value={deliveryCost > 0 ? formatPrice(deliveryCost) : "Бесплатно"} />
        <Row label="Срок доставки" value={eta} />
        <View className="h-px bg-border" />
        <Row label="Итого" value={formatPrice(total)} bold />
      </View>

      <Button
        label={submitting ? "Оформляем…" : "Оплатить"}
        size="lg"
        loading={submitting}
        disabled={submitting}
        onPress={onSubmit}
      />
      <Text className="pb-2 text-center font-sans text-xs text-muted-foreground">
        Нажимая «Оплатить», вы принимаете условия обработки данных
      </Text>
    </ScrollView>
  );
}
