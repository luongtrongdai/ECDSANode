const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const keccak = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "0xf32f39d372c22849f1f98d624c91fccd09f3d93f": 100,
  "0x2869ae71c70eb29266564c553a11ecb6c20ebea1": 50,
  "0xc03441c70770690ec1b10666b34bfca9af4a3926": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, sig } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);
  const msg = amount + "_" + recipient;
  const { isSigned, senderFromMsg } = verifySig(msg, sig);
  console.log(sender);
  console.log(senderFromMsg);

  if (!isSigned || sender != senderFromMsg) {
    res.status(401).send({ message: "Invalid Signature!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}



function hashMessage(msg) {
  const bytes = utf8ToBytes(msg);
  return keccak.keccak256(bytes);
}


function verifySig(message, signature) {
  const sig = secp.secp256k1.Signature.fromCompact(signature).addRecoveryBit(0);
  const messageHash = hashMessage(message);
  const publicKey = sig.recoverPublicKey(messageHash).toRawBytes();
  const senderFromMsg = '0x' + toHex(keccak.keccak256(publicKey.slice(1)).slice(-20));
  const isSigned = secp.secp256k1.verify(sig, messageHash, publicKey);
  return { isSigned, senderFromMsg };
}