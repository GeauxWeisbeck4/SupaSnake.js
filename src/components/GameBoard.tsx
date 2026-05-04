import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

const DIRECTION_MAP = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
} as const;

export const GameBoard: React.FC = () => {
    const { snake, food, moveSnake, setDirection, gameOver, score } = useGameStore(
        (state) => ({
            snake: state.snake,
            food: state.food,
            moveSnake: state.moveSnake,
            setDirection: state.setDirection,
            gameOver: state.gameOver,
            score: state.score,
        })
    );

    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const speed = useMemo(() => Math.max(80, 180 - score * 2), [score]);
    useGameLoop({ moveSnake, isRunning: !gameOver, speed });

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            const direction = DIRECTION_MAP[event.key as keyof typeof DIRECTION_MAP];

            if (direction) {
                setDirection(direction);
            }
        },
        [setDirection]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleTouchEnd = useCallback(
        (event: React.TouchEvent<HTMLDivElement>) => {
            if (!touchStartRef.current) {
                return;
            }

            const touch = event.changedTouches[0];
            const dx = touch.clientX - touchStartRef.current.x;
            const dy = touch.clientY - touchStartRef.current.y;
            const threshold = 24;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
                setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
            } else if (Math.abs(dy) > threshold) {
                setDirection(dy > 0 ? 'DOWN' : 'UP');
            }

            touchStartRef.current = null;
        },
        [setDirection]
    );

    return (
        <div className="space-y-4">
            <div
                className="relative bg-gray-600 border-2 border-gray-600 touch-pan-y"
                style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {snake.map((segment, index) => (
                    <div
                        key={`${segment.x}-${segment.y}-${index}`}
                        className="absolute bg-lime-500 rounded-sm transition-all duration-100"
                        style={{
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2,
                            left: segment.x * CELL_SIZE,
                            top: segment.y * CELL_SIZE,
                        }}
                    />
                ))}
                <div
                    className="absolute bg-red-500 rounded-full"
                    style={{
                        width: CELL_SIZE - 2,
                        height: CELL_SIZE - 2,
                        left: food.x * CELL_SIZE,
                        top: food.y * CELL_SIZE,
                    }}
                />
            </div>

            <div className="md:hidden grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => setDirection('UP')}
                    className="bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition"
                >
                    Up
                </button>
                <button
                    type="button"
                    onClick={() => setDirection('LEFT')}
                    className="bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition"
                >
                    Left
                </button>
                <button
                    type="button"
                    onClick={() => setDirection('RIGHT')}
                    className="bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition"
                >
                    Right
                </button>
                <div className="col-span-3">
                    <button
                        type="button"
                        onClick={() => setDirection('DOWN')}
                        className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition"
                    >
                        Down
                    </button>
                </div>
            </div>
        </div>
    );
};
