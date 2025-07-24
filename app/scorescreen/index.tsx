// app/scorescreen.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

type PlayerStatus = { name: string; out: boolean };

export default function ScoreScreen() {
  const {
    team1,
    team2,
    playersTeam1,
    playersTeam2,
    toss,
    time,
  } = useLocalSearchParams<{
    team1: string;
    team2: string;
    playersTeam1: string;
    playersTeam2: string;
    toss: string;
    time: string;
  }>();

  const team1Name = team1 || 'Team 1';
  const team2Name = team2 || 'Team 2';
  const matchTime = parseInt(time || '600');

  const initialTeam1Players: PlayerStatus[] = JSON.parse(playersTeam1 || '[]').map((name: string) => ({ name, out: false }));
  const initialTeam2Players: PlayerStatus[] = JSON.parse(playersTeam2 || '[]').map((name: string) => ({ name, out: false }));

  const [team1Players, setTeam1Players] = useState<PlayerStatus[]>(initialTeam1Players);
  const [team2Players, setTeam2Players] = useState<PlayerStatus[]>(initialTeam2Players);

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  const [matchTimer, setMatchTimer] = useState(matchTime);
  const [matchRunning, setMatchRunning] = useState(false);
  const matchInterval = useRef<NodeJS.Timeout | null>(null);

  const [team1RaidTimer, setTeam1RaidTimer] = useState(30);
  const [team1RaidRunning, setTeam1RaidRunning] = useState(false);
  const team1RaidInterval = useRef<NodeJS.Timeout | null>(null);

  const [team2RaidTimer, setTeam2RaidTimer] = useState(30);
  const [team2RaidRunning, setTeam2RaidRunning] = useState(false);
  const team2RaidInterval = useRef<NodeJS.Timeout | null>(null);

  const [team1DropdownOpen, setTeam1DropdownOpen] = useState(false);
  const [team1DropdownValue, setTeam1DropdownValue] = useState(null);
  const [team1DropdownItems, setTeam1DropdownItems] = useState<any[]>([]);

  const [team2DropdownOpen, setTeam2DropdownOpen] = useState(false);
  const [team2DropdownValue, setTeam2DropdownValue] = useState(null);
  const [team2DropdownItems, setTeam2DropdownItems] = useState<any[]>([]);

  // Match Timer Effect
  useEffect(() => {
    if (matchRunning) {
      matchInterval.current = setInterval(() => {
        setMatchTimer((prev) => {
          if (prev === 1) {
            setMatchRunning(false);
            clearInterval(matchInterval.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (matchInterval.current) clearInterval(matchInterval.current);
    }
    return () => {
      if (matchInterval.current) clearInterval(matchInterval.current);
    };
  }, [matchRunning]);

  // Raid Timer Effects
  useEffect(() => {
    if (team1RaidRunning) {
      team1RaidInterval.current = setInterval(() => {
        setTeam1RaidTimer((prev) => {
          if (prev === 1) {
            setTeam1RaidRunning(false);
            clearInterval(team1RaidInterval.current!);
            setTeam1RaidTimer(30);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (team1RaidInterval.current) clearInterval(team1RaidInterval.current);
    }
    return () => {
      if (team1RaidInterval.current) clearInterval(team1RaidInterval.current);
    };
  }, [team1RaidRunning]);

  useEffect(() => {
    if (team2RaidRunning) {
      team2RaidInterval.current = setInterval(() => {
        setTeam2RaidTimer((prev) => {
          if (prev === 1) {
            setTeam2RaidRunning(false);
            clearInterval(team2RaidInterval.current!);
            setTeam2RaidTimer(30);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (team2RaidInterval.current) clearInterval(team2RaidInterval.current);
    }
    return () => {
      if (team2RaidInterval.current) clearInterval(team2RaidInterval.current);
    };
  }, [team2RaidRunning]);

  // Update dropdowns dynamically
  useEffect(() => {
    setTeam1DropdownItems(team1Players.filter(p => !p.out).map(p => ({ label: p.name, value: p.name })));
    setTeam2DropdownItems(team2Players.filter(p => !p.out).map(p => ({ label: p.name, value: p.name })));
  }, [team1Players, team2Players]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleOut = (team: 1 | 2, index: number) => {
    if (team === 1) {
      const updated = [...team1Players];
      updated[index].out = true;
      setTeam1Players(updated);

      // revive opponent
      const revive = [...team2Players];
      const outIndex = revive.findIndex(p => p.out);
      if (outIndex !== -1) {
        revive[outIndex].out = false;
        setTeam2Players(revive);
      }

      // check for all-out
      if (updated.every(p => p.out)) {
        const revived = updated.map(p => ({ ...p, out: false }));
        setTeam1Players(revived);
        setTeam2Score(prev => prev + 2);
      }
    } else {
      const updated = [...team2Players];
      updated[index].out = true;
      setTeam2Players(updated);

      // revive opponent
      const revive = [...team1Players];
      const outIndex = revive.findIndex(p => p.out);
      if (outIndex !== -1) {
        revive[outIndex].out = false;
        setTeam1Players(revive);
      }

      // check for all-out
      if (updated.every(p => p.out)) {
        const revived = updated.map(p => ({ ...p, out: false }));
        setTeam2Players(revived);
        setTeam1Score(prev => prev + 2);
      }
    }
  };

  const renderDots = (players: PlayerStatus[]) => (
    <View style={{ flexDirection: 'row', marginVertical: 4 }}>
      {players.map((p, idx) => (
        <FontAwesome
          key={idx}
          name="circle"
          size={14}
          color={p.out ? 'gray' : 'green'}
          style={{ marginRight: 4 }}
        />
      ))}
    </View>
  );

  const renderTeamSection = (
    teamNum: 1 | 2,
    teamName: string,
    players: PlayerStatus[],
    setPlayers: React.Dispatch<React.SetStateAction<PlayerStatus[]>>,
    score: number,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    raidTimer: number,
    raidRunning: boolean,
    setRaidRunning: React.Dispatch<React.SetStateAction<boolean>>,
    dropdownOpen: boolean,
    setDropdownOpen: (val: boolean) => void,
    dropdownValue: any,
    setDropdownValue: any,
    dropdownItems: any[],
    setDropdownItems: any[],
    opponentPlayers: PlayerStatus[],
  ) => {
    const handleScore = (pts: number) => setScore(prev => prev + pts);

    const handleTackle = () => {
      const defenders = opponentPlayers.filter(p => !p.out).length;
      if (defenders <= 3) {
        handleScore(2); // super tackle
      } else {
        handleScore(1);
      }
    };

    return (
      <View style={styles.teamSection}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamTitle}>{teamName}</Text>
          {renderDots(players)}
          <Text style={styles.timerText}>{raidTimer}s</Text>
          <TouchableOpacity onPress={() => setRaidRunning(prev => !prev)} style={styles.btn}>
            <Text style={styles.btnText}>{raidRunning ? 'End' : 'Start'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            {players.map((p, idx) => !p.out && (
              <View key={idx} style={styles.playerRow}>
                <Text style={{ flex: 1 }}>{p.name}</Text>
                <TouchableOpacity onPress={() => handleOut(teamNum, idx)}>
                  <Text style={styles.outBtn}>Out</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <DropDownPicker
              open={dropdownOpen}
              value={dropdownValue}
              items={dropdownItems}
              setOpen={setDropdownOpen}
              setValue={setDropdownValue}
              setItems={setDropdownItems}
              placeholder={raidRunning ? 'Select Raider' : 'Select Defender'}
              containerStyle={{ marginBottom: 10 }}
            />

            <View style={styles.scoreBtnGroup}>
              {['Bonus', '1', '2', '3', '4', '5', '6', '7'].map(label => (
                <TouchableOpacity key={label} onPress={() => handleScore(label === 'Bonus' ? 1 : parseInt(label))} style={styles.scoreBtn}>
                  <Text style={styles.scoreBtnText}>{label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={handleTackle} style={styles.scoreBtn}>
                <Text style={styles.scoreBtnText}>Tackle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScore(prev => Math.max(prev - 1, 0))} style={styles.scoreBtn}>
                <Text style={styles.scoreBtnText}>Undo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Section 1 */}
      <View style={styles.section1}>
        <Text style={styles.title}>{team1Name} - {team1Score} | {team2Score} - {team2Name}</Text>
        <Text style={styles.timer}>{formatTime(matchTimer)}</Text>
        <TouchableOpacity onPress={() => setMatchRunning(prev => !prev)} style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>{matchRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={matchTimer > 0} onPress={() => Alert.alert('Half Time')} style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>Half Time</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Timeout', '30 sec timeout')} style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>Timeout</Text>
        </TouchableOpacity>
      </View>

      {/* Section 2 */}
      {renderTeamSection(
        1,
        team1Name,
        team1Players,
        setTeam1Players,
        team1Score,
        setTeam1Score,
        team1RaidTimer,
        team1RaidRunning,
        setTeam1RaidRunning,
        team1DropdownOpen,
        setTeam1DropdownOpen,
        team1DropdownValue,
        setTeam1DropdownValue,
        team1DropdownItems,
        setTeam1DropdownItems,
        team2Players
      )}

      {/* Section 3 */}
      {renderTeamSection(
        2,
        team2Name,
        team2Players,
        setTeam2Players,
        team2Score,
        setTeam2Score,
        team2RaidTimer,
        team2RaidRunning,
        setTeam2RaidRunning,
        team2DropdownOpen,
        setTeam2DropdownOpen,
        team2DropdownValue,
        setTeam2DropdownValue,
        team2DropdownItems,
        setTeam2DropdownItems,
        team1Players
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  section1: { alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  timer: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  controlBtn: {
    backgroundColor: '#2196F3',
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  controlBtnText: { color: '#fff', fontWeight: 'bold' },

  teamSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  timerText: { fontSize: 16, marginHorizontal: 6 },
  btn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: { color: 'white', fontWeight: 'bold' },

  cardRow: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  outBtn: {
    color: 'red',
    fontWeight: 'bold',
  },
  scoreBtnGroup: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  scoreBtn: {
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  scoreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
