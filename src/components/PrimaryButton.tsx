import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle
} from 'react-native';

import { colors, radius } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: ReactNode;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon,
  style
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const labelStyle =
    variant === 'primary'
      ? styles.primaryLabel
      : variant === 'secondary'
        ? styles.secondaryLabel
        : variant === 'danger'
          ? styles.dangerLabel
          : styles.ghostLabel;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    borderWidth: 1
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center'
  },
  primaryLabel: {
    color: '#FFFFFF'
  },
  secondaryLabel: {
    color: colors.primaryDark
  },
  ghostLabel: {
    color: colors.ink
  },
  dangerLabel: {
    color: colors.danger
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9
  }
});
