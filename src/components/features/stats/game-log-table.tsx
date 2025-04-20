"use client";

import React, { useState, useEffect } from 'react';
import { getGameLog, GameLogRow } from '@/dal/mlb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PitchDataRow } from '@/dal/mlb';

interface GameLogTableProps {
  pitcherId: number | null;
  season: number | null;
  onRowClick: (gamePk: number | null) => void;
  selectedGamePk: number | null;
}

export const GameLogTable: React.FC<GameLogTableProps> = ({ pitcherId, season, onRowClick, selectedGamePk }) => {
  const [gameLogs, setGameLogs] = useState<GameLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pitcherId === null || season === null) {
      setGameLogs([]);
      setError(null);
      setIsLoading(false);
      onRowClick(null);
      return;
    }

    const loadGameLogs = async () => {
      setIsLoading(true);
      setError(null);
      onRowClick(null);
      try {
        const fetchedGameLogs = await getGameLog(pitcherId, season);
        // pitchesThrown を詳細APIから取得して上書き (pitch-detail のイベント数をカウント)
        const enrichedLogs: GameLogRow[] = await Promise.all(
          fetchedGameLogs.map(async (log) => {
            try {
              const res = await fetch(`/api/pitch-data/${log.gamePk}`);
              if (!res.ok) return log;
              const detailData: PitchDataRow[] = await res.json();
              // 選択中投手かつType/Speedが有効な投球イベントのみ数える
              const count = detailData.filter((d: PitchDataRow) =>
                d.pitcherId === pitcherId &&
                d.pitchType !== 'N/A' &&
                d.speed !== 'N/A'
              ).length;
              return { ...log, pitchesThrown: count };
            } catch (e) {
              console.warn(`Failed to fetch pitch-detail for gamePk ${log.gamePk}`, e);
              return log;
            }
          })
        );
        setGameLogs(enrichedLogs);
      } catch (err) {
        console.error("Error fetching game logs:", err);
        setError(err instanceof Error ? err.message : "試合ログの取得に失敗しました。");
        setGameLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameLogs();
  }, [pitcherId, season, onRowClick]);

  // 成績合計の計算
  const totalStats = React.useMemo(() => {
    const parseIP = (ipStr: string) => {
      const [whole, dec] = ipStr.split('.');
      const wholeNum = parseInt(whole, 10) || 0;
      const decNum = parseInt(dec, 10) || 0;
      const outs = decNum === 1 ? 1/3 : decNum === 2 ? 2/3 : 0;
      return wholeNum + outs;
    };
    const totalP = gameLogs.reduce((sum, log) => sum + log.pitchesThrown, 0);
    const totalSO = gameLogs.reduce((sum, log) => sum + log.strikeOuts, 0);
    const totalBB = gameLogs.reduce((sum, log) => sum + log.baseOnBalls, 0);
    const totalR = gameLogs.reduce((sum, log) => sum + log.runs, 0);
    const totalH = gameLogs.reduce((sum, log) => sum + log.hits, 0);
    const totalER = gameLogs.reduce((sum, log) => sum + log.earnedRuns, 0);
    const totalHR = gameLogs.reduce((sum, log) => sum + log.homeRuns, 0);
    const totalW = gameLogs.filter(log => log.result === 'W').length;
    const totalL = gameLogs.filter(log => log.result === 'L').length;
    const totalIPFloat = gameLogs.reduce((sum, log) => sum + parseIP(log.inningsPitched), 0);
    const ipWhole = Math.floor(totalIPFloat);
    const outsNum = Math.round((totalIPFloat - ipWhole) * 3);
    const totalIP = `${ipWhole}.${outsNum}`;
    const totalERA = totalIPFloat > 0 ? ((totalER / totalIPFloat) * 9).toFixed(2) : '0.00';
    const totalWHIP = totalIPFloat > 0 ? ((totalBB + totalH) / totalIPFloat).toFixed(2) : '0.00';
    return { totalIP, totalP, totalSO, totalBB, totalR, totalH, totalER, totalHR, totalW, totalL, totalERA, totalWHIP };
  }, [gameLogs]);

  if (pitcherId === null || season === null) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"><Skeleton className="h-4 w-3/4" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-1/2" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">エラー</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (gameLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{season}年 試合ログ</CardTitle>
        </CardHeader>
        <CardContent>
          <p>このシーズンの試合データはありません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{season} Game Log</CardTitle>
        <CardDescription>Select a game to view pitch details below.</CardDescription>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <div>Games: {gameLogs.length}</div>
          <div>Wins: {totalStats.totalW}</div>
          <div>Losses: {totalStats.totalL}</div>
          <div>IP: {totalStats.totalIP}</div>
          <div>ERA: {totalStats.totalERA}</div>
          <div>WHIP: {totalStats.totalWHIP}</div>
          <div>SO: {totalStats.totalSO}</div>
          <div>BB: {totalStats.totalBB}</div>
          <div>R: {totalStats.totalR}</div>
          <div>H: {totalStats.totalH}</div>
          <div>ER: {totalStats.totalER}</div>
          <div>HR: {totalStats.totalHR}</div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead className="text-right">Result</TableHead>
              <TableHead className="text-right">IP</TableHead>
              <TableHead className="text-right">P</TableHead>
              <TableHead className="text-right">SO</TableHead>
              <TableHead className="text-right">BB</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">WHIP</TableHead>
              <TableHead className="text-right">H</TableHead>
              <TableHead className="text-right">ER</TableHead>
              <TableHead className="text-right">HR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameLogs.map((log) => (
              <TableRow
                key={log.gamePk}
                onClick={() => onRowClick(log.gamePk)}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  selectedGamePk === log.gamePk ? "bg-muted" : ""
                )}
              >
                <TableCell className="font-medium">{log.gameDate}</TableCell>
                <TableCell>{log.opponentName}</TableCell>
                <TableCell className="text-right">{log.result}</TableCell>
                <TableCell className="text-right">{log.inningsPitched}</TableCell>
                <TableCell className="text-right">{log.pitchesThrown}</TableCell>
                <TableCell className="text-right">{log.strikeOuts}</TableCell>
                <TableCell className="text-right">{log.baseOnBalls}</TableCell>
                <TableCell className="text-right">{log.runs}</TableCell>
                <TableCell className="text-right">{log.whip}</TableCell>
                <TableCell className="text-right">{log.hits}</TableCell>
                <TableCell className="text-right">{log.earnedRuns}</TableCell>
                <TableCell className="text-right">{log.homeRuns}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 