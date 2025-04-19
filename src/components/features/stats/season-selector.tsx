"use client";

import React, { useState, useEffect } from 'react';
import { getAvailableSeasons, Season } from '@/dal/mlb'; // DAL 関数と型をインポート
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Shadcn/ui の Select をインポート
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton をインポート

interface SeasonSelectorProps {
  pitcherId: number | null; // 選択された投手のID。nullの場合は何も表示しない
  onSeasonChange: (season: number | null) => void; // シーズン変更時に呼び出されるコールバック
}

// モックAPI関数は不要になったので削除
/*
const fetchSeasonsForPitcher = async (pitcherId: number): Promise<Season[]> => {
  // ... (モック実装)
};
*/

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ pitcherId, onSeasonChange }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>(""); // Shadcn Select は文字列で値を扱う
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pitcherId === null) {
      setSeasons([]);
      setSelectedSeason("");
      setError(null);
      setIsLoading(false);
      onSeasonChange(null); // 投手選択が解除されたらシーズンもリセット
      return;
    }

    const loadSeasons = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedSeason("");
      onSeasonChange(null);
      try {
        // 実際のAPI呼び出しに置き換え
        const fetchedSeasons = await getAvailableSeasons(pitcherId);
        setSeasons(fetchedSeasons);
        if (fetchedSeasons.length > 0) {
          const latestSeason = fetchedSeasons[0].year.toString();
          setSelectedSeason(latestSeason);
          onSeasonChange(parseInt(latestSeason, 10));
        }
      } catch (err) {
        console.error("Error fetching seasons:", err);
        // エラーメッセージは DAL からのスローされたものを使用するか、ここで設定
        setError(err instanceof Error ? err.message : "シーズンの取得に失敗しました。");
        setSeasons([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeasons();
  }, [pitcherId, onSeasonChange]);

  const handleValueChange = (value: string) => {
    setSelectedSeason(value);
    onSeasonChange(value ? parseInt(value, 10) : null);
  };

  if (pitcherId === null) {
    return null; // 投手が選択されていない場合は何も表示しない
  }

  if (isLoading) {
    return (
      <div className="w-[180px] space-y-2">
        <Skeleton className="h-4 w-1/3" /> {/* Label Skeleton */} 
        <Skeleton className="h-10 w-full" /> {/* Select Skeleton */} 
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">エラー: {error}</p>;
  }

  if (seasons.length === 0) {
    return <p>利用可能なシーズンがありません。</p>;
  }

  return (
    <div className="w-[180px]"> {/* Select の幅を指定 */} 
      <Select value={selectedSeason} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="シーズン選択" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((season) => (
            <SelectItem key={season.year} value={season.year.toString()}>
              {season.year}年
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 