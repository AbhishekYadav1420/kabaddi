import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScoreScreen() {
  const { team1, team2, time } = useLocalSearchParams();

  // Team scores
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  // Main timer
const timeStr = Array.isArray(time) ? time[0] : time || '20:00';
const [matchSeconds, setMatchSeconds] = useState(() => {
  const [min, sec] = timeStr.split(':').map(Number);
  return min * 60 + sec;
});

  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Timeout timer
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);
  const timeoutRef = useRef<number| null>(null);

  // Half-time state
  const [isHalfTimeEnabled, setIsHalfTimeEnabled] = useState(false);

  useEffect(() => {
    if (isRunning && matchSeconds > 0 && timeoutSeconds === 0) {
      timerRef.current = setInterval(() => {
        setMatchSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [isRunning, matchSeconds, timeoutSeconds]);

  useEffect(() => {
    if (matchSeconds === 0) {
      setIsRunning(false);
      setIsHalfTimeEnabled(true);
    }
  }, [matchSeconds]);

  useEffect(() => {
    if (timeoutSeconds > 0) {
      timeoutRef.current = setInterval(() => {
        setTimeoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timeoutRef.current!);
  }, [timeoutSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      {/* Left: Team Names and Scores */}
      <View style={styles.teamSection}>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>{team1 || 'Team A'}</Text>
          <Text style={styles.vs}>|</Text>
          <Text style={styles.teamName}>{team2 || 'Team B'}</Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{team1Score.toString().padStart(2, '0')}</Text>
          <Text style={styles.vs}>:</Text>
          <Text style={styles.score}>{team2Score.toString().padStart(2, '0')}</Text>
        </View>
      </View>

      {/* Right: Timers and Buttons */}
      <View style={styles.timerSection}>
<View style={styles.row}>
  <Text style={styles.mainTimer}>
    <FontAwesome name="clock-o" size={20} /> {formatTime(matchSeconds)}
  </Text>

  <TouchableOpacity
    style={styles.buttonInline}
    onPress={() => setIsRunning((prev) => !prev)}
  >
    <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
  </TouchableOpacity>
</View>


        <TouchableOpacity
          style={[
            styles.button,
            !isHalfTimeEnabled && styles.disabledButton,
          ]}
          disabled={!isHalfTimeEnabled}
          onPress={() => {
            // Half-time logic will be added later
            alert('Half Time clicked');
          }}
        >
          <Text style={styles.buttonText}>Half Time</Text>
        </TouchableOpacity>

<View style={styles.row}>
  <TouchableOpacity
    style={styles.buttonInline}
    onPress={() => {
      setIsRunning(false);
      setTimeoutSeconds(30);
    }}
  >
    <Text style={styles.buttonText}>Timeout</Text>
  </TouchableOpacity>

  {timeoutSeconds > 0 && (
    <Text style={styles.timeoutText}>⏳ {timeoutSeconds}s</Text>
  )}
</View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '20%',
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  teamSection: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  score: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  vs: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  timerSection: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTimer: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginVertical: 2,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  timeoutText: {
    fontSize: 16,
    color: 'red',
    marginTop: 6,
  },
  row: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 6,
  gap: 10,
},
buttonInline: {
  backgroundColor: '#1976d2',
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 6,
  marginLeft: 10,
},

});
