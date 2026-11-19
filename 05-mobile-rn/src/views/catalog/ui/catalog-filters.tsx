import { useState } from "react";
import { Switch, Text, View } from "react-native";

import type { GetProductsParams } from "@/entities/product";
import { Button, Input } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

export type CatalogFilterValue = {
  inStock?: boolean;
  discounted?: boolean;
  sort?: GetProductsParams["sort"];
  minPrice?: number;
  maxPrice?: number;
};

const SORTS: { value: NonNullable<CatalogFilterValue["sort"]>; label: string }[] = [
  { value: "newest", label: "Новые" },
  { value: "price_asc", label: "Дешевле" },
  { value: "price_desc", label: "Дороже" },
  { value: "name", label: "По имени" },
];

export function CatalogFilters({
  value,
  onApply,
}: {
  value: CatalogFilterValue;
  onApply: (v: CatalogFilterValue) => void;
}) {
  const [draft, setDraft] = useState<CatalogFilterValue>(value);
  const set = (patch: Partial<CatalogFilterValue>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <View className="gap-4">
      <Text className="font-inter-bold text-lg text-foreground">Фильтры</Text>

      <View className="gap-2">
        <Text className="font-inter-semibold text-sm text-foreground">Сортировка</Text>
        <View className="flex-row flex-wrap gap-2">
          {SORTS.map((s) => {
            const active = draft.sort === s.value;
            return (
              <Text
                key={s.value}
                onPress={() => set({ sort: active ? undefined : s.value })}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-sans text-sm",
                  active ? "border-primary bg-accent text-primary" : "border-border text-foreground",
                )}
              >
                {s.label}
              </Text>
            );
          })}
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-foreground">Только в наличии</Text>
        <Switch value={!!draft.inStock} onValueChange={(v) => set({ inStock: v || undefined })} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-foreground">Со скидкой</Text>
        <Switch value={!!draft.discounted} onValueChange={(v) => set({ discounted: v || undefined })} />
      </View>

      <View className="gap-2">
        <Text className="font-inter-semibold text-sm text-foreground">Цена, ₽</Text>
        <View className="flex-row gap-3">
          <Input
            className="flex-1"
            placeholder="от"
            keyboardType="numeric"
            value={draft.minPrice?.toString() ?? ""}
            onChangeText={(t) => set({ minPrice: t ? Number(t) : undefined })}
          />
          <Input
            className="flex-1"
            placeholder="до"
            keyboardType="numeric"
            value={draft.maxPrice?.toString() ?? ""}
            onChangeText={(t) => set({ maxPrice: t ? Number(t) : undefined })}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <Button label="Сбросить" variant="outline" className="flex-1" onPress={() => onApply({})} />
        <Button label="Применить" className="flex-1" onPress={() => onApply(draft)} />
      </View>
    </View>
  );
}
