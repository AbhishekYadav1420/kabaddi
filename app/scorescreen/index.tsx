// app/scorescreen.tsx
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type PlayerStatus = { name: string; out: boolean };

export default function ScoreScreen() {
  const { team1, team2, playersTeam1, playersTeam2, toss, time } =
    useLocalSearchParams<{
      team1: string;
      team2: string;
      playersTeam1: string;
      playersTeam2: string;
      toss: string;
      time: string;
    }>();

  const team1Name = team1 || "Team 1";
  const team2Name = team2 || "Team 2";
  const matchTime = parseInt(time || "600");

  const initialTeam1Players: PlayerStatus[] = JSON.parse(
    playersTeam1 || "[]"
  ).map((name: string) => ({ name, out: false }));
  const initialTeam2Players: PlayerStatus[] = JSON.parse(
    playersTeam2 || "[]"
  ).map((name: string) => ({ name, out: false }));

  const [team1Players, setTeam1Players] =
    useState<PlayerStatus[]>(initialTeam1Players);
  const [team2Players, setTeam2Players] =
    useState<PlayerStatus[]>(initialTeam2Players);

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  const [matchTimer, setMatchTimer] = useState(matchTime);
  const [matchRunning, setMatchRunning] = useState(false);
  const matchInterval = useRef<NodeJS.Timeout | null>(null);

  const [timeoutTimer, setTimeoutTimer] = useState(30);
  const [timeoutRunning, setTimeoutRunning] = useState(false);
  const timeoutInterval = useRef<NodeJS.Timeout | null>(null);

  const [gamePhase, setGamePhase] = useState<
    "first" | "halftime" | "second" | "ended"
  >("first");

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

  const [team1RaidActions, setTeam1RaidActions] = useState<any[]>([]);
  const [team2RaidActions, setTeam2RaidActions] = useState<any[]>([]);

  const [team1FoulChecked, setTeam1FoulChecked] = useState(false);
  const [team2FoulChecked, setTeam2FoulChecked] = useState(false);

  const [team1EmptyRaidCount, setTeam1EmptyRaidCount] = useState(0);
  const [team2EmptyRaidCount, setTeam2EmptyRaidCount] = useState(0);

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
    setTeam1DropdownItems(
      team1Players
        .filter((p) => !p.out)
        .map((p) => ({ label: p.name, value: p.name }))
    );
    setTeam2DropdownItems(
      team2Players
        .filter((p) => !p.out)
        .map((p) => ({ label: p.name, value: p.name }))
    );
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
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleHalfTimePress = () => {
    setMatchTimer(matchTime);
    setGamePhase("halftime");
    setMatchRunning(false);
  };

  const handleHalftimeEnd = () => {
    setGamePhase("second");
  };

  const handleFullTime = () => {
    setGamePhase("ended");
    setMatchRunning(false);
  };

  const handleOut = (team: 1 | 2, index: number) => {
    const current = team === 1 ? [...team1Players] : [...team2Players];
    if (current[index].out) return;
    current[index].out = true;

    const setCurrent = team === 1 ? setTeam1Players : setTeam2Players;
    const getOpponent = team === 1 ? [...team2Players] : [...team1Players];
    const setOpponent = team === 1 ? setTeam2Players : setTeam1Players;

    setCurrent(current);

    const actionStack = team === 1 ? team1RaidActions : team2RaidActions;
    const setActionStack =
      team === 1 ? setTeam1RaidActions : setTeam2RaidActions;
    setActionStack([...actionStack, { type: "out", index }]);

    const reviveIndex = getOpponent.findIndex((p) => p.out);
    if (reviveIndex !== -1) {
      getOpponent[reviveIndex].out = false;
      setOpponent(getOpponent);
      setActionStack((prev) => [
        ...prev,
        { type: "revive", index: reviveIndex },
      ]);
    }

    if (current.every((p) => p.out)) {
      const revived = current.map((p) => ({ ...p, out: false }));
      setCurrent(revived);
      const setScore = team === 1 ? setTeam2Score : setTeam1Score;
      setScore((s) => s + 2);
      setActionStack((prev) => [...prev, { type: "score", value: 2 }]);
    }
  };
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
    opponentPlayers: PlayerStatus[]
  ) => {
    const handleScore = (pts: number) => {
      let finalPoints = pts;
      if (
        (teamNum === 1 && team1FoulChecked) ||
        (teamNum === 2 && team2FoulChecked)
      ) {
        finalPoints += 1; // Foul point
        if (teamNum === 1) setTeam1FoulChecked(false);
        else setTeam2FoulChecked(false);
      }

      setScore((prev) => prev + finalPoints);

      const actionStack = teamNum === 1 ? team1RaidActions : team2RaidActions;
      const setActionStack =
        teamNum === 1 ? setTeam1RaidActions : setTeam2RaidActions;
      setActionStack([...actionStack, { type: "score", value: finalPoints }]);

      // Reset empty raid count since score is given
      if (teamNum === 1) setTeam1EmptyRaidCount(0);
      else setTeam2EmptyRaidCount(0);
    };

    const handleTackle = () => {
      const defendersIn = players.filter((p) => !p.out).length;
      const points = defendersIn <= 3 ? 2 : 1;

      // This team is the defender, award points to this team
      setScore((prev) => prev + points);

      const actionStack = teamNum === 1 ? team1RaidActions : team2RaidActions;
      const setActionStack =
        teamNum === 1 ? setTeam1RaidActions : setTeam2RaidActions;
      setActionStack([...actionStack, { type: "score", value: points }]);
    };

    const handleOut = (team: 1 | 2, index: number) => {
      const current = team === 1 ? [...team1Players] : [...team2Players];
      if (current[index].out) return;
      current[index].out = true;

      const setCurrent = team === 1 ? setTeam1Players : setTeam2Players;
      const getOpponent = team === 1 ? [...team2Players] : [...team1Players];
      const setOpponent = team === 1 ? setTeam2Players : setTeam1Players;

      setCurrent(current);

      const actionStack = team === 1 ? team1RaidActions : team2RaidActions;
      const setActionStack =
        team === 1 ? setTeam1RaidActions : setTeam2RaidActions;
      setActionStack([...actionStack, { type: "out", index }]);

      const reviveIndex = getOpponent.findIndex((p) => p.out);
      if (reviveIndex !== -1) {
        getOpponent[reviveIndex].out = false;
        setOpponent(getOpponent);
        setActionStack((prev) => [
          ...prev,
          { type: "revive", index: reviveIndex },
        ]);
      }

      if (current.every((p) => p.out)) {
        const revived = current.map((p) => ({ ...p, out: false }));
        setCurrent(revived);
        const setScore = team === 1 ? setTeam2Score : setTeam1Score;
        setScore((s) => s + 2);
        setActionStack((prev) => [...prev, { type: "score", value: 2 }]);
      }
    };

    const handleUndo = () => {
      const actions =
        teamNum === 1 ? [...team1RaidActions] : [...team2RaidActions];
      const setActions =
        teamNum === 1 ? setTeam1RaidActions : setTeam2RaidActions;
      const setScoreFn = teamNum === 1 ? setTeam1Score : setTeam2Score;
      const setPlayersFn = teamNum === 1 ? setTeam1Players : setTeam2Players;

      const playersCopy = [...players.map((p) => ({ ...p }))];
      const oppPlayersCopy = [...opponentPlayers.map((p) => ({ ...p }))];
      const setOppPlayers = teamNum === 1 ? setTeam2Players : setTeam1Players;
      const setOppScoreFn = teamNum === 1 ? setTeam2Score : setTeam1Score;

      for (let i = actions.length - 1; i >= 0; i--) {
        const act = actions[i];
        if (act.type === "score") {
          if (act.toOpponent) {
            setOppScoreFn((prev) => Math.max(prev - act.value, 0));
          } else {
            setScoreFn((prev) => Math.max(prev - act.value, 0));
          }
        } else if (act.type === "out") {
          playersCopy[act.index].out = false;
        } else if (act.type === "revive") {
          oppPlayersCopy[act.index].out = true;
        }
      }

      setPlayersFn(playersCopy);
      setOppPlayers(oppPlayersCopy);
      setActions([]);
    };

    const isThisTeamRaiding =
      (teamNum === 1 && team1RaidRunning) ||
      (teamNum === 2 && team2RaidRunning);
    const isThisTeamDefending = !isThisTeamRaiding;

    const defendersIn = players.filter((p) => !p.out).length;

    return (
      <View style={styles.teamSection}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamTitle}>{teamName}</Text>
          {renderDots(players)}
          <Text style={styles.timerText}>{raidTimer}s</Text>
          <TouchableOpacity
            onPress={() => {
              const newState = !raidRunning;
              setRaidRunning(newState);

              // Clear raid actions on start
              const setActions =
                teamNum === 1 ? setTeam1RaidActions : setTeam2RaidActions;
              setActions([]);

              // Reset dropdown selection when raid ends
              if (!newState) {
                const actions =
                  teamNum === 1 ? team1RaidActions : team2RaidActions;
                const dropdownVal =
                  teamNum === 1 ? team1DropdownValue : team2DropdownValue;
                const playersList =
                  teamNum === 1 ? [...team1Players] : [...team2Players];
                const setPlayersList =
                  teamNum === 1 ? setTeam1Players : setTeam2Players;

                if (dropdownVal && actions.length === 0) {
                  // No scoring = Empty raid
                  if (teamNum === 1) {
                    setTeam1EmptyRaidCount((prev) => {
                      if (prev === 2) {
                        // 3rd empty raid = Do-or-Die = auto out raider
                        const idx = playersList.findIndex(
                          (p) => p.name === dropdownVal
                        );
                        if (idx !== -1) {
                          playersList[idx].out = true;
                          setTeam1Players(playersList);
                        }
                        return 0;
                      }
                      return prev + 1;
                    });
                  } else {
                    setTeam2EmptyRaidCount((prev) => {
                      if (prev === 2) {
                        const idx = playersList.findIndex(
                          (p) => p.name === dropdownVal
                        );
                        if (idx !== -1) {
                          playersList[idx].out = true;
                          setTeam2Players(playersList);
                        }
                        return 0;
                      }
                      return prev + 1;
                    });
                  }
                } else {
                  // If not empty, reset empty raid
                  if (teamNum === 1) setTeam1EmptyRaidCount(0);
                  else setTeam2EmptyRaidCount(0);
                }

                (teamNum === 1 ? setTeam1DropdownValue : setTeam2DropdownValue)(
                  null
                );
              }
            }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{raidRunning ? "End" : "Start"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, { flex: 2, marginRight: 6 }]}>
            {players.map(
              (p, idx) =>
                !p.out && (
                  <View key={idx} style={styles.playerRow}>
                    <Text style={{ flex: 1 }}>{p.name}</Text>
                    <TouchableOpacity onPress={() => handleOut(teamNum, idx)}>
                      <Text style={styles.outBtn}>Out</Text>
                    </TouchableOpacity>
                  </View>
                )
            )}
          </View>

          <View style={[styles.card, { flex: 3, marginLeft: 6 }]}>
            <DropDownPicker
              open={dropdownOpen}
              value={dropdownValue}
              items={dropdownItems}
              setOpen={setDropdownOpen}
              setValue={setDropdownValue}
              setItems={setDropdownItems}
              placeholder={raidRunning ? "Select Raider" : "Select Defender"}
              containerStyle={{ marginBottom: 10 }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  teamNum === 1
                    ? setTeam1FoulChecked((prev) => !prev)
                    : setTeam2FoulChecked((prev) => !prev)
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#ddd",
                  padding: 6,
                  borderRadius: 6,
                }}
              >
                <FontAwesome
                  name={
                    (teamNum === 1 ? team1FoulChecked : team2FoulChecked)
                      ? "check-square-o"
                      : "square-o"
                  }
                  size={20}
                  color="#333"
                />
                <Text style={{ marginLeft: 8 }}>Foul</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", marginLeft: 20 }}>
                {[0, 1, 2].map((dot) => {
                  const filled =
                    (teamNum === 1
                      ? team1EmptyRaidCount
                      : team2EmptyRaidCount) > dot;
                  return (
                    <FontAwesome
                      key={dot}
                      name="circle"
                      size={14}
                      color={filled ? "red" : "white"}
                      style={{ marginRight: 4 }}
                    />
                  );
                })}
                {(teamNum === 1 ? team1EmptyRaidCount : team2EmptyRaidCount) ===
                  3 && (
                  <Text
                    style={{ color: "red", marginLeft: 6, fontWeight: "bold" }}
                  >
                    Do-or-Die!
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.scoreBtnGroup}>
              {["Bonus", "1", "2", "3", "4", "5", "6", "7"].map((label) => {
                if (label === "Bonus") {
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => handleScore(1)}
                      disabled={
                        opponentPlayers.filter((p) => !p.out).length < 6
                      }
                      style={[
                        styles.scoreBtn,
                        {
                          backgroundColor:
                            opponentPlayers.filter((p) => !p.out).length < 6
                              ? "gray"
                              : "#FF9800",
                        },
                      ]}
                    >
                      <Text style={styles.scoreBtnText}>Bonus</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => handleScore(parseInt(label))}
                    style={styles.scoreBtn}
                  >
                    <Text style={styles.scoreBtnText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Show tackle button only if defending */}
              {isThisTeamDefending && (
                <TouchableOpacity
                  onPress={handleTackle}
                  style={styles.scoreBtn}
                >
                  <Text style={styles.scoreBtnText}>
                    {defendersIn <= 3 ? "Super Tackle" : "Tackle"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleUndo} style={styles.scoreBtn}>
                <Text style={styles.scoreBtnText}>Undo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderDots = (players: PlayerStatus[]) => (
    <View style={{ flexDirection: "row", marginVertical: 4 }}>
      {players.map((p, idx) => (
        <FontAwesome
          key={idx}
          name="circle"
          size={14}
          color={p.out ? "gray" : "green"}
          style={{ marginRight: 4 }}
        />
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={[styles.card, { flex: 1, marginRight: 5 }]}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            {team1Name} | {team2Name}
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 4,
              justifyContent: "center",
            }}
          >
            {team1Score.toString().padStart(2, "0")} :{" "}
            {team2Score.toString().padStart(2, "0")}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { flex: 1, marginLeft: 5, alignItems: "center" },
          ]}
        >
          {gamePhase !== "ended" ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}
                >
                  {formatTime(matchTimer)}
                </Text>
                <TouchableOpacity
                  style={[styles.controlBtn, { backgroundColor: "#2196F3" }]}
                  onPress={() => setMatchRunning((prev) => !prev)}
                  disabled={gamePhase === "halftime"}
                >
                  <Text style={styles.controlBtnText}>
                    {matchRunning ? "Pause" : "Start"}
                  </Text>
                </TouchableOpacity>
              </View>

              {gamePhase === "first" && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  disabled={matchTimer > 0}
                  onPress={handleHalfTimePress}
                >
                  <Text style={styles.controlBtnText}>Half Time</Text>
                </TouchableOpacity>
              )}

              {gamePhase === "halftime" && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={handleHalftimeEnd}
                >
                  <Text style={styles.controlBtnText}>Halftime End</Text>
                </TouchableOpacity>
              )}

              {gamePhase === "second" && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  disabled={matchTimer > 0}
                  onPress={handleFullTime}
                >
                  <Text style={styles.controlBtnText}>Full Time</Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setTimeoutRunning(true)}
                  style={[styles.controlBtn, { paddingHorizontal: 16 }]}
                >
                  <Text style={styles.controlBtnText}>Timeout</Text>
                </TouchableOpacity>
                {timeoutRunning && (
                  <Text style={{ marginLeft: 10, fontSize: 16 }}>
                    {timeoutTimer}s
                  </Text>
                )}
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "red" }}>
              Match Over!
            </Text>
          )}
        </View>
      </View>

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
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
  },
  controlBtn: {
    backgroundColor: "#4CAF50",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  controlBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  teamSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  teamTitle: { fontSize: 18, fontWeight: "bold", flex: 1 },
  timerText: { fontSize: 16, marginHorizontal: 6 },
  btn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: { color: "white", fontWeight: "bold" },
  cardRow: { flexDirection: "row" },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  outBtn: {
    color: "red",
    fontWeight: "bold",
  },
  scoreBtnGroup: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  scoreBtn: {
    backgroundColor: "#FF9800", // fallback color — overridden conditionally in Bonus button
    padding: 10,
    margin: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  scoreBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
