import React, { useState } from "react";
import { Button, Text, View } from "react-native";

const ScoreScreen = () => {
  const [team1Players, setTeam1Players] = useState([
    { name: "Player 1", out: false },
    { name: "Player 2", out: false },
  ]);
  const [team2Players, setTeam2Players] = useState([
    { name: "Player A", out: false },
    { name: "Player B", out: false },
  ]);

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [teamNum, setTeamNum] = useState<1 | 2>(1); // 👈 keeps track of which team is active
  const [dropdownValue, setDropdownValue] = useState("Player A");

  const team1RaidRunning = teamNum === 1;
  const team2RaidRunning = teamNum === 2;
  const isFoul = false;

  const handleOut = (team: 1 | 2, index: number) => {
    const current = team === 1 ? [...team1Players] : [...team2Players];
    if (current[index].out) return;
    current[index].out = true;

    const setCurrent = team === 1 ? setTeam1Players : setTeam2Players;
    setCurrent(current);

    const getOpponent = team === 1 ? [...team2Players] : [...team1Players];
    const setOpponent = team === 1 ? setTeam2Players : setTeam1Players;

    const reviveIndex = getOpponent.findIndex((p) => p.out);
    if (reviveIndex !== -1) {
      getOpponent[reviveIndex].out = false;
      setOpponent(getOpponent);
    }

    if (current.every((p) => p.out)) {
      const revived = current.map((p) => ({ ...p, out: false }));
      setCurrent(revived);
      const setScore = team === 1 ? setTeam2Score : setTeam1Score;
      setScore((s) => s + 2);
    }
  };

  const handleScore = (pts: number) => {
    if (!isFoul && !dropdownValue) return;

    if (!isFoul && dropdownValue) {
      const outTeam =
        teamNum === 1
          ? team1RaidRunning
            ? 2
            : 1
          : team2RaidRunning
          ? 1
          : 2;

      const players = outTeam === 1 ? team1Players : team2Players;
      const outIndex = players.findIndex((p) => p.name === dropdownValue);

      if (outIndex !== -1) {
        handleOut(outTeam, outIndex);
      }
    }

    if (teamNum === 1) {
      setTeam1Score((prev) => prev + pts);
    } else {
      setTeam2Score((prev) => prev + pts);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Team 1 Score: {team1Score}</Text>
      <Text>Team 2 Score: {team2Score}</Text>
      <Text>Current Turn: Team {teamNum}</Text>

      <Button title="Add 1 Point" onPress={() => handleScore(1)} />

      <View style={{ marginTop: 10 }}>
        <Button
          title="Switch Turn"
          onPress={() => setTeamNum((prev) => (prev === 1 ? 2 : 1))}
        />
      </View>
    </View>
  );
};

export default ScoreScreen;
