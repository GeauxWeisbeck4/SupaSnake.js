import { useEffect, useRef } from 'react';

interface UseGameLoopProps {
  moveSnake: () => void;
  isRunning: boolean;
  speed: number;
}

export const useGameLoop = ({ moveSnake, isRunning, speed }: UseGameLoopProps) => {
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    lastTimeRef.current = performance.now();

    const tick = (time: number) => {
      if (time - lastTimeRef.current >= speedRef.current) {
        moveSnake();
        lastTimeRef.current = time;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, moveSnake]);
};
