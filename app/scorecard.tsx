import { getMatchSummary } from "@/storedata/matchSummaryStore";
import { useTimerStore } from "@/storedata/timerStore";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type PlayerStat = {
  name: string;
  raid: number;
  tackle: number;
  extra: number;
};

export default function MatchSummary() {
    const time = useTimerStore((s) => s.timer);
    const setTimer = useTimerStore((s) => s.setTimer);


  
    useEffect(() => {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }, []);




  const matchSummary = getMatchSummary() as {
  team1: { name: string; score: number; allout: number; points: any; players: PlayerStat[] };
  team2: { name: string; score: number; allout: number; points: any; players: PlayerStat[] };
  winner: string;
  gamePhase: string;
  timer: number;
  
};


  if (!matchSummary || !matchSummary.team1 || !matchSummary.team2) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No summary available</Text>
      </View>
    );
  }

  const { team1, team2, winner, gamePhase, timer } = matchSummary;
//   useEffect(() => {
//   if (gamePhase === "second") {
//     setTimer(timer); // 1 minute for second half
//   }
// }, [gamePhase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const timeStatus =
    gamePhase === "ended"
      ? "Full Time"
      : gamePhase === "halftime"
      ? "Halftime"
      : gamePhase === "first"
      ? `First Half - ${formatTime(timer)}`
      : gamePhase === "second"
      ? `Second Half - ${formatTime(timer)}`
      : "Not Started";

  const pointTypes: (keyof typeof team1.points)[] = ["raid", "tackle", "allout", "extra"];

  const renderPlayerStats = (players: PlayerStat[]) =>
    players.map((p, i) => (
      <View key={i} style={styles.playerRow}>
        <Text style={styles.playerCell}>{p.name}</Text>
        <Text style={styles.playerCell}>{p.raid}</Text>
        <Text style={styles.playerCell}>{p.tackle}</Text>
        <Text style={styles.playerCell}>{p.extra}</Text>
        <Text style={styles.playerCell}>{p.raid + p.tackle + p.extra}</Text>
      </View>
    ));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🏁 Match Summary</Text>
      {gamePhase === "ended" && winner ? (
        <Text style={styles.winner}>🏆 Winner: {winner}</Text>
      ) : (
        <Text style={styles.header}>⏱ {timeStatus}</Text>
      )}

      <View style={styles.statRow}>
        <Text style={styles.statCell}>Team</Text>
        <Text style={styles.statCell}>{team1.name}</Text>
        <Text style={styles.statCell}>{team2.name}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statCell}>Score</Text>
        <Text style={styles.statCell}>{team1.score}</Text>
        <Text style={styles.statCell}>{team2.score}</Text>
      </View>

      {pointTypes.map((type) => {
        const typeStr = String(type);
        return (
          <View key={typeStr} style={styles.statRow}>
            <Text style={styles.statCell}>
              {typeStr.charAt(0).toUpperCase() + typeStr.slice(1)} Points
            </Text>
            <Text style={styles.statCell}>{team1.points?.[typeStr] ?? 0}</Text>
            <Text style={styles.statCell}>{team2.points?.[typeStr] ?? 0}</Text>
          </View>
        );
      })}

      <Text style={styles.header}>🎯 Player Stats</Text>

      <Text style={styles.subHeader}>{team1.name}</Text>
      <View style={styles.statRow}>
        <Text style={styles.statCell}>Player</Text>
        <Text style={styles.statCell}>Raid</Text>
        <Text style={styles.statCell}>Tackle</Text>
        <Text style={styles.statCell}>Extra</Text>
        <Text style={styles.statCell}>Total</Text>
      </View>
      {renderPlayerStats(team1.players)}

      <Text style={styles.subHeader}>{team2.name}</Text>
      <View style={styles.statRow}>
        <Text style={styles.statCell}>Player</Text>
        <Text style={styles.statCell}>Raid</Text>
        <Text style={styles.statCell}>Tackle</Text>
        <Text style={styles.statCell}>Extra</Text>
        <Text style={styles.statCell}>Total</Text>
      </View>
      {renderPlayerStats(team2.players)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  subHeader: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  winner: { fontSize: 16, color: "green", marginBottom: 10 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  statCell: { flex: 1, textAlign: "center", fontSize: 14 },
  playerRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 4 },
  playerCell: { flex: 1, textAlign: "center", fontSize: 13 },
});


