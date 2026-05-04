import { create } from 'zustand';

/**
 * Position interface implementation
 *
 */
interface Position {
    x: number;
    y: number;
}

/**
 * Gamestate interface for variables
 * snake, food, direction, score, gameOver, isPlaying, setDirection, moveSnake, startGame, endGame
 */
interface GameState {
    snake: Position[];
    food: Position;
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    nextDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    score: number;
    gameOver: boolean;
    isPlaying: boolean;
    setDirection: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
    moveSnake: () => void;
    startGame: () => void;
    endGame: () => void;
}

const GRID_SIZE = 20;

const createInitialSnake = (): Position[] => [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];

const createFood = (snake: Position[]): Position => {
    let position: Position;

    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));

    return position;
};

export const useGameStore = create<GameState>((set, get) => ({
    snake: createInitialSnake(),
    food: createFood(createInitialSnake()),
    direction: 'UP',
    nextDirection: 'UP',
    score: 0,
    gameOver: false,
    isPlaying: false,

    setDirection: (newDirection) => {
        const { direction } = get();
        const opposites = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
        };

        if (opposites[newDirection] !== direction) {
            set({ nextDirection: newDirection });
        }
    },

    moveSnake: () => {
        const { snake, food, nextDirection, gameOver } = get();
        if (gameOver) return;

        const direction = nextDirection;
        const head = { ...snake[0] };

        switch (direction) {
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
        }

        if (
            head.x < 0 ||
            head.x >= GRID_SIZE ||
            head.y < 0 ||
            head.y >= GRID_SIZE
        ) {
            set({ gameOver: true, isPlaying: false });
            return;
        }

        if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
            set({ gameOver: true, isPlaying: false });
            return;
        }

        const ateFood = head.x === food.x && head.y === food.y;
        const newSnake = ateFood ? [head, ...snake] : [head, ...snake.slice(0, -1)];

        set({ snake: newSnake, direction });

        if (ateFood) {
            set((state) => ({
                food: createFood(newSnake),
                score: state.score + 10,
            }));
        }
    },

    startGame: () => {
        const freshSnake = createInitialSnake();

        set({
            snake: freshSnake,
            food: createFood(freshSnake),
            direction: 'UP',
            nextDirection: 'UP',
            score: 0,
            gameOver: false,
            isPlaying: true,
        });
    },

    endGame: () => {
        set({ gameOver: true, isPlaying: false });
    },
}));
