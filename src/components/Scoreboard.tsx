import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Score {
    id: string;
    player_name: string;
    score: number;
    created_at: string;
}

export const Scoreboard: React.FC = () => {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchScores = async () => {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(10);

            if (!isMounted) {
                return;
            }

            if (fetchError) {
                setError(fetchError.message);
                setScores([]);
            } else {
                setScores(data ?? []);
                setError(null);
            }

            setLoading(false);
        };

        fetchScores();

        const subscription = supabase
            .channel('scores')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, () => {
                void fetchScores();
            })
            .subscribe();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Top 10 Scores</h2>

            {loading ? (
                <p className="text-gray-300">Loading leaderboard...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : scores.length === 0 ? (
                <p className="text-gray-300">No scores yet. Be the first!</p>
            ) : (
                <div className="space-y-2">
                    {scores.map((score, index) => (
                        <div
                            key={score.id}
                            className="flex justify-between items-center bg-gray-700 p-2 rounded"
                        >
                            <span className="text-white">
                                {index + 1}. {score.player_name || 'Anonymous'}
                            </span>
                            <span className="text-yellow-400 font-bold">{score.score}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
