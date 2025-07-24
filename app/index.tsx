import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const IndexScreen = () => {
  const router = useRouter();

  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [playersTeam1, setPlayersTeam1] = useState<string[]>([]);
  const [playersTeam2, setPlayersTeam2] = useState<string[]>([]);
  const [playerName1, setPlayerName1] = useState('');
  const [playerName2, setPlayerName2] = useState('');
  const [showPlayers, setShowPlayers] = useState(true);
  const [selectedTossWinner, setSelectedTossWinner] = useState<'team1' | 'team2' | null>(null);
  const [choice, setChoice] = useState<'Raid' | 'Ground' | null>(null);
  const [time, setTime] = useState('30:00');
  const [bonusAllowed, setBonusAllowed] = useState(true);
  const [superTackleAllowed, setSuperTackleAllowed] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addPlayer = (team: 'team1' | 'team2') => {
    if (team === 'team1' && playerName1 && playersTeam1.length < 7) {
      setPlayersTeam1([...playersTeam1, playerName1]);
      setPlayerName1('');
    }
    if (team === 'team2' && playerName2 && playersTeam2.length < 7) {
      setPlayersTeam2([...playersTeam2, playerName2]);
      setPlayerName2('');
    }
  };

  const removePlayer = (team: 'team1' | 'team2', index: number) => {
    const updated = team === 'team1' ? [...playersTeam1] : [...playersTeam2];
    updated.splice(index, 1);
    team === 'team1' ? setPlayersTeam1(updated) : setPlayersTeam2(updated);
  };

  const validateAndStart = () => {
    if (playersTeam1.length !== 7 || playersTeam2.length !== 7) {
      Alert.alert('Error', 'Both teams must have exactly 7 players');
      return;
    }
    if (!/^[0-5]?[0-9]:[0-5][0-9]$/.test(time)) {
      Alert.alert('Error', 'Time must be in mm:ss format');
      return;
    }
    if (!selectedTossWinner || !choice) {
      Alert.alert('Error', 'Please complete toss and raid/ground selections');
      return;
    }
    router.push({
      pathname: '/scorescreen',
      params: {
        team1,
        team2,
        playersTeam1: JSON.stringify(playersTeam1),
        playersTeam2: JSON.stringify(playersTeam2),
        selectedTossWinner,
        choice,
        time,
    bonusAllowed: bonusAllowed.toString(),    
    superTackleAllowed: superTackleAllowed.toString(),
      },
    });
  };

  const getToggleStyle = (selected: boolean) => [
    styles.toggleButton,
    selected && styles.toggleButtonSelected,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* <Text style={styles.header}>Kabaddi Match Setup</Text> */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teams</Text>
        <TextInput
          placeholder="Team 1 Name"
          style={styles.input}
          value={team1}
          onChangeText={setTeam1}
        />
        <TextInput
          placeholder="Team 2 Name"
          style={styles.input}
          value={team2}
          onChangeText={setTeam2}
        />
      </View>

      {team1 && team2 && showPlayers && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <View style={styles.playerRowWrap}>
            <View style={styles.playerSectionWrap}>
              <Text style={styles.teamHeader}>{team1}</Text>
              {playersTeam1.map((p, i) => (
                <View key={i} style={styles.playerRowItemWrap}>
                  <Text style={styles.playerNameWrap}>{i + 1}.{p}</Text>
                  <TouchableOpacity onPress={() => removePlayer('team1', i)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {playersTeam1.length < 7 && (
                <>
                  <TextInput
                    placeholder="Enter Player Name"
                    placeholderTextColor="#aaa"
                    value={playerName1}
                    onChangeText={setPlayerName1}
                    style={styles.input}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={() => addPlayer('team1')}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.playerSectionWrap}>
              <Text style={styles.teamHeader}>{team2}</Text>
              {playersTeam2.map((p, i) => (
                <View key={i} style={styles.playerRowItemWrap}>
                  <Text style={styles.playerNameWrap}>{i + 1}.{p}</Text>
                  <TouchableOpacity onPress={() => removePlayer('team2', i)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {playersTeam2.length < 7 && (
                <>
                  <TextInput
                    placeholder="Enter Player Name"
                    placeholderTextColor="#aaa"
                    value={playerName2}
                    onChangeText={setPlayerName2}
                    style={styles.input}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={() => addPlayer('team2')}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {playersTeam1.length === 7 && playersTeam2.length === 7 && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowPlayers(false)}>
              <Text style={styles.actionButtonText}>Done with Adding Players</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!showPlayers && (
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowPlayers(true)}>
          <Text style={styles.actionButtonText}>Edit Players</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toss Winner</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={getToggleStyle(selectedTossWinner === 'team1')}
            onPress={() => setSelectedTossWinner('team1')}
          >
            <Text>{team1 || 'Team 1'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getToggleStyle(selectedTossWinner === 'team2')}
            onPress={() => setSelectedTossWinner('team2')}
          >
            <Text>{team2 || 'Team 2'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={getToggleStyle(choice === 'Raid')}
            onPress={() => setChoice('Raid')}
          >
            <Text>Raid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getToggleStyle(choice === 'Ground')}
            onPress={() => setChoice('Ground')}
          >
            <Text>Ground</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time (mm:ss)</Text>
        <TextInput
          placeholder="mm:ss"
          style={styles.input}
          value={time}
          onChangeText={setTime}
          keyboardType="default"
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={styles.sectionTitle}>Advanced Settings {showAdvanced ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showAdvanced && (
          <>
            <View style={styles.switchRow}>
              <Text>Bonus Allowed</Text>
              <Switch value={bonusAllowed} onValueChange={setBonusAllowed} />
            </View>
            <View style={styles.switchRow}>
              <Text>Super Tackle Allowed</Text>
              <Switch value={superTackleAllowed} onValueChange={setSuperTackleAllowed} />
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={validateAndStart}>
        <Text style={styles.startButtonText}>Start Match</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  teamHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, minHeight: 40 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
  playerSectionWrap: { flex: 1, padding: 10 },
  playerRowWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  playerRowItemWrap: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  playerNameWrap: {
    flexShrink: 1,
    flexWrap: 'wrap',
    color: '#000',
  },
  removeText: {
    color: 'red',
    fontSize: 10,
    borderColor: 'red',
    borderWidth: 1,
    textAlign: 'center',
    borderRadius: 4,
    marginTop: 1,
    paddingHorizontal: 5,
    marginLeft: 10,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: '#baddf8ff',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  toggleButtonSelected: {
    backgroundColor: '#007bff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default IndexScreen;