import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}

export function ChoiceChip({ label, selected, onPress, emoji }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && styles.pressed
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
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
