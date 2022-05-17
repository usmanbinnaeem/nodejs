const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const package = require("./package.json");

const port = process.env.port || process.env.PORT || 5000;
const app = express();
const apiRoot = "/api";

// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: /http:\/\/localhost/ }));
app.options("*", cors());

// our sample database

const db = {
  Usman: {
    user: "Usman",
    currency: "USD",
    balance: 100,
    description: "A sample Account",
    transactions: [],
  },
};

// configure router
const router = express.Router();
router.get("/", (req, res) => {
  res.send(`${package.name} - v${package.version}`);
});

router.get("/accounts/:user", (req, res) => {
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    return res.status(400).json({ error: "User does not exist" });
  }
  return res.json(account);
});

router.post("/accounts", (req, res) => {
  const body = req.body;
  // validate required values
  if (!body.user || !body.currency) {
    return res.status(400).json({ error: "User and Currency are required" });
  }

  // Ensure that Account doesn't exist
  if (db[body.user]) {
    return res.status(400).json({ error: "Account Already exist" });
  }

  // balance
  let balance = body.balance;
  if (balance && typeof balance !== "number") {
    balance = parseFloat(balance);
    if (isNaN(balance)) {
      return res.status(400).json({ error: "balance must be a number" });
    }
  }

  // now we create the account
  const account = {
    user: body.user,
    currency: body.currency,
    description: body.description || `${body.user}'s account`,
    balance: balance || 0,
    transactions: [],
  };
  db[account.user] = account;

  // return the account
  return res.status(201).json(account);
});

router.put("/accounts/:user", (req, res) => {
  const body = req.body;
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    return res.status(400).json({ error: "User does not exist" });
  }

  //  validate only certains ites editable
  if (body.user || body.balance || body.transactions) {
    return res
      .status(400)
      .json({ error: "Can only update currency and description" });
  }

  if (body.currency) {
    account.currency = body.currency;
  }
  if (body.description) {
    account.description = body.description;
  }

  return res.status(201).json(account);
});

router.delete("/accounts/:user", (req, res) => {
  const user = req.params.user;
  const account = db[user];
  if (!account) {
    return res.status(400).json({ error: "User does not exist" });
  }
  delete db[user];
  return res.status(203);
});

// register all our routes
app.use(apiRoot, router);

app.listen(port, () => {
  console.log("Serer Up");
});
