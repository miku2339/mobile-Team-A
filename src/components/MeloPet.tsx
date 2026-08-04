import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import type { PetMood } from '../types';

interface MeloPetProps {
  mood: PetMood;
  size?: number;
  stars?: number;
}

const faceByMood: Record<PetMood, string> = {
  idle: '• ᴗ •',
  listening: '• ︵ •',
  checking: '• ◡ •',
  breathing: '－ ᴗ －',
  proud: '˶ᵔ ᵕ ᵔ˶'
};

export function MeloPet({ mood, size = 150, stars = 0 }: MeloPetProps) {
  const bob = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -6,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    bobLoop.start();
    return () => bobLoop.stop();
  }, [bob]);

  useEffect(() => {
    breathe.stopAnimation();
    breathe.setValue(1);
    if (mood !== 'breathing') return;

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.13,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    breatheLoop.start();
    return () => breatheLoop.stop();
  }, [breathe, mood]);

  const accessory = useMemo(() => {
    if (stars >= 15) return '👑';
    if (stars >= 7) return '🧣';
    if (stars >= 3) return '🌱';
    return '';
  }, [stars]);

  return (
    <View style={[styles.stage, { width: size * 1.35, height: size * 1.15 }]}>
      {mood === 'breathing' ? (
        <Animated.View
          style={[
            styles.breatheHalo,
            {
              width: size * 1.13,
              height: size * 1.13,
              borderRadius: size,
              transform: [{ scale: breathe }]
            }
          ]}
        />
      ) : null}

      <Animated.View
        style={[
          styles.petWrap,
          {
            width: size,
            height: size * 0.9,
            transform: [{ translateY: bob }, { scale: breathe }]
          }
        ]}
      >
        <View
          style={[
            styles.ear,
            styles.leftEar,
            {
              width: size * 0.27,
              height: size * 0.27,
              borderRadius: size
            }
          ]}
        />
        <View
          style={[
            styles.ear,
            styles.rightEar,
            {
              width: size * 0.27,
              height: size * 0.27,
              borderRadius: size
            }
          ]}
        />
        <View
          style={[
            styles.body,
            {
              width: size,
              height: size * 0.82,
              borderRadius: size * 0.42
            }
          ]}
        >
          {accessory ? <Text style={[styles.accessory, { fontSize: size * 0.2 }]}>{accessory}</Text> : null}
          <Text style={[styles.face, { fontSize: size * 0.16 }]}>{faceByMood[mood]}</Text>
          <View style={[styles.blushRow, { top: size * 0.47 }]}>
            <View style={[styles.blush, { width: size * 0.11, height: size * 0.05 }]} />
            <View style={[styles.blush, { width: size * 0.11, height: size * 0.05 }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  breatheHalo: {
    position: 'absolute',
    backgroundColor: colors.mint,
    opacity: 0.8
  },
  petWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  ear: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#9A8CF2',
    borderWidth: 5,
    borderColor: colors.primarySoft
  },
  leftEar: {
    left: '8%'
  },
  rightEar: {
    right: '8%'
  },
  body: {
    backgroundColor: '#A99AF6',
    borderWidth: 6,
    borderColor: '#EAE5FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  face: {
    color: colors.ink,
    fontWeight: '700',
    letterSpacing: 1
  },
  accessory: {
    position: 'absolute',
    top: 2,
    right: '9%'
  },
  blushRow: {
    position: 'absolute',
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  blush: {
    borderRadius: 100,
    backgroundColor: '#E988A2',
    opacity: 0.55
  }
});
