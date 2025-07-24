// /app/scorescreen.tsx
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

const ScoreScreen = () => {
  const {
    team1,
    team2,
    playersTeam1,
    playersTeam2,
    time,
    bonusAllowed,
    superTackleAllowed,
  } = useLocalSearchParams();

  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [team1Players, setTeam1Players] = useState<string[]>([]);
  const [team2Players, setTeam2Players] = useState<string[]>([]);
  const [matchTime, setMatchTime] = useState(0); // seconds
  const [bonus, setBonus] = useState(true);
  const [superTackle, setSuperTackle] = useState(true);

  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [timeoutActive, setTimeoutActive] = useState(false);
  const [timeoutTimer, setTimeoutTimer] = useState(30);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [raidTimer, setRaidTimer] = useState(30);
  const [isRaidRunning, setIsRaidRunning] = useState(false);
  const raidRef = useRef<NodeJS.Timeout | null>(null);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [undoStack, setUndoStack] = useState<{ t1: number; t2: number }[]>([]);

  const [alive1, setAlive1] = useState<boolean[]>(Array(7).fill(true));
  const [alive2, setAlive2] = useState<boolean[]>(Array(7).fill(true));

  const [raider1, setRaider1] = useState<string | null>(null);
  const [raider2, setRaider2] = useState<string | null>(null);
  const [defender1, setDefender1] = useState<string | null>(null);
  const [defender2, setDefender2] = useState<string | null>(null);

  const [openRaider1, setOpenRaider1] = useState(false);
  const [openRaider2, setOpenRaider2] = useState(false);
  const [openDefender1, setOpenDefender1] = useState(false);
  const [openDefender2, setOpenDefender2] = useState(false);

  useEffect(() => {
    if (team1) setTeam1Name(team1 as string);
    if (team2) setTeam2Name(team2 as string);
    if (playersTeam1) setTeam1Players(JSON.parse(playersTeam1 as string));
    if (playersTeam2) setTeam2Players(JSON.parse(playersTeam2 as string));
    if (time) setMatchTime(parseInt((time as string).split(':')[0]) * 60);
    if (bonusAllowed) setBonus(bonusAllowed === 'true');
    if (superTackleAllowed) setSuperTackle(superTackleAllowed === 'true');
    setTimer(parseInt((time as string).split(':')[0]) * 60);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  useEffect(() => {
    if (timeoutActive) {
      timeoutRef.current = setInterval(() => {
        setTimeoutTimer(prev => {
          if (prev <= 1) {
            setTimeoutActive(false);
            clearInterval(timeoutRef.current!);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    }
    return () => clearInterval(timeoutRef.current!);
  }, [timeoutActive]);

  useEffect(() => {
    if (isRaidRunning) {
      raidRef.current = setInterval(() => {
        setRaidTimer(prev => {
          if (prev <= 1) {
            clearInterval(raidRef.current!);
            setIsRaidRunning(false);
            setRaidTimer(30);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (raidRef.current) clearInterval(raidRef.current);
    }
    return () => clearInterval(raidRef.current!);
  }, [isRaidRunning]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScore = (points: number, team: 1 | 2, type: 'tackle' | 'bonus' | 'normal') => {
    setUndoStack(prev => [...prev, { t1: score1, t2: score2 }]);
    if (team === 1) {
      if (type === 'tackle' && superTackle && alive2.filter(a => a).length <= 3) {
        setScore1(score1 + 2);
      } else {
        setScore1(score1 + points);
      }
    } else {
      if (type === 'tackle' && superTackle && alive1.filter(a => a).length <= 3) {
        setScore2(score2 + 2);
      } else {
        setScore2(score2 + points);
      }
    }
  };

  const handleOut = (team: 1 | 2, index: number) => {
    if (team === 1) {
      const newAlive = [...alive1];
      newAlive[index] = false;
      setAlive1(newAlive);
      revivePlayer(2);
    } else {
      const newAlive = [...alive2];
      newAlive[index] = false;
      setAlive2(newAlive);
      revivePlayer(1);
    }
  };

  const revivePlayer = (team: 1 | 2) => {
    if (team === 1) {
      const idx = alive1.findIndex(a => a === false);
      if (idx !== -1) {
        const newAlive = [...alive1];
        newAlive[idx] = true;
        setAlive1(newAlive);
      }
    } else {
      const idx = alive2.findIndex(a => a === false);
      if (idx !== -1) {
        const newAlive = [...alive2];
        newAlive[idx] = true;
        setAlive2(newAlive);
      }
    }
  };

  const handleUndo = () => {
    const last = undoStack.pop();
    if (last) {
      setScore1(last.t1);
      setScore2(last.t2);
    }
  };

  const renderDots = (alive: boolean[]) =>
    alive.map((a, i) => (
      <FontAwesome
        key={i}
        name="circle"
        size={16}
        color={a ? 'green' : 'gray'}
        style={{ marginHorizontal: 2 }}
      />
    ));

  const getDropdownItems = (players: string[]) => players.map(p => ({ label: p, value: p }));

  const renderTeamSection = (
    teamName: string,
    players: string[],
    alive: boolean[],
    raider: string | null,
    defenderItems: string[],
    openRaider: boolean,
    openDefender: boolean,
    setRaider: React.Dispatch<React.SetStateAction<string | null>>,
    setOpenRaider: (v: boolean) => void,
    setOpenDefender: (v: boolean) => void,
    setDefender: React.Dispatch<React.SetStateAction<string | null>>,
    teamNum: 1 | 2
  ) => (
    <View style={styles.teamBlock}>
      <Text style={styles.teamTitle}>{teamName}</Text>
      <View style={styles.dotsRow}>{renderDots(alive)}</View>
      <View style={styles.raidTimerRow}>
        <Text style={{ fontWeight: 'bold' }}>Raid Timer: {raidTimer}s</Text>
        <TouchableOpacity style={styles.button} onPress={() => setIsRaidRunning(prev => !prev)}>
          <Text style={styles.buttonText}>{isRaidRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
      </View>

      <DropDownPicker
        open={openRaider}
        value={raider}
        items={getDropdownItems(players)}
        setOpen={setOpenRaider}
        setValue={setRaider}
        placeholder="Select Raider"
        style={{ marginBottom: 10 }}
      />

      <DropDownPicker
        open={openDefender}
        value={teamNum === 1 ? defender2 : defender1}
        items={getDropdownItems(defenderItems)}
        setOpen={setOpenDefender}
        setValue={setDefender}
        placeholder="Select Defender"
        style={{ marginBottom: 10 }}
      />

      <View style={styles.scoreRow}>
        <TouchableOpacity style={styles.button} onPress={() => bonus && handleScore(1, teamNum, 'bonus')}>
          <Text style={styles.buttonText}>Bonus</Text>
        </TouchableOpacity>
        {[1, 2, 3].map(n => (
          <TouchableOpacity key={n} style={styles.button} onPress={() => handleScore(n, teamNum, 'normal')}>
            <Text style={styles.buttonText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scoreRow}>
        <TouchableOpacity style={styles.button} onPress={() => handleScore(1, teamNum, 'tackle')}>
          <Text style={styles.buttonText}>Tackle</Text>
        </TouchableOpacity>
        {[4, 5, 6].map(n => (
          <TouchableOpacity key={n} style={styles.button} onPress={() => handleScore(n, teamNum, 'normal')}>
            <Text style={styles.buttonText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scoreRow}>
        <TouchableOpacity style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleScore(7, teamNum, 'normal')}>
          <Text style={styles.buttonText}>7</Text>
        </TouchableOpacity>
      </View>

      {players.map((p, i) => (
        alive[i] && (
          <View key={i} style={styles.playerRow}>
            <Text>{p}</Text>
            <TouchableOpacity onPress={() => handleOut(teamNum, i)}>
              <Text style={{ color: 'red' }}>Out</Text>
            </TouchableOpacity>
          </View>
        )
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Section 1 - Top */}
      <View style={styles.header}>
        <Text style={styles.title}>{team1Name} vs {team2Name}</Text>
        <Text style={styles.score}>{score1} - {score2}</Text>
        <Text style={styles.timer}>{formatTime(timer)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => setIsRunning(prev => !prev)}>
            <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => timer === 0 && Alert.alert('Half Time!')}
            disabled={timer !== 0}
          >
            <Text style={styles.buttonText}>Half Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setTimeoutActive(true)}>
            <Text style={styles.buttonText}>Timeout ({timeoutTimer}s)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 2 - Team 1 */}
      {renderTeamSection(
        team1Name,
        team1Players,
        alive1,
        raider1,
        team2Players,
        openRaider1,
        openDefender2,
        setRaider1,
        setOpenRaider1,
        setOpenDefender2,
        setDefender2,
        1
      )}

      {/* Section 3 - Team 2 */}
      {renderTeamSection(
        team2Name,
        team2Players,
        alive2,
        raider2,
        team1Players,
        openRaider2,
        openDefender1,
        setRaider2,
        setOpenRaider2,
        setOpenDefender1,
        setDefender1,
        2
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  score: { fontSize: 36, fontWeight: 'bold' },
  timer: { fontSize: 18, marginVertical: 10 },
  controls: { flexDirection: 'row', gap: 10 },
  teamBlock: { marginVertical: 15 },
  teamTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  dotsRow: { flexDirection: 'row', marginBottom: 10 },
  raidTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 8,
    borderRadius: 6,
  },
  buttonText: { color: '#fff' },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});

export default ScoreScreen;
