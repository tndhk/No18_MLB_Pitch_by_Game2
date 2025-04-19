"use client";

import React, { useState, useEffect } from 'react';
import type { PitchDataRow } from '@/dal/mlb'; // 型のみインポート
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // 大量データ表示のため
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton をインポート
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Card をインポート

interface PitchDetailViewProps {
  gamePk: number | null;
  pitcherId: number | null;
}

export const PitchDetailView: React.FC<PitchDetailViewProps> = ({ gamePk, pitcherId }) => {
  const [pitchData, setPitchData] = useState<PitchDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gamePk === null || pitcherId === null) {
      setPitchData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadPitchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pitch-data/${gamePk}`);
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Failed to fetch pitch data: ${res.status} ${res.statusText} - ${errBody}`);
        }
        const data: PitchDataRow[] = await res.json();
        const filtered = data.filter(item => item.pitcherId === pitcherId);
        setPitchData(filtered);
      } catch (err) {
        console.error('Error fetching pitch data:', err);
        setError(err instanceof Error ? err.message : '投球データの取得に失敗しました。');
        setPitchData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPitchData();
  }, [gamePk, pitcherId]);

  if (gamePk === null) {
    // Card を使って表示を調整
    return (
      <Card>
        <CardHeader>
          <CardTitle>投球詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">上のテーブルで試合を選択してください。</p>
        </CardContent>
      </Card>
    );
  }

  // isLoading 時の表示を Skeleton Card に変更
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
           <Skeleton className="h-6 w-1/2 mb-2" /> {/* Title Skeleton */}
           <Skeleton className="h-4 w-1/4" /> {/* Description Skeleton (optional) */}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[440px] w-full border rounded-md p-4"> {/* 高さを調整 */} 
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead className="w-[100px]"><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead className="w-[80px]"><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(10)].map((_, i) => (
                  <TableRow key={i}>
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
          </ScrollArea>
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

  if (pitchData.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>投球詳細 (Game ID: {gamePk})</CardTitle>
        </CardHeader>
        <CardContent>
          <p>この試合の投球データが見つかりません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
         <CardTitle>投球詳細 (Game ID: {gamePk})</CardTitle>
         {/* 必要であれば CardDescription を追加 */} 
      </CardHeader>
       <CardContent> {/* Table を含む場合は CardContent でラップ */}
          <ScrollArea className="h-[440px] w-full border rounded-md"> {/* padding は CardContent が持つ場合があるため削除も検討 */}
            <Table>
              {/* TableCaption は CardHeader に含めるか削除 */} 
              {/* <TableCaption>全投球データ</TableCaption> */} 
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Inning</TableHead>
                  <TableHead>Pitcher</TableHead>
                  <TableHead>Batter</TableHead>
                  <TableHead className="w-[100px]">Count</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[80px]">Speed</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pitchData
                  .filter((pitch) => pitch.pitchType !== 'N/A' && pitch.speed !== 'N/A')
                  .map((pitch) => (
                    <TableRow key={pitch.id}>
                      <TableCell>{pitch.inning}</TableCell>
                      <TableCell>{pitch.pitcherName}</TableCell>
                      <TableCell>{pitch.batterName}</TableCell>
                      <TableCell>{pitch.count}</TableCell>
                      <TableCell>{pitch.pitchType}</TableCell>
                      <TableCell>{pitch.speed}</TableCell>
                      <TableCell>{pitch.result}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
       </CardContent>
    </Card>
  );
}; 