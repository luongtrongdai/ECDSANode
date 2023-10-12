import { secp256k1 }  from "ethereum-cryptography/secp256k1.js";
import { keccak256 }  from "ethereum-cryptography/keccak.js";
import { toHex, utf8ToBytes }      from "ethereum-cryptography/utils.js";


const getAddressByPrivateKey = (privateKey) => {
  const publicKey = secp256k1.getPublicKey(privateKey);
  return '0x' + toHex(keccak256(publicKey.slice(1)).slice(-20));
};

const hashMessage = (msg) => {
  const bytes = utf8ToBytes(msg);
  return keccak256(bytes);
}

const signMessage = (privateKey, msg) => {
  const hashed = hashMessage(msg);
  return secp256k1.sign(hashed, privateKey);
}


export { getAddressByPrivateKey, signMessage };