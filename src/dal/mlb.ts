const MLB_STATS_API_BASE_URL = "https://statsapi.mlb.com/api/v1";

// APIレスポンスの型定義 (必要な部分のみ抜粋)
interface MlbGameLogStat {
  season: string;
  // 他にも多くのフィールドが存在する
}

interface MlbGameLogSplit {
  season: string;
  stat: MlbGameLogStat; // stat の中にも season があるが、split 直下の season を使う
}

interface MlbGameLogStatData {
  splits: MlbGameLogSplit[];
}

interface MlbGameLogResponse {
  stats: MlbGameLogStatData[];
}

// 返却するシーズンの型
export interface Season {
  year: number;
}

/**
 * 指定された投手IDの投球記録があるシーズンを取得する
 * @param pitcherId - MLB 選手 ID
 * @returns 利用可能なシーズンの配列 (降順)
 * @throws API取得またはデータ処理に失敗した場合にエラーをスロー
 */
export const getAvailableSeasons = async (pitcherId: number): Promise<Season[]> => {
  const url = `${MLB_STATS_API_BASE_URL}/people/${pitcherId}/stats?stats=yearByYear&group=pitching`;
  console.log(`Fetching seasons from: ${url}`);

  try {
    const response = await fetch(url, {
        // 必要に応じてキャッシュ戦略を設定 (例: ISR)
        // cache: 'no-store', // 開発中はキャッシュ無効化も有効
        next: { revalidate: 3600 } // 本番では1時間キャッシュなど
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error Response Body for ${pitcherId}: ${errorBody}`);
        throw new Error(`Failed to fetch game log: ${response.status} ${response.statusText}`);
    }

    const data: MlbGameLogResponse = await response.json();

    // データ構造を確認し、安全にアクセス
    if (!data || !data.stats || data.stats.length === 0 || !data.stats[0].splits) {
      console.warn(`No valid game log splits found in the response for pitcherId: ${pitcherId}`);
      return [];
    }

    // 'stats' 配列の最初の要素の 'splits' からシーズン情報を抽出
    const splits = data.stats[0].splits;

    // シーズン文字列を数値に変換し、重複を除去して降順にソート
    const seasons = [
      ...new Set(
        splits
          .map(split => parseInt(split.season, 10))
          .filter(year => !isNaN(year)) // NaN が入る可能性を除外
      )
    ].sort((a, b) => b - a); // 降順ソート

    return seasons.map(year => ({ year }));

  } catch (error) {
    console.error(`Error fetching or processing available seasons for pitcherId ${pitcherId}:`, error);
    // エラーを再スローして呼び出し元で処理できるようにする
    throw new Error("Failed to retrieve seasons from MLB API.");
  }
};

// --- Game Log Related Types --- interfaces

// interface MlbGameDate { /* removed unused */ }

interface MlbGameOpponent {
  id: number;
  name: string;
  link: string;
}

interface MlbGameStatus {
  abstractGameState: string; // e.g., "Final"
  // ... other fields
}

interface MlbGameTeam {
  id: number;
  name: string;
  link: string;
}

interface MlbGameTeams {
  away: { team: MlbGameTeam; score?: number; /* ... */ };
  home: { team: MlbGameTeam; score?: number; /* ... */ };
}

interface MlbGamePitchingStats {
  inningsPitched: string; // "X.Y" 形式 e.g., "6.0"
  wins?: number;      // 勝利数
  losses?: number;    // 敗戦数
  saves?: number;     // セーブ数
  strikeOuts: number;
  baseOnBalls: number;
  runs: number; // 失点
  whip: string; // "X.YY" 形式
  hits?: number;       // 被安打
  earnedRuns?: number; // 自責点
  homeRuns?: number;   // 被本塁打
  pitchesThrown?: number; // 投球数 (レポート用)
  // ... many other stats
}

interface MlbGameLogSplitDetail {
  game: {
    gamePk: number;
    link: string;
    season: string;
    gameDate: string; // ISO 8601形式 "YYYY-MM-DDTHH:mm:ssZ"
    status: MlbGameStatus;
    teams: MlbGameTeams;
  };
  opponent: MlbGameOpponent;
  stat: MlbGamePitchingStats;
  isHome: boolean;
  isWin?: boolean; // Optional fields
  isLoss?: boolean;
  isSave?: boolean;
  // ... other fields
}

interface MlbGameLogStatDataForLog {
  splits: MlbGameLogSplitDetail[];
}

interface MlbGameLogResponseForLog {
  stats: MlbGameLogStatDataForLog[];
}

// 返却する GameLog の型 (UI表示に必要な情報を抜粋)
export interface GameLogRow {
  gamePk: number;
  gameDate: string; // "YYYY-MM-DD"
  opponentName: string;
  inningsPitched: string;
  strikeOuts: number;
  baseOnBalls: number;
  runs: number;
  whip: string;
  hits: number; // 被安打
  earnedRuns: number; // 自責点
  homeRuns: number; // 被本塁打
  pitchesThrown: number; // 投球数
  result?: 'W' | 'L' | 'S' | '-'; // Win, Loss, Save, or None
}

/**
 * 指定された投手とシーズンの試合ログを取得する
 * @param pitcherId - MLB 選手 ID
 * @param season - シーズン (YYYY)
 * @returns 試合ログデータの配列
 * @throws API取得またはデータ処理に失敗した場合にエラーをスロー
 */
export const getGameLog = async (pitcherId: number, season: number): Promise<GameLogRow[]> => {
  const url = `${MLB_STATS_API_BASE_URL}/people/${pitcherId}/stats?stats=gameLog&season=${season}&group=pitching`;
  console.log(`Fetching game log from: ${url}`);

  try {
    const response = await fetch(url, {
      // cache: 'no-store',
      next: { revalidate: 3600 } // 1時間キャッシュ
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error Response Body for ${pitcherId}, season ${season}: ${errorBody}`);
        throw new Error(`Failed to fetch game log: ${response.status} ${response.statusText}`);
    }

    const data: MlbGameLogResponseForLog = await response.json();

    if (!data || !data.stats || data.stats.length === 0 || !data.stats[0].splits) {
      console.warn(`No valid game log splits found for pitcherId: ${pitcherId}, season: ${season}`);
      return [];
    }

    const splits = data.stats[0].splits;

    // APIレスポンスを GameLogRow 型にマッピング
    const gameLogs: GameLogRow[] = splits.map((split, idx) => {
      // 結果コードを判定
      let result: GameLogRow['result'] = '-';
      const stat = split.stat;
      if (stat.wins === 1) result = 'W';
      else if (stat.losses === 1) result = 'L';
      else if (stat.saves === 1) result = 'S';

      // ゲーム日付（存在しない場合は空文字）
      const rawGameDate = typeof split.game?.gameDate === 'string' ? split.game.gameDate : '';
      const gameDate = rawGameDate.length >= 10 ? rawGameDate.substring(0, 10) : rawGameDate;

      const gamePk = typeof split.game.gamePk === 'number' ? split.game.gamePk : idx;

      return {
        gamePk,
        gameDate,
        opponentName: `${split.isHome ? 'vs' : '@'} ${split.opponent.name}`,
        inningsPitched: split.stat.inningsPitched,
        strikeOuts: split.stat.strikeOuts,
        baseOnBalls: split.stat.baseOnBalls,
        runs: split.stat.runs,
        whip: split.stat.whip,
        hits: split.stat.hits ?? 0,
        earnedRuns: split.stat.earnedRuns ?? 0,
        homeRuns: split.stat.homeRuns ?? 0,
        pitchesThrown: split.stat.pitchesThrown ?? 0,
        result: result,
      };
    });

    // 日付で降順（最新が先頭）にソートして返す
    return gameLogs.sort((a, b) => b.gameDate.localeCompare(a.gameDate));

  } catch (error) {
    console.error(`Error fetching or processing game log for pitcherId ${pitcherId}, season ${season}:`, error);
    throw new Error("Failed to retrieve game log from MLB API.");
  }
};

