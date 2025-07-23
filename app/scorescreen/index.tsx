import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ScoreScreen() {
  const {
    team1,
    team2,
    playersTeam1,
    playersTeam2,
    matchTime,
  } = useLocalSearchParams();

  const team1Players = (typeof playersTeam1 === 'string' ? playersTeam1.split(',') : playersTeam1) || [];
  const team2Players = (typeof playersTeam2 === 'string' ? playersTeam2.split(',') : playersTeam2) || [];

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [timer, setTimer] = useState(Number(matchTime || 0) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTeam, setActiveTeam] = useState<'team1' | 'team2'>('team1');
  const [team1Out, setTeam1Out] = useState(team1Players.map(() => false));
  const [team2Out, setTeam2Out] = useState(team2Players.map(() => false));
  const [isFirstHalf, setIsFirstHalf] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev: number) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            Alert.alert('Time up', 'Halftime or full time reached.');
            if (isFirstHalf) {
              setIsFirstHalf(false);
              setActiveTeam(activeTeam === 'team1' ? 'team2' : 'team1');
              setTimer(Number(matchTime || 0) * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current!);
  }, [isRunning]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const toggleOut = (team: 'team1' | 'team2', index: number) => {
    if (team === 'team1') {
      const updated = [...team1Out];
      updated[index] = !updated[index];
      setTeam1Out(updated);
    } else {
      const updated = [...team2Out];
      updated[index] = !updated[index];
      setTeam2Out(updated);
    }
  };

  const renderPlayers = (team: 'team1' | 'team2') => {
    const players = team === 'team1' ? team1Players : team2Players;
    const outs = team === 'team1' ? team1Out : team2Out;
    return players.map((player: string, i: number) => (
      <TouchableOpacity
        key={i}
        style={[
          styles.playerBox,
          outs[i] ? styles.playerOut : styles.playerIn,
        ]}
        onPress={() => toggleOut(team, i)}>
        <Text style={styles.playerText}>{player}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(timer)}</Text>

      <View style={styles.scoreWrap}>
        <View style={styles.teamScoreWrap}>
          <Text style={styles.teamName}>{team1}</Text>
          <Text style={styles.score}>{team1Score}</Text>
        </View>
        <View style={styles.teamScoreWrap}>
          <Text style={styles.teamName}>{team2}</Text>
          <Text style={styles.score}>{team2Score}</Text>
        </View>
      </View>

      <View style={styles.playersWrap}>
        <View style={styles.teamPlayers}>{renderPlayers('team1')}</View>
        <View style={styles.teamPlayers}>{renderPlayers('team2')}</View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome5 name="running" size={20} color="white" />
          <Text style={styles.actionText}>Raid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome5 name="hand-rock" size={20} color="white" />
          <Text style={styles.actionText}>Tackle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome5 name="plus" size={20} color="white" />
          <Text style={styles.actionText}>➕ Bonus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome5 name="ban" size={20} color="white" />
          <Text style={styles.actionText}>Foul</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: isRunning ? '#e67e22' : '#2ecc71' }]} 
          onPress={() => setIsRunning(!isRunning)}>
          <Text style={styles.timerBtnText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: '#3498db' }]} 
          onPress={() => {
            setIsRunning(false);
            setTimer(Number(matchTime || 0) * 60);
          }}>
          <Text style={styles.timerBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    padding: 10,
  },
  timerText: {
    fontSize: 36,
    textAlign: 'center',
    color: 'white',
    marginVertical: 10,
  },
  scoreWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  teamScoreWrap: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 20,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  score: {
    fontSize: 28,
    color: 'white',
  },
  playersWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  teamPlayers: {
    width: '48%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  playerBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
    margin: 4,
    width: '40%',
    alignItems: 'center',
  },
  playerIn: {
    borderColor: 'green',
    backgroundColor: '#1abc9c',
  },
  playerOut: {
    borderColor: 'red',
    backgroundColor: '#c0392b',
  },
  playerText: {
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 10,
    width: '22%',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  timerBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  timerBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
