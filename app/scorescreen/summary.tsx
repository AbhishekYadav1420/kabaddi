import { getMatchSummary } from '@/storedata/matchSummaryStore';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type PlayerStat = {
  name: string;
  raid: number;
  tackle: number;
  extra: number;
};

export default function MatchSummary() {
  const matchSummary = getMatchSummary();

  if (!matchSummary) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No summary available</Text>
      </View>
    );
  }

  const { team1, team2, winner } = matchSummary;
  const pointTypes: (keyof typeof team1.points)[] = ['raid', 'tackle', 'allout', 'extra'];

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
      <Text style={styles.winner}>🏆 Winner: {winner}</Text>

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
  const typeStr = String(type); // force to string
  return (
    <View key={typeStr} style={styles.statRow}>
      <Text style={styles.statCell}>
        {typeStr.charAt(0).toUpperCase() + typeStr.slice(1)} Points
      </Text>
      <Text style={styles.statCell}>{team1.points?.[typeStr as keyof typeof team1.points] ?? 0}</Text>
      <Text style={styles.statCell}>{team2.points?.[typeStr as keyof typeof team2.points] ?? 0}</Text>
    </View>
  );
})}


      <Text style={styles.header}>🎯 Player Stats</Text>

      <Text style={styles.subHeader}>{team1.name}</Text>
      {renderPlayerStats(team1.players)}

      <Text style={styles.subHeader}>{team2.name}</Text>
      {renderPlayerStats(team2.players)}

       <View style={styles.statRow}>
        <Text style={styles.statCell}>Player</Text>
        <Text style={styles.statCell}>Raid Point</Text>
        <Text style={styles.statCell}>Tackle Point</Text>
          <Text style={styles.statCell}>Extras</Text>
        <Text style={styles.statCell}>Total Point</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  subHeader: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  score: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  winner: { fontSize: 16, color: 'green', marginBottom: 10 },
  matLine: { fontSize: 14, marginVertical: 2 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statCell: { flex: 1, textAlign: 'center', fontSize: 14 },
  playerRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 4 },
  playerCell: { flex: 1, textAlign: 'center', fontSize: 13 },
});