// --- Pitch Data Related Types ---

// 投球イベントの詳細
interface MlbPitchEvent {
  details: {
    type?: { code?: string; description?: string }; // 球種コード (e.g., FF) と説明 (e.g., Four-Seam Fastball)
    call?: { code?: string; description?: string }; // 判定 (e.g., S for Strike)
    description?: string; // イベントの説明 (e.g., "Called Strike")
    // ... many other details
  };
  pitchData?: {
    startSpeed?: number; // 球速 (mph)
    // ... other pitch data
  };
  count?: {
    balls: number;
    strikes: number;
    outs: number;
  };
  index: number; // Play 内でのイベントindex
  // ... other fields
}

// プレーの詳細 (打席ごとなど)
interface MlbPlay {
  result: {
    type: string;
    event: string;
    description: string;
  };
  about: {
    atBatIndex: number;
    inning: number;
    isTopInning: boolean;
    // ... other context
  };
  matchup: {
    batter: { id: number; fullName: string; link: string };
    pitcher: { id: number; fullName: string; link: string };
    // ... other matchup details
  };
  playEvents: MlbPitchEvent[]; // このプレー内の投球イベントリスト
  // ... other fields
}

// APIレスポンスの主要部分
interface MlbLiveData {
  plays: {
    allPlays: MlbPlay[];
    // currentPlay?: MlbPlay;
    // ... other play info
  };
}

