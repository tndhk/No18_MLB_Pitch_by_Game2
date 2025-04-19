"use client";

import React, { useState, useEffect } from 'react';
import { getGameLog, GameLogRow } from '@/dal/mlb';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
        setGameLogs(fetchedGameLogs);
      } catch (err) {
        console.error("Error fetching game logs:", err);
        setError(err instanceof Error ? err.message : "試合ログの取得に失敗しました。");
        setGameLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameLogs();
  }, [pitcherId, season]);

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
        <CardTitle>{season}年 試合ログ</CardTitle>
        <CardDescription>試合を選択すると、下のセクションに投球詳細が表示されます。</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">日付</TableHead>
              <TableHead>対戦相手</TableHead>
              <TableHead className="text-right">結果</TableHead>
              <TableHead className="text-right">IP</TableHead>
              <TableHead className="text-right">SO</TableHead>
              <TableHead className="text-right">BB</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">WHIP</TableHead>
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
                <TableCell className="text-right">{log.strikeOuts}</TableCell>
                <TableCell className="text-right">{log.baseOnBalls}</TableCell>
                <TableCell className="text-right">{log.runs}</TableCell>
                <TableCell className="text-right">{log.whip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 