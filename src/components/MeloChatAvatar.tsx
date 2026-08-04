import { View } from 'react-native';

import type { MeloExpression, PetMood } from '../types';
import { MeloPet } from './MeloPet';

interface MeloChatAvatarProps {
  size: number;
  expression: MeloExpression;
  animate?: boolean;
  stars?: number;
}

const moodForExpression: Record<MeloExpression, PetMood> = {
  calm: 'idle',
  listening: 'checking',
  thinking: 'checking',
  encouraging: 'proud',
  concerned: 'listening'
};

/**
 * Chat deliberately reuses the exact same Melo component as Home. The model
 * may select only a validated expression; it cannot supply styles or motion.
 */
export function MeloChatAvatar({
  size,
  expression,
  animate = false,
  stars = 0
}: MeloChatAvatarProps) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <MeloPet
        mood={moodForExpression[expression]}
        size={size}
        stars={stars}
        expression={expression}
        animated={animate}
      />
    </View>
  );
}
