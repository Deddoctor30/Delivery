import { Ref } from "react";
import { TextInput, TextInputInstance, type TextInputProps } from "react-native";

import { cn } from "@/shared/lib/utils";

export const Input = ({
  className,
  ref,
  ...props
}: TextInputProps & { ref?: Ref<TextInputInstance> }) => {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#646a75"
      className={cn(
        "rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground",
        className,
      )}
      {...props}
    />
  );
};
