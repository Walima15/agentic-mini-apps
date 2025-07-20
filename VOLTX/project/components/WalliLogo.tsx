import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface WalliLogoProps {
  size?: number;
}

export default function WalliLogo({ size = 32 }: WalliLogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F97316" />
            <Stop offset="100%" stopColor="#EA580C" />
          </LinearGradient>
          <LinearGradient id="bitcoinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#FFA500" />
          </LinearGradient>
        </Defs>
        
        {/* Wallet body */}
        <Rect
          x="4"
          y="8"
          width="24"
          height="18"
          rx="3"
          ry="3"
          fill="url(#walletGradient)"
          stroke="#FFFFFF"
          strokeWidth="0.5"
        />
        
        {/* Wallet fold/flap */}
        <Path
          d="M6 8 L26 8 L24 5 L8 5 Z"
          fill="#EA580C"
          stroke="#FFFFFF"
          strokeWidth="0.5"
        />
        
        {/* Bitcoin coin */}
        <Circle
          cx="20"
          cy="17"
          r="6"
          fill="url(#bitcoinGradient)"
          stroke="#FFFFFF"
          strokeWidth="1"
        />
        
        {/* Bitcoin symbol */}
        <Path
          d="M17.5 14 L17.5 20 M22.5 14 L22.5 20 M18 15 L21 15 C21.5 15 22 15.5 22 16 S21.5 17 21 17 L18 17 M18 17 L21.5 17 C22 17 22.5 17.5 22.5 18 S22 19 21.5 19 L18 19"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Wallet card slot */}
        <Rect
          x="7"
          y="12"
          width="10"
          height="1.5"
          rx="0.75"
          fill="#FFFFFF"
          opacity="0.3"
        />
        
        {/* Wallet card slot */}
        <Rect
          x="7"
          y="15"
          width="8"
          height="1.5"
          rx="0.75"
          fill="#FFFFFF"
          opacity="0.2"
        />
      </Svg>
    </View>
  );
}