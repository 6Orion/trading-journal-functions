let db = {
  users: [
    {
      userId: "username", // string, document ID of the user (copied from the document reference)
      email: "user@email.com", // string
      username: "username", // string, username that is == to the userId (it's the reference call)
      createdAt: "2019-03-1T10:59:52.789Z", // string - new Date().toISOString()
      imageUrl: "image/31231273127318932.jpg", // string, profile picture that user uploaded
      publicInfo: {
        bio: "Hello! I am super nice person and I study CompSci!", // string
        website: "http://website.com", // string
      }, // object, contains info that will be visible to the public and other users (if we go with that)
    },
  ],
  portfolio: [
    {
      name: "Super strategy", // string
      description: "Price action", // string
      capital: 10000, // number
      currency: "usd | btc", // string
      tradeCount: 100, // number
      wonCount: 213, // number
      lostCount: 213, // number
      victoryPercentage: 0.55, // number (method)
    },
  ],
  trades: [
    // Sve treba imati dualnu varijantu: planned i executed
    {
      tradeId: "hasjdahsjdhaasdasd", // string
      portfolioId, // String
      createdAt: "2019-03-1T10:59:52.789Z", // Date()
      openedAt, // Date()
      closedAt, // Date()
      expire, // Date()
      holdTime, // Number ili Date()
      mistakes, // Array
      netReturn, // Number
      avgEntry, // Number
      avgExit, // Number
      privacy, // Object
      returnTotal, // Number
      returnPercentage, // Number
      returnPerUnit, // Number
      risk, // Number - total cash risked
      setups, // Array
      side, // Number ??? Mozda Bool
      status, // Boolean (Open, Closed, Archived?)
      symbol: "BTCUSD", // string - pick from tickers
      entries: {}, // object
      orders: [
        {
          side, // string - long|short
          entryPrice, // number
          size, // number
          status, // string - executed/planned
          commission, // number
          fee, // number
          createdAt,
        },
      ], // array of objects
      numberOfOrders, // orders.length
      targets: {}, // object
      stops: {}, // object
      rr: 2.5, // number
      capitalPercentage: 1, // number
    },
  ],
  tickers: [
    {
      id: "ahsjhajshajsha", // string
      name: "BTCUSD", // string
    },
  ],
};
