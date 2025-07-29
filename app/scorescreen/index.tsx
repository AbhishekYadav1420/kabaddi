import { setMatchSummary } from "@/storedata/matchSummaryStore"; // ✅ adjust path if needed
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const {
    team1,
    team2,
    playersTeam1,
    playersTeam2,
    time,
    bonusAllowed,
    superTackleAllowed,
    choice,
    selectedTossWinner,
  } = useLocalSearchParams<{
    team1: string;
    team2: string;
    playersTeam1: string;
    playersTeam2: string;
    selectedTossWinner: string;
    choice: string;
    time: string;
    bonusAllowed: string;
    superTackleAllowed: string;
  }>();

  const team1Name = team1 || "Team 1";
  const team2Name = team2 || "Team 2";
  const matchTime = (() => {
    if (!time) return 600; // default 10 min
    const parts = time.split(":");
    if (parts.length !== 2) return 600;
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    return minutes * 60 + seconds;
  })();

  const truncateName = (name: string, maxLength = 14) =>
    name.length > maxLength ? name.slice(0, maxLength - 1) + "…" : name;

  const displayedTeam1Name = truncateName(team1Name);
  const displayedTeam2Name = truncateName(team2Name);

  // Choose a fixed width per name based on the longest truncated name
  const charWidth = 9; // adjust based on font size
  const longestTruncatedLength = Math.max(
    displayedTeam1Name.length,
    displayedTeam2Name.length
  );
  const nameWidth = longestTruncatedLength * charWidth;
  const nameBlockWidth = longestTruncatedLength * charWidth;

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

  const isBonusAllowed = bonusAllowed === "true";
  const isSuperTackleAllowed = superTackleAllowed === "true";

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  const [matchTimer, setMatchTimer] = useState(matchTime);
  const [matchRunning, setMatchRunning] = useState(false);
  const matchInterval = useRef<NodeJS.Timeout | null>(null);

  const [timeoutTimer, setTimeoutTimer] = useState(30);
  const [timeoutRunning, setTimeoutRunning] = useState(false);
  const timeoutInterval = useRef<NodeJS.Timeout | null>(null);

  const [gamePhase, setGamePhase] = useState<
    "not_started" | "first" | "halftime" | "second" | "ended"
  >("not_started");

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

  const [team1PendingEmpty, setTeam1PendingEmpty] = useState(false);
  const [team2PendingEmpty, setTeam2PendingEmpty] = useState(false);

  const [doOrDieTeam, setDoOrDieTeam] = useState<1 | 2 | null>(null);
  const [showDropdownWarning, setShowDropdownWarning] = useState(false);
  const disableDropdowns = !team1RaidRunning && !team2RaidRunning;

  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const scrollOffsetY = useRef(0);

  const [team1RaidPoints, setTeam1RaidPoints] = useState(0);
  const [team2RaidPoints, setTeam2RaidPoints] = useState(0);
  const [team1TacklePoints, setTeam1TacklePoints] = useState(0);
  const [team2TacklePoints, setTeam2TacklePoints] = useState(0);

  const [team1AlloutScore, setTeam1AlloutScore] = useState(0);
  const [team2AlloutScore, setTeam2AlloutScore] = useState(0);

  // Store allout count
  const [team1Allouts, setTeam1Allouts] = useState(0);
  const [team2Allouts, setTeam2Allouts] = useState(0);
  const [team1PlayerStats, setTeam1PlayerStats] = useState<PlayerStatsMap>({});
  const [team2PlayerStats, setTeam2PlayerStats] = useState<PlayerStatsMap>({});
  const [mainTimeOverWhileRaid, setMainTimeOverWhileRaid] = useState(false);

  const [backPressCount, setBackPressCount] = useState(0);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const backPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState<number>(matchTime); // or however you're tracking time

  const [teamNum, setTeamNum] = useState<1 | 2>(1); // current team's turn

  type PlayerStat = {
    name: string;
    raidPoints: number;
    defensePoints: number;
    isOut: boolean;
  };

  // Map of player name to stats
  type PlayerStatsMap = {
    [playerName: string]: PlayerStat;
  };

  useEffect(() => {
    if (matchRunning) {
      matchInterval.current = setInterval(() => {
        setMatchTimer((prev) => {
          if (prev === 1) {
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

  useEffect(() => {
    if (matchTimer === 0) {
      if (team1RaidRunning || team2RaidRunning) {
        setMainTimeOverWhileRaid(true); // ⏱️ Defer stopping
      } else {
        setMatchRunning(false); // ❌ Stop immediately
      }
    }
  }, [matchTimer, team1RaidRunning, team2RaidRunning]);

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

  const endRaid = (teamNum: 1 | 2) => {
    const isTeam1 = teamNum === 1;
    const actions = isTeam1 ? team1RaidActions : team2RaidActions;
    const dropdownVal = isTeam1 ? team1DropdownValue : team2DropdownValue;

    // Current team logic (empty if no action)
    if (dropdownVal && actions.length === 0) {
      if (doOrDieTeam === teamNum) {
        if (isTeam1) {
          setTeam1EmptyRaidCount(0);
          setDoOrDieTeam(null);
        } else {
          setTeam2EmptyRaidCount(0);
          setDoOrDieTeam(null);
        }
      } else {
        if (isTeam1) setTeam1PendingEmpty(true);
        else setTeam2PendingEmpty(true);
      }
    }

    // ❗DELAY opponent empty raid logic slightly so dropdown value/state updates fully
    setTimeout(() => {
      const opponentTeam = isTeam1 ? 2 : 1;
      const isOpponentTeam1 = opponentTeam === 1;

      const pendingEmpty = isOpponentTeam1
        ? team1PendingEmpty
        : team2PendingEmpty;
      const setPendingEmpty = isOpponentTeam1
        ? setTeam1PendingEmpty
        : setTeam2PendingEmpty;
      const setEmptyRaidCount = isOpponentTeam1
        ? setTeam1EmptyRaidCount
        : setTeam2EmptyRaidCount;
      const dropdownValue = isOpponentTeam1
        ? team1DropdownValue
        : team2DropdownValue;
      const players = isOpponentTeam1 ? team1Players : team2Players;
      const setPlayers = isOpponentTeam1 ? setTeam1Players : setTeam2Players;

      if (pendingEmpty) {
        setEmptyRaidCount((prev) => {
          if (prev === 2) {
            const updated = [...players];
            const idx = updated.findIndex((p) => p.name === dropdownValue);
            if (idx !== -1) {
              updated[idx].out = true;
              setPlayers(updated);
            }
            return 0;
          }
          return prev + 1;
        });
        setPendingEmpty(false);
      }
    }, 0); // ← Changed from 100ms to 0ms and using updated state access

    // Reset dropdowns
    setTeam1DropdownValue(null);
    setTeam2DropdownValue(null);

    // Stop raid
    if (isTeam1) setTeam1RaidRunning(false);
    else setTeam2RaidRunning(false);
  };
  useEffect(() => {
    if (team1RaidRunning) {
      team1RaidInterval.current = setInterval(() => {
        setTeam1RaidTimer((prev) => {
          if (prev === 1) {
            clearInterval(team1RaidInterval.current!);

            // ✅ Delay endRaid to ensure state is fresh
            requestAnimationFrame(() => {
              endRaid(1);

              // ✅ Stop main timer if needed
              if (mainTimeOverWhileRaid) {
                setMatchRunning(false);
                setMainTimeOverWhileRaid(false);
              }
            });

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

            // ✅ Delay endRaid to ensure state is fresh
            requestAnimationFrame(() => {
              endRaid(2);

              // ✅ Stop main timer if needed
              if (mainTimeOverWhileRaid) {
                setMatchRunning(false);
                setMainTimeOverWhileRaid(false);
              }
            });

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

  const updatePlayerStats = (
    team: "team1" | "team2",
    playerName: string,
    type: "raid" | "defense",
    points: number
  ) => {
    const setStats =
      team === "team1" ? setTeam1PlayerStats : setTeam2PlayerStats;
    const currentStats = team === "team1" ? team1PlayerStats : team2PlayerStats;

    const prev = currentStats[playerName] || {
      name: playerName,
      raidPoints: 0,
      defensePoints: 0,
      isOut: false,
    };

    const updated = {
      ...prev,
      raidPoints: type === "raid" ? prev.raidPoints + points : prev.raidPoints,
      defensePoints:
        type === "defense" ? prev.defensePoints + points : prev.defensePoints,
    };

    setStats((prev) => ({
      ...prev,
      [playerName]: updated,
    }));
  };

  const setPlayerOutStatus = (
    team: "team1" | "team2",
    playerName: string,
    isOut: boolean
  ) => {
    const setStats =
      team === "team1" ? setTeam1PlayerStats : setTeam2PlayerStats;
    setStats((prev) => ({
      ...prev,
      [playerName]: {
        ...(prev[playerName] || {
          name: playerName,
          raidPoints: 0,
          defensePoints: 0,
          isOut: false,
        }),
        isOut,
      },
    }));
  };

  const router = useRouter();
  const handleDoubleBack = () => {
    if (backPressCount === 0) {
      setBackPressCount(1);
      setShowBackWarning(true);

      backPressTimer.current = setTimeout(() => {
        setBackPressCount(0);
        setShowBackWarning(false);
      }, 2000);
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    return () => {
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, []);

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

  const handleStartPress = () => {
    if (
      gamePhase === "halftime" ||
      gamePhase === "second" ||
      gamePhase === "ended"
    )
      return;

    setGamePhase("first"); // 👈 Make sure to mark as first half
    setMatchRunning(true);
  };

  const generateMatchSummary = () => {
    const formatPlayers = (playerNames: string[], stats: Record<string, any>) =>
      playerNames.map((name) => {
        const p = stats[name] || {};
        return {
          name,
          raid: p.raidPoints || 0,
          tackle: p.defensePoints || 0,
          extra: 0,
        };
      });

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

    const summary = {
      team1: {
        name: team1Name,
        score: team1Score,
        allout: team1Allouts,
        points: {
          raid: Object.values(team1PlayerStats).reduce(
            (sum, p) => sum + (p.raidPoints || 0),
            0
          ),
          tackle: Object.values(team1PlayerStats).reduce(
            (sum, p) => sum + (p.defensePoints || 0),
            0
          ),
          allout: team1Allouts,
          extra: 0,
        },
        players: formatPlayers(
          team1Players.map((p) => p.name),
          team1PlayerStats
        ),
      },
      team2: {
        name: team2Name,
        score: team2Score,
        allout: team2Allouts,
        points: {
          raid: Object.values(team2PlayerStats).reduce(
            (sum, p) => sum + (p.raidPoints || 0),
            0
          ),
          tackle: Object.values(team2PlayerStats).reduce(
            (sum, p) => sum + (p.defensePoints || 0),
            0
          ),
          allout: team2Allouts,
          extra: 0,
        },
        players: formatPlayers(
          team2Players.map((p) => p.name),
          team2PlayerStats
        ),
      },
      timeStatus, // keep this for display
      gamePhase, // ✅ add this
      timer, // ✅ add this
      winner:
        gamePhase === "ended"
          ? team1Score > team2Score
            ? team1Name
            : team2Score > team1Score
            ? team2Name
            : "Tie"
          : "Match In Progress",
    };

    setMatchSummary(summary);
    router.push("/scorescreen/summary");
  };

  // const StickyScoreHeader = ({
  //   team1Name,
  //   team2Name,
  //   team1Score,
  //   team2Score,
  // }: {
  //   team1Name: string;
  //   team2Name: string;
  //   team1Score: number;
  //   team2Score: number;
  // }) => (
  //   <View style={styles.stickyHeader}>
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         padding: 4,
  //       }}
  //     >
  //       <Text
  //         style={[
  //           styles.stickyText,
  //           {
  //             width: nameWidth,
  //             textAlign: "center",
  //             fontWeight: "bold",
  //             overflow: "hidden",
  //           },
  //         ]}
  //         numberOfLines={1}
  //         ellipsizeMode="tail"
  //       >
  //         {displayedTeam1Name}
  //       </Text>

  //       <Text
  //         style={[
  //           styles.stickyText,
  //           { marginHorizontal: 4, fontWeight: "bold" },
  //         ]}
  //       >
  //         {team1Score.toString().padStart(2, "0")} :{" "}
  //         {team2Score.toString().padStart(2, "0")}
  //       </Text>

  //       <Text
  //         style={[
  //           styles.stickyText,
  //           {
  //             width: nameWidth,
  //             textAlign: "center",
  //             fontWeight: "bold",
  //             overflow: "hidden",
  //           },
  //         ]}
  //         numberOfLines={1}
  //         ellipsizeMode="tail"
  //       >
  //         {displayedTeam2Name}
  //       </Text>
  //     </View>
  //   </View>
  // );

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
  const isFoul =
    (teamNum === 1 && team1FoulChecked) ||
    (teamNum === 2 && team2FoulChecked);

  if (!isFoul && !dropdownValue) {
    setShowDropdownWarning(true);
    return;
  }

  setShowDropdownWarning(false);
  setScore((prev) => prev + pts);

  // ❌ Removed automatic OUT logic — all outs must be manual now
  // if (!isFoul && dropdownValue) {
  //   const outTeam =
  //     teamNum === 1
  //       ? team1RaidRunning
  //         ? 2
  //         : 1
  //       : team2RaidRunning
  //       ? 1
  //       : 2;

  //   const players = outTeam === 1 ? team1Players : team2Players;
  //   const outIndex = players.findIndex((p) => p.name === dropdownValue);

  //   if (outIndex !== -1) {
  //     handleOut(outTeam, outIndex);
  //   }
  // }

  const actionStack = teamNum === 1 ? team1RaidActions : team2RaidActions;
  const setActionStack =
    teamNum === 1 ? setTeam1RaidActions : setTeam2RaidActions;
  setActionStack((prev) => [...prev, { type: "score", value: pts }]);

  const isRaiding =
    (teamNum === 1 && team1RaidRunning) ||
    (teamNum === 2 && team2RaidRunning);

  if (isRaiding) {
    if (teamNum === 1) {
      setTeam1EmptyRaidCount(0);
      setTeam1PendingEmpty(false);
    } else {
      setTeam2EmptyRaidCount(0);
      setTeam2PendingEmpty(false);
    }
  }

  if (teamNum === 1) {
    if (isFoul) {
      setTeam1FoulChecked(false);
    } else if (team1RaidRunning && dropdownValue) {
      setTeam1RaidPoints((prev) => prev + pts);
      setTeam1PlayerStats((prev) => ({
        ...prev,
        [dropdownValue]: {
          ...prev[dropdownValue],
          raidPoints: (prev[dropdownValue]?.raidPoints || 0) + pts,
        },
      }));
    } else if (!team1RaidRunning && dropdownValue) {
      setTeam1TacklePoints((prev) => prev + pts);
      setTeam1PlayerStats((prev) => ({
        ...prev,
        [dropdownValue]: {
          ...prev[dropdownValue],
          defensePoints: (prev[dropdownValue]?.defensePoints || 0) + pts,
        },
      }));
    }
  } else if (teamNum === 2) {
    if (isFoul) {
      setTeam2FoulChecked(false);
    } else if (team2RaidRunning && dropdownValue) {
      setTeam2RaidPoints((prev) => prev + pts);
      setTeam2PlayerStats((prev) => ({
        ...prev,
        [dropdownValue]: {
          ...prev[dropdownValue],
          raidPoints: (prev[dropdownValue]?.raidPoints || 0) + pts,
        },
      }));
    } else if (!team2RaidRunning && dropdownValue) {
      setTeam2TacklePoints((prev) => prev + pts);
      setTeam2PlayerStats((prev) => ({
        ...prev,
        [dropdownValue]: {
          ...prev[dropdownValue],
          defensePoints: (prev[dropdownValue]?.defensePoints || 0) + pts,
        },
      }));
    }
  }
};


    const isDefending =
      (teamNum === 1 && team2RaidRunning) ||
      (teamNum === 2 && team1RaidRunning);

    const handleTackle = () => {
      const defendersIn = players.filter((p) => !p.out).length;
      const points = defendersIn <= 3 && isSuperTackleAllowed ? 2 : 1;

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

        if (team === 1) {
          setTeam2Score((s) => s + 2);
          setTeam2Allouts((prev) => prev + 2);
        } else {
          setTeam1Score((s) => s + 2);
          setTeam1Allouts((prev) => prev + 2);
        }
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
          <Text
            style={[
              styles.teamTitle,
              { width: nameBlockWidth, textAlign: "left" },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {truncateName(teamName)}
          </Text>

          {renderDots(players)}
          <Text style={styles.timerText}>{raidTimer}s</Text>
          <TouchableOpacity
            onPress={() => {
              const newState = !raidRunning;

              // 🟢 Only clear raid actions when NEW raid is starting
              if (newState) {
                const isTeam1 = teamNum === 1;
                if (newState) {
                  if (teamNum === 1 && team1EmptyRaidCount === 2) {
                    setDoOrDieTeam(1);
                    setTeam1EmptyRaidCount(0);
                  } else if (teamNum === 2 && team2EmptyRaidCount === 2) {
                    setDoOrDieTeam(2);
                    setTeam2EmptyRaidCount(0);
                  } else {
                    setDoOrDieTeam(null);
                  }
                }

                // 🟠 Confirm if previous raid was empty and update count
                if (isTeam1 && team2PendingEmpty) {
                  setTeam2EmptyRaidCount((prev) => {
                    if (prev === 2) {
                      const idx = team2Players.findIndex(
                        (p) => p.name === team2DropdownValue
                      );
                      if (idx !== -1) {
                        const updated = [...team2Players];
                        updated[idx].out = true;
                        setTeam2Players(updated);
                      }
                      return 0;
                    }
                    return prev + 1;
                  });
                  setTeam2PendingEmpty(false);
                }

                if (!isTeam1 && team1PendingEmpty) {
                  setTeam1EmptyRaidCount((prev) => {
                    if (prev === 2) {
                      const idx = team1Players.findIndex(
                        (p) => p.name === team1DropdownValue
                      );
                      if (idx !== -1) {
                        const updated = [...team1Players];
                        updated[idx].out = true;
                        setTeam1Players(updated);
                      }
                      return 0;
                    }
                    return prev + 1;
                  });
                  setTeam1PendingEmpty(false);
                }

                const setActions = isTeam1
                  ? setTeam1RaidActions
                  : setTeam2RaidActions;
                setActions([]);
              }

              setRaidRunning(newState);

              // Reset dropdown selection when raid ends
              if (!newState) {
                const actions =
                  teamNum === 1 ? team1RaidActions : team2RaidActions;
                const raiderName =
                  teamNum === 1 ? team1DropdownValue : team2DropdownValue;

                // 🟢 Update player stats from actions
                actions.forEach((action) => {
                  const { type, player, points, out } = action;

                  if (type === "raid" && raiderName) {
                    updatePlayerStats(
                      `team${teamNum}`,
                      raiderName,
                      "raid",
                      points
                    );
                  }

                  if (type === "defense") {
                    const defenderTeamNum = teamNum === 1 ? 2 : 1;
                    updatePlayerStats(
                      `team${defenderTeamNum}`,
                      player,
                      "defense",
                      points
                    );
                  }

                  if (out) {
                    const outTeam = (
                      type === "defense"
                        ? `team${teamNum}`
                        : `team${teamNum === 1 ? 2 : 1}`
                    ) as "team1" | "team2";
                    setPlayerOutStatus(outTeam, player, true);
                  }
                });

                // 🟠 Handle Do-Or-Die and empty raid fallback
                if (raiderName && actions.length === 0) {
                  if (doOrDieTeam === teamNum) {
                    if (teamNum === 1) {
                      setTeam1EmptyRaidCount(0);
                      setDoOrDieTeam(null);
                    } else {
                      setTeam2EmptyRaidCount(0);
                      setDoOrDieTeam(null);
                    }
                  } else {
                    if (teamNum === 1) setTeam1PendingEmpty(true);
                    else setTeam2PendingEmpty(true);
                  }
                }

                // 🔻 Reset dropdown selections
                setTeam1DropdownValue(null);
                setTeam2DropdownValue(null);

                // ✅ Stop main timer now if it hit 00:00 during raid
                if (mainTimeOverWhileRaid) {
                  setMatchRunning(false);
                  setMainTimeOverWhileRaid(false);
                }
              }
            }}
            disabled={
              // 🔒 Disable if the other team is raiding
              (teamNum === 1 && team2RaidRunning) ||
              (teamNum === 2 && team1RaidRunning)
            }
            style={[
              styles.btn,
              ((teamNum === 1 && team2RaidRunning) ||
                (teamNum === 2 && team1RaidRunning)) && {
                backgroundColor: "gray",
                opacity: 0.6,
              },
            ]}
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
                    <Text
                      style={{ flex: 1 }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {truncateName(p.name)}
                    </Text>
                    <TouchableOpacity onPress={() => handleOut(teamNum, idx)}>
                      <Text style={styles.outBtn}>Out</Text>
                    </TouchableOpacity>
                  </View>
                )
            )}
          </View>

          <View style={[styles.card, { flex: 3, marginLeft: 6 }]}>
            <View style={{ zIndex: 2000 }}>
              <DropDownPicker
                open={dropdownOpen}
                value={dropdownValue}
                items={dropdownItems}
                setOpen={setDropdownOpen}
                setValue={(val) => {
                  setDropdownValue(val);
                  setShowDropdownWarning(false);
                }}
                setItems={setDropdownItems}
                placeholder={
                  raidRunning
                    ? showDropdownWarning && !dropdownValue
                      ? "! Select Raider"
                      : "Select Raider"
                    : showDropdownWarning && !dropdownValue
                    ? "! Select Defender"
                    : "Select Defender"
                }
                placeholderStyle={{
                  color: showDropdownWarning && !dropdownValue ? "red" : "#000",
                  fontWeight:
                    showDropdownWarning && !dropdownValue ? "bold" : "normal",
                }}
                containerStyle={{ marginBottom: 10 }}
                style={{
                  borderColor:
                    showDropdownWarning && !dropdownValue ? "red" : "#ccc",
                  borderWidth: 1,
                  opacity: disableDropdowns ? 0.5 : 1,
                  paddingVertical: 4,
                  minHeight: 36,
                }}
                dropDownContainerStyle={{
                  maxHeight: 210,
                  opacity: disableDropdowns ? 0.5 : 1,
                  borderColor: "#ccc",
                }}
                listItemContainerStyle={{
                  height: 25,
                  justifyContent: "center",
                }}
                textStyle={{
                  fontSize: 13,
                }}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                zIndex={2000}
                zIndexInverse={1000}
                disabled={disableDropdowns}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (teamNum === 1) {
                    setTeam1Score((prev) => prev + 1);
                    setTeam1FoulChecked(false);
                    setTeam1RaidActions((prev) => [
                      ...prev,
                      { type: "score", value: 1 },
                    ]);
                  } else {
                    setTeam2Score((prev) => prev + 1);
                    setTeam2FoulChecked(false);
                    setTeam2RaidActions((prev) => [
                      ...prev,
                      { type: "score", value: 1 },
                    ]);
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#ddd",
                  padding: 3,
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

              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 20,
                  alignItems: "center",
                }}
              >
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

                {/* ✅ Show 'Do-Or-Die Raid' text during raid */}
                {doOrDieTeam === teamNum && raidRunning && (
                  <View style={styles.doOrDieContainer}>
                    <Text style={styles.doOrDieText}>Do-Or-Die</Text>
                  </View>
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
                        !isBonusAllowed ||
                        opponentPlayers.filter((p) => !p.out).length < 6 ||
                        isDefending
                      }
                      style={[
                        styles.scoreBtn,
                        {
                          backgroundColor:
                            !isBonusAllowed ||
                            opponentPlayers.filter((p) => !p.out).length < 6 ||
                            isDefending
                              ? "gray"
                              : "#FF9800",
                        },
                      ]}
                    >
                      <Text style={styles.scoreBtnText}>Bonus</Text>
                    </TouchableOpacity>
                  );
                }

                // Circular style for 1–7 buttons
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => handleScore(parseInt(label))}
                    style={styles.circleBtn}
                  >
                    <Text style={styles.circleBtnText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Show tackle button only if defending */}
              <TouchableOpacity
                onPress={handleTackle}
                disabled={!isThisTeamDefending || raidRunning}
                style={[
                  styles.scoreBtn,
                  (!isThisTeamDefending || raidRunning) && {
                    backgroundColor: "gray",
                    opacity: 0.6,
                  },
                ]}
              >
                <Text style={styles.scoreBtnText}>
                  {defendersIn <= 3 && isSuperTackleAllowed
                    ? "Sup/Tac"
                    : "Tackle"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleUndo} style={styles.scoreBtn}>
                <Text style={styles.scoreBtnText}>Undo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderDots = (players: PlayerStatus[]) => {
    const totalOut = players.filter((p) => p.out).length;
    const totalPlayers = players.length;

    return (
      <View style={{ flexDirection: "row", marginVertical: 4 }}>
        {Array.from({ length: totalPlayers }).map((_, idx) => (
          <FontAwesome
            key={idx}
            name="circle"
            size={14}
            color={idx < totalOut ? "red" : "green"}
            style={{ marginRight: 4 }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        {/* Back Arrow and Warning Text */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleDoubleBack}
            style={[styles.iconContainer, backPressCount === 1 && {}]}
          >
            <FontAwesome name="arrow-circle-left" size={30} color="#fff" />
          </TouchableOpacity>

          {showBackWarning && (
            <Text style={styles.backWarningText}>Press again</Text>
          )}
        </View>

        {/* Title and Score */}
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>
            {truncateName(team1Name)} <Text style={styles.vstext}>v/s</Text>{" "}
            {truncateName(team2Name)}
          </Text>

          <Text style={styles.headerScore}>
            {team1Score} : {team2Score}
          </Text>
        </View>

        {/* Scoreboard Icon */}
        <TouchableOpacity
          onPress={generateMatchSummary}
          style={styles.iconContainer}
        >
          <FontAwesome name="file-text" size={30} color="yellow" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View style={[styles.card, { flex: 1, marginRight: 5 }]}>
            {/* Toss and Choice Row */}
            <View style={{ marginBottom: 6 }}>
              <Text
                style={styles.tossRow}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                <Text style={styles.tossLabel}>Toss: </Text>
                <Text style={styles.tossTeamName}>
                  {selectedTossWinner === "team1" ? team1Name : team2Name}
                </Text>
              </Text>

              <Text style={styles.tossRow}>Choose: {choice}</Text>
            </View>

            {/* Team Names Row */}
            <View style={styles.teamNamesRow}>
              <Text
                style={[
                  styles.teamNameText,
                  { width: nameWidth, textAlign: "center" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayedTeam1Name}
              </Text>

              <Text
                style={[
                  styles.vsText,
                  { fontWeight: "bold", marginHorizontal: 4 },
                ]}
              >
                v/s
              </Text>

              <Text
                style={[
                  styles.teamNameText,
                  { width: nameWidth, textAlign: "center" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayedTeam2Name}
              </Text>
            </View>

            {/* Score Row */}
            <Text style={styles.scoreRow}>
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
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      marginBottom: 6,
                    }}
                  >
                    {formatTime(matchTimer)}
                  </Text>
                  <TouchableOpacity
                    // style={[styles.controlBtn, ]}
                    onPress={() => setMatchRunning((prev) => !prev)}
                    disabled={gamePhase === "halftime"}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        // Set gamePhase to "first" only when starting the match for the first time
                        if (!matchRunning && gamePhase === "not_started") {
                          setGamePhase("first");
                        }
                        setMatchRunning(!matchRunning);
                      }}
                      style={styles.controlBtn}
                    >
                      <Text style={styles.controlBtnText}>
                        {matchRunning ? "Pause" : "Start"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>

                {gamePhase === "first" && (
                  <TouchableOpacity
                    style={[
                      styles.controlBtn,
                      { backgroundColor: matchTimer > 0 ? "#ccc" : "#4CAF50" }, // grey when disabled, green when enabled
                    ]}
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
                    style={[
                      styles.controlBtn,
                      { backgroundColor: matchTimer > 0 ? "#ccc" : "#4CAF50" },
                    ]}
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
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "red",
                    marginBottom: 6,
                  }}
                >
                  Match Over!
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}
                >
                  {team1Score > team2Score
                    ? `Winner: ${team1Name}`
                    : team2Score > team1Score
                    ? `Winner: ${team2Name}`
                    : "Match Tied"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={{ opacity: matchRunning ? 1 : 0.4 }}
          pointerEvents={matchRunning ? "auto" : "none"}
        >
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 30, // Ensure bottom spacing for scroll
  },
  card: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 6,
  },

  controlBtn: {
    backgroundColor: "#1e6cf1b9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: "center",
  },
  controlBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  teamSection: {
    marginBottom: 10,
    padding: 1,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    backgroundColor: "#c5e9afff",
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 8,
    borderColor: "#2e06b3ff",
    borderWidth: 2,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e06b3ff",
  },
  timerText: {
    fontSize: 14,
    color: "#e80b0bff",
    fontWeight: "bold",
    backgroundColor: "#9dbcbbff",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
  },
  btn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 5,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardRow: {
    flexDirection: "row",
  },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    backgroundColor: "#f0f0f0",
  },
  outBtn: {
    color: "red",
    fontWeight: "bold",
    fontSize: 12,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  scoreBtnGroup: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  scoreBtn: {
    backgroundColor: "#FF9800",
    paddingVertical: 6,
    paddingHorizontal: 8,
    margin: 3,
    alignItems: "center",
    borderRadius: 5,
  },
  scoreBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
  },
  circleBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  tossRow: {
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
    textAlign: "left",
    marginBottom: 4,
  },
  tossLabel: {
    color: "#555", // slightly dim for label
    fontWeight: "500",
  },

  tossTeamName: {
    color: "#555", // darker for name
    fontWeight: "500",
    flexShrink: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e06b3ff",
  },
  teamNamesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    flexWrap: "nowrap",
    overflow: "hidden",
  },

  teamNameText: {
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
    maxWidth: "40%",
    color: "#2e06b3ff",

    // optional: prevent taking too much space
  },

  vsText: {
    fontSize: 14,
    color: "red",
    marginHorizontal: 4,
    fontWeight: "bold",
  },
  vstext: {
    fontSize: 18,
    color: "yellow",
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  scoreRow: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 2,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#c5e9afff",
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 2,
    borderColor: "#2e06b3ff",
    alignItems: "center",
    zIndex: 10,
    height: 60,
    justifyContent: "center",
  },
  stickyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e06b3ff",
  },
  doOrDieContainer: {
    backgroundColor: "#fdecea",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "flex-start",

    marginBottom: 6,
    marginTop: 4,
  },
  doOrDieText: {
    color: "#d32f2f",
    fontWeight: "bold",
    fontSize: 12,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end", // aligns all items to the bottom
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#2e06b3ff",
    height: 100, // fixed height for the header
  },

  titleContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end", // aligns title to the bottom
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  headerScore: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "bold",
    fontFamily: "monospace", // optional: for a fixed-width font
  },

  iconContainer: {
    padding: 4,
    // backgroundColor: '#444',
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 4,
  },

  backWarningText: {
    fontSize: 10,
    color: "white",
  },
});
