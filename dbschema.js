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
        website: "http://website.com" // string
      } // object, contains info that will be visible to the public and other users (if we go with that)
    }
  ],
  strategies: [
    {
      userId: "username", // string, document ID of the author
      name: "Super strategy", // string
      type: "Price action", // string
      value: 10000, // number
      currency: "usd | btc" // string
    }
  ],
  trades: [
    {
      id: "hasjdahsjdhaasdasd", // string
      createdAt: "2019-03-1T10:59:52.789Z", // string - new Date().toISOString()
      updatedAt: "2019-03-1T10:59:52.789Z", // string - new Date().toISOString()
      ticker: "BTCUSD", // string - pick from tickers
      entries: {}, // object
      targets: {}, // object
      stop: {}, // object
      rr: 2.5, // number
      capitalPercentage: 1 // number
    }
  ],
  tickers: [
    {
      id: "ahsjhajshajsha", // string
      name: "BTCUSD" // string
    }
  ]
};
