export const MOCK_DATA = {
  sports: [
    { sportId: 1, name: "Football", key: "americanfootball_nfl" },
    { sportId: 2, name: "Basketball", key: "basketball_nba" },
    { sportId: 3, name: "Baseball", key: "baseball_mlb" },
  ],
  sportEvents: {
    1: [
      {
        id: "1",
        teams: ["New York Giants", "Dallas Cowboys"],
        startTime: new Date(Date.now() + 3600000).toISOString(),
        odds: { Giants: 2.5, Cowboys: 1.8 },
      },
    ],
    2: [
      {
        id: "2",
        teams: ["LA Lakers", "Golden State Warriors"],
        startTime: new Date(Date.now() + 7200000).toISOString(),
        odds: { Lakers: 1.9, Warriors: 2.1 },
      },
    ],
  },
};
