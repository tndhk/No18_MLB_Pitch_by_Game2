"use client"; // Client Component に変更

import React from 'react';
import { cn } from "@/lib/utils";

// pitchers.json の型定義 (より厳密にするなら zod などでスキーマ定義推奨)
interface Pitcher {
  id: number;
  name: string;
  nameEn: string;
}

interface PitcherListProps {
  pitchers: Pitcher[]; // 投手データを Props で受け取る
  onSelect: (id: number | null) => void; // 選択時に呼び出すコールバック
  selectedPitcherId: number | null; // 現在選択中の投手ID
}

export const PitcherList: React.FC<PitcherListProps> = ({ pitchers, onSelect, selectedPitcherId }) => {

  if (!pitchers || pitchers.length === 0) {
    return <p>投手データが見つかりません。</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">日本人投手リスト</h2>
      <ul className="space-y-1">
        {pitchers.map((pitcher) => (
          <li key={pitcher.id}>
            <button
              type="button"
              onClick={() => onSelect(pitcher.id)} // クリック時に onSelect を呼び出す
              className={cn(
                "w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
                selectedPitcherId === pitcher.id ? "bg-blue-100 dark:bg-blue-900" : ""
              )}
            >
              {pitcher.name} ({pitcher.nameEn})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 