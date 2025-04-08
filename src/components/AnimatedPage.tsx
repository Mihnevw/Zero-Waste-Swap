import React from 'react';
import { Box, keyframes } from '@mui/material';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  delay?: number;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  animation = 'fade',
  delay = 0 
}) => {
  const getAnimation = () => {
    switch (animation) {
      case 'fade':
        return fadeIn;
      case 'slide':
        return slideIn;
      case 'scale':
        return scaleIn;
      default:
        return fadeIn;
    }
  };

  return (
    <Box
      sx={{
        animation: `${getAnimation()} 0.5s ease-out ${delay}s forwards`,
        opacity: 0,
      }}
    >
      {children}
    </Box>
  );
};

export default AnimatedPage; 