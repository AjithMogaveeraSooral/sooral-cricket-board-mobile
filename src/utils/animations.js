import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Fade In animation hook
export const useFadeIn = (delay = 0, duration = 500) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity: fadeAnim, transform: [{ translateY }] };
};

// Scale animation hook
export const useScale = (initialScale = 0.9, delay = 0) => {
    const scaleAnim = useRef(new Animated.Value(initialScale)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, []);

    return { transform: [{ scale: scaleAnim }] };
};

// Pulse animation hook
export const usePulse = () => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();
    }, []);

    return { transform: [{ scale: pulseAnim }] };
};

// Shimmer effect for loading states
export const useShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
                easing: Easing.linear,
            })
        ).start();
    }, []);

    return shimmerAnim;
};

// Stagger animation for lists
export const useStaggerAnimation = (itemCount, delay = 100) => {
    const animations = useRef(
        Array(itemCount).fill(0).map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const staggeredAnimations = animations.map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: index * delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            })
        );
        Animated.stagger(delay, staggeredAnimations).start();
    }, [itemCount]);

    return animations;
};

// Animated wrapper component
export const AnimatedCard = ({ children, delay = 0, style }) => {
    const animStyle = useFadeIn(delay);
    
    return (
        <Animated.View style={[style, animStyle]}>
            {children}
        </Animated.View>
    );
};

export default {
    useFadeIn,
    useScale,
    usePulse,
    useShimmer,
    useStaggerAnimation,
    AnimatedCard,
};
