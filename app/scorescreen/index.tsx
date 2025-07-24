// app/scorescreen.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

  const [timeoutTimer, setTimeoutTimer] = useState(30);
  const [timeoutRunning, setTimeoutRunning] = useState(false);
  const timeoutInterval = useRef<NodeJS.Timeout | null>(null);

  const [gamePhase, setGamePhase] = useState<'first' | 'halftime' | 'second' | 'ended'>('first');

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

  useEffect(() => {
    if (matchRunning) {
      matchInterval.current = setInterval(() => {
        setMatchTimer((prev) => {
          if (prev === 1) {
            clearInterval(matchInterval.current!);
            setMatchRunning(false);
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

  useEffect(() => {
    if (timeoutRunning) {
      timeoutInterval.current = setInterval(() => {
        setTimeoutTimer((prev) => {
          if (prev === 1) {
            clearInterval(timeoutInterval.current!);
            setTimeoutRunning(false);
            setTimeoutTimer(30);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timeoutInterval.current) clearInterval(timeoutInterval.current);
    }
    return () => {
      if (timeoutInterval.current) clearInterval(timeoutInterval.current);
    };
  }, [timeoutRunning]);

  useEffect(() => {
    setTeam1DropdownItems(team1Players.filter(p => !p.out).map(p => ({ label: p.name, value: p.name })));
    setTeam2DropdownItems(team2Players.filter(p => !p.out).map(p => ({ label: p.name, value: p.name })));
  }, [team1Players, team2Players]);

  useEffect(() => {
    if (team1RaidRunning) {
      team1RaidInterval.current = setInterval(() => {
        setTeam1RaidTimer((prev) => {
          if (prev === 1) {
            clearInterval(team1RaidInterval.current!);
            setTeam1RaidRunning(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(team1RaidInterval.current!);
      setTeam1RaidTimer(30);
    }
    return () => clearInterval(team1RaidInterval.current!);
  }, [team1RaidRunning]);

  useEffect(() => {
    if (team2RaidRunning) {
      team2RaidInterval.current = setInterval(() => {
        setTeam2RaidTimer((prev) => {
          if (prev === 1) {
            clearInterval(team2RaidInterval.current!);
            setTeam2RaidRunning(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(team2RaidInterval.current!);
      setTeam2RaidTimer(30);
    }
    return () => clearInterval(team2RaidInterval.current!);
  }, [team2RaidRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleHalfTimePress = () => {
    setMatchTimer(matchTime);
    setGamePhase('halftime');
    setMatchRunning(false);
  };

  const handleHalftimeEnd = () => {
    setGamePhase('second');
  };

  const handleFullTime = () => {
    setGamePhase('ended');
    setMatchRunning(false);
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
      handleScore(defenders <= 3 ? 2 : 1);
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
          <View style={[styles.card, { flex: 2, marginRight: 6 }]}>
            {players.map((p, idx) => !p.out && (
              <View key={idx} style={styles.playerRow}>
                <Text style={{ flex: 1 }}>{p.name}</Text>
                <TouchableOpacity onPress={() => handleOut(teamNum, idx)}>
                  <Text style={styles.outBtn}>Out</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={[styles.card, { flex: 3, marginLeft: 6 }]}>
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

  const handleOut = (team: 1 | 2, index: number) => {
    const current = team === 1 ? [...team1Players] : [...team2Players];
    current[index].out = true;
    team === 1 ? setTeam1Players(current) : setTeam2Players(current);

    const opponent = team === 1 ? [...team2Players] : [...team1Players];
    const reviveIndex = opponent.findIndex(p => p.out);
    if (reviveIndex !== -1) {
      opponent[reviveIndex].out = false;
      team === 1 ? setTeam2Players(opponent) : setTeam1Players(opponent);
    }

    if (current.every(p => p.out)) {
      const revived = current.map(p => ({ ...p, out: false }));
      team === 1 ? setTeam1Players(revived) : setTeam2Players(revived);
      team === 1 ? setTeam2Score(s => s + 2) : setTeam1Score(s => s + 2);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={[styles.card, { flex: 1, marginRight: 5 }]}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            {team1Name} | {team2Name}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 4 }}>
            {team1Score.toString().padStart(2, '0')} : {team2Score.toString().padStart(2, '0')}
          </Text>
        </View>

        <View style={[styles.card, { flex: 1, marginLeft: 5, alignItems: 'center' }]}>
          {gamePhase !== 'ended' ? (
            <>
              <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>
                {formatTime(matchTimer)}
              </Text>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: '#2196F3' }]}
                onPress={() => setMatchRunning(prev => !prev)}
                disabled={gamePhase === 'halftime'}
              >
                <Text style={styles.controlBtnText}>
                  {matchRunning ? 'Pause' : 'Start'}
                </Text>
              </TouchableOpacity>

              {gamePhase === 'first' && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  disabled={matchTimer > 0}
                  onPress={handleHalfTimePress}
                >
                  <Text style={styles.controlBtnText}>Half Time</Text>
                </TouchableOpacity>
              )}

              {gamePhase === 'halftime' && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={handleHalftimeEnd}
                >
                  <Text style={styles.controlBtnText}>Halftime End</Text>
                </TouchableOpacity>
              )}

              {gamePhase === 'second' && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  disabled={matchTimer > 0}
                  onPress={handleFullTime}
                >
                  <Text style={styles.controlBtnText}>Full Time</Text>
                </TouchableOpacity>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => setTimeoutRunning(true)}
                  style={[styles.controlBtn, { paddingHorizontal: 16 }]}
                >
                  <Text style={styles.controlBtnText}>Timeout</Text>
                </TouchableOpacity>
                {timeoutRunning && (
                  <Text style={{ marginLeft: 10, fontSize: 16 }}>{timeoutTimer}s</Text>
                )}
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'red' }}>Match Over!</Text>
          )}
        </View>
      </View>

      {renderTeamSection(
        1, team1Name, team1Players, setTeam1Players, team1Score, setTeam1Score,
        team1RaidTimer, team1RaidRunning, setTeam1RaidRunning,
        team1DropdownOpen, setTeam1DropdownOpen,
        team1DropdownValue, setTeam1DropdownValue,
        team1DropdownItems, setTeam1DropdownItems,
        team2Players
      )}

      {renderTeamSection(
        2, team2Name, team2Players, setTeam2Players, team2Score, setTeam2Score,
        team2RaidTimer, team2RaidRunning, setTeam2RaidRunning,
        team2DropdownOpen, setTeam2DropdownOpen,
        team2DropdownValue, setTeam2DropdownValue,
        team2DropdownItems, setTeam2DropdownItems,
        team1Players
      )}
    </ScrollView>
  );
}

// app/scorescreen.tsx
// [REMAINDER OF FILE ABOVE]

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
  },
  controlBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
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
  cardRow: { flexDirection: 'row' },
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