interface MlbGameFeedResponse {
  gamePk: number;
  liveData: MlbLiveData;
  // ... other game data
}

// UI表示用の加工済み投球データ型
export interface PitchDataRow {
  id: string; // 一意なキー用 (e.g., playIndex-eventIndex)
  pitcherId: number; // 投球を投じた投手のID
  inning: string; // "Top 1", "Bot 3" など
  pitcherName: string;
  batterName: string;
  count: string; // "B:1 S:2 O:1"
  pitchType: string; // "Four-Seam Fastball (FF)"
  speed: string; // "95.5 mph"
  result: string; // "Called Strike"
}

/**
 * 指定された試合(gamePk)の全投球データを取得する
 * @param gamePk - MLB Game ID
 * @returns 加工された投球データの配列
 * @throws API取得またはデータ処理に失敗した場合にエラーをスロー
 */
export const getPitchData = async (gamePk: number): Promise<PitchDataRow[]> => {
  // Live feed uses v1.1 endpoint
  const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
  console.log(`Fetching pitch data from: ${url}`);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (response.status === 404) {
      console.warn(`No pitch data found for gamePk ${gamePk}`);
      return [];
    }
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error Response Body for gamePk ${gamePk}: ${errorBody}`);
      return [];
    }

    const data: MlbGameFeedResponse = await response.json();
    if (!data?.liveData?.plays?.allPlays) {
      console.warn(`No valid play data found for gamePk: ${gamePk}`);
      return [];
    }

    const allPlays = data.liveData.plays.allPlays;
    const pitchDataRows: PitchDataRow[] = [];

    allPlays.forEach(play => {
      play.playEvents?.forEach(event => {
        const details = event.details;
        const pitch = event.pitchData;
        const count = event.count;
        const about = play.about;
        const matchup = play.matchup;
        if (!count || !about || !matchup) return;

        const pitchTypeDesc = details.type?.description ?? 'N/A';
        const pitchTypeCode = details.type?.code ? ` (${details.type.code})` : '';
        const speed = pitch?.startSpeed ? `${pitch.startSpeed.toFixed(1)} mph` : 'N/A';
        const resultDesc = details.description ?? 'N/A';

        pitchDataRows.push({
          id: `${about.atBatIndex}-${event.index}`,
          pitcherId: matchup.pitcher.id,
          inning: `${about.isTopInning ? 'Top' : 'Bot'} ${about.inning}`,
          pitcherName: matchup.pitcher.fullName,
          batterName: matchup.batter.fullName,
          count: `B:${count.balls} S:${count.strikes} O:${count.outs}`,
          pitchType: `${pitchTypeDesc}${pitchTypeCode}`,
          speed,
          result: resultDesc,
        });
      });
    });

    return pitchDataRows;
  } catch (error) {
    console.error(`Error fetching or processing pitch data for gamePk ${gamePk}:`, error);
    return [];
  }
};