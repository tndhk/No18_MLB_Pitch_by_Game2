"use client"; // 状態を持つため Client Component に変更

import { useState, useCallback } from 'react';
import { MainLayout } from "@/components/layouts/main-layout";
import { PitcherList } from "@/components/features/pitchers/pitcher-list";
import { SeasonSelector } from '@/components/features/stats/season-selector';
import { GameLogTable } from '@/components/features/stats/game-log-table';
import { PitchDetailView } from '@/components/features/stats/pitch-detail-view';
import { ModeToggle } from "@/components/common/mode-toggle";
import pitchersData from '@/lib/constants/pitchers.json'; // データを読み込む

// 型定義 (共通化推奨)
interface Pitcher {
  id: number;
  name: string;
  nameEn: string;
}
interface PitchersData {
  japanesePitchers: Pitcher[];
}

export default function Home() {
  const [selectedPitcherId, setSelectedPitcherId] = useState<number | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedGamePk, setSelectedGamePk] = useState<number | null>(null);

  // JSONデータを読み込む
  const { japanesePitchers } = pitchersData as PitchersData;

  // ハンドラ関数を useCallback でラップ
  const handlePitcherSelect = useCallback((pitcherId: number | null) => {
    setSelectedPitcherId(pitcherId);
    setSelectedSeason(null);
    setSelectedGamePk(null);
  }, []); // 依存配列は空 (setSelected... は参照が安定しているため)

  const handleSeasonChange = useCallback((season: number | null) => {
    setSelectedSeason(season);
    setSelectedGamePk(null);
  }, []); // 依存配列は空

  const handleGameSelect = useCallback((gamePk: number | null) => {
    setSelectedGamePk(gamePk);
  }, []); // 依存配列は空

  const leftPanelContent = (
    <PitcherList
      pitchers={japanesePitchers}
      onSelect={handlePitcherSelect}
      selectedPitcherId={selectedPitcherId}
    />
  );

  const rightPanelContent = (
    <div className="space-y-6 relative pt-12 md:pt-0">
      <div className="absolute top-4 right-4 md:hidden">
        <ModeToggle />
      </div>
      <div className="absolute top-4 right-6 hidden md:block">
        <ModeToggle />
      </div>

      <div>
        <SeasonSelector pitcherId={selectedPitcherId} onSeasonChange={handleSeasonChange} />
        <div className="mt-4">
          <GameLogTable
            pitcherId={selectedPitcherId}
            season={selectedSeason}
            onRowClick={handleGameSelect}
            selectedGamePk={selectedGamePk}
          />
        </div>
      </div>

      <div>
        <PitchDetailView gamePk={selectedGamePk} pitcherId={selectedPitcherId} />
      </div>
    </div>
  );

  return (
    <MainLayout leftPanel={leftPanelContent} rightPanel={rightPanelContent} />
  );
}
