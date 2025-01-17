export const MOCK_DATA = {
  sports: [
    { sportId: 1, name: "Football" },
    { sportId: 2, name: "Basketball" },
    { sportId: 3, name: "Tennis" },
  ],
  sportEvents: {
    1: {
      sportId: 1,
      last: 1234567890,
      league: [
        {
          id: 1,
          name: "Premier League",
          events: [
            {
              id: 101,
              parentId: 1,
              starts: "2024-01-20T20:00:00Z",
              home: "Manchester United",
              away: "Liverpool",
              rotNum: "1001",
              liveStatus: 0,
              status: "O",
              parlayRestriction: 0,
              altTeaser: true,
              resultingUnit: "goals",
              version: 1,
              sameEventParlayPeriodsEnabled: [0, 1],
              odds: {
                home: 2.5,
                draw: 3.2,
                away: 2.8,
              },
            },
            {
              id: 102,
              parentId: 1,
              starts: "2024-01-20T18:30:00Z",
              home: "Arsenal",
              away: "Chelsea",
              rotNum: "1002",
              liveStatus: 0,
              status: "O",
              parlayRestriction: 0,
              altTeaser: true,
              resultingUnit: "goals",
              version: 1,
              sameEventParlayPeriodsEnabled: [0, 1],
              odds: {
                home: 1.9,
                draw: 3.4,
                away: 3.1,
              },
            },
          ],
        },
      ],
    },
    2: {
      sportId: 2,
      last: 1234567891,
      league: [
        {
          id: 2,
          name: "NBA",
          events: [
            {
              id: 201,
              parentId: 2,
              starts: "2024-01-20T19:30:00Z",
              home: "Lakers",
              away: "Bulls",
              rotNum: "2001",
              liveStatus: 0,
              status: "O",
              parlayRestriction: 0,
              altTeaser: true,
              resultingUnit: "points",
              version: 1,
              sameEventParlayPeriodsEnabled: [0],
              odds: {
                home: 1.8,
                away: 2.1,
              },
            },
          ],
        },
      ],
    },
  },
};
