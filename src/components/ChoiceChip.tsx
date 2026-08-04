import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle
} from 'react-native';

import { colors, radius } from '../theme';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
  variant?: 'pill' | 'tile';
  style?: StyleProp<ViewStyle>;
  role?: 'button' | 'radio';
}

export function ChoiceChip({
  label,
  selected,
  onPress,
  emoji,
  variant = 'pill',
  style,
  role = 'button'
}: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={role === 'radio' ? { checked: selected } : { selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'tile' && styles.tile,
        selected && styles.selected,
        pressed && styles.pressed,
        style
      ]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  selected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2
  },
  tile: {
    minHeight: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  pressed: {
    opacity: 0.8
  },
  emoji: {
    fontSize: 16
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600'
  },
  selectedLabel: {
    color: colors.primaryDark
  }
});
