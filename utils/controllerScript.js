const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { ZebrangoPriceGuessOperator} = require("../.env.json");

const VooDooPrice = require('../build/contracts/ZebrangoPriceGuess.json');

const wallet = new HDWalletProvider(
  ZebrangoPriceGuessOperator,
  'https://api.avax-test.network/ext/bc/C/rpc'

)
let state = {
  currentRound: null,
  genesisStarted:null,
  lockTimestamp:null
}
const web3 = new Web3(wallet);
let networkID = '43113'
const contract = new web3.eth.Contract(
 VooDooPrice.abi,
 VooDooPrice.networks[networkID].address
);

async function init(){
  setInterval(updateState,10000)
  setTimeout(makeAction,12000)
  setInterval(makeAction, 40000)
}

async function makeAction(){
  let check = await checkTiming()
  if (!state.genesisStarted){
    await startGenesisRound()
    return;
  }
  if(state.genesisStarted && !state.genesisLocked && check){
    await lockgenesisRound()
    return;
  }
  if(state.genesisStarted && state.genesisLocked && check){
    await excuteRound()
  }
  return;
}
async function checkTiming(){

  let currentTime = Math.floor(new Date().getTime() / 1000)
  console.log(currentTime)
  console.log(state.lockTimestamp)

  if(currentTime > state.lockTimestamp){
    console.log(true)
    return true
  }
  console.log(false)

  return false

}
async function updateState(){
  state.currentRound = await contract.methods.currentRound().call();
  let round = await contract.methods.rounds(state.currentRound).call();
  state.lockTimestamp = round.lockTimestamp;
}

async function excuteRound(){
  console.log('excuting Round')
  try{
  let recipt = await contract.methods.executeRound().send({from:wallet.addresses[0], gas:3000000})
  await updateState();
  console.log(recipt)
}catch(error){
  console.log(error)
}
  return
}

async function startGenesisRound(){
  console.log('starting the genesis')
  let recipt = await contract.methods.genesisStartRound().send({from:wallet.addresses[0], gas:3000000})
  await updateState();
  state.genesisStarted = true;
  console.log(recipt)
  return
}

async function lockgenesisRound(){
      console.log('locking genesis Round')
      let recipt = await contract.methods.genesisLockRound().send({from:wallet.addresses[0], gas:3000000})
      console.log(recipt)
      await updateState();
      state.genesisLocked = true;
      return;
}

init();
