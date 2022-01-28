const Web3 = require('web3');
const  { ZebrangoPriceGuessOperator} = require ("../.env.json");
const VooDooPrice = require('../build/contracts/ZebrangoPriceGuess.json');
const operatorAddress = "0xC95AC2e92a7125C57AcbFC3b29a13729e74aaaF3"
const RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
const ZebrangoPriceGuessAddress = "0x6C96a69594f24C7FAd66b66ded57a21D6EFC9c52"

let state = {
  currentRound: null,
  genesisStarted:null,
  lockTimestamp:null
}

const web3 = new Web3(RPC_URL);

let networkID = '43113' //fuji network
const contract = new web3.eth.Contract(
 VooDooPrice.abi,
 ZebrangoPriceGuessAddress
);

async function init(){
  setInterval(updateState,150000)
  //setTimeout(makeAction,12000)
  setInterval(makeAction, 25000)
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
  const tx = contract.methods.executeRound();
  const gas = await tx.estimateGas({from: operatorAddress});
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(operatorAddress);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contract.options.address,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: networkID
    },
    ZebrangoPriceGuessOperator
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  await updateState();
  console.log(receipt.transactionHash)
}catch(error){
  console.log(error)
}
  return
}

async function startGenesisRound(){
  console.log('starting the genesis')
  try{
  const tx = contract.methods.genesisStartRound();
  const gas = await tx.estimateGas({from: operatorAddress});
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(operatorAddress);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contract.options.address,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: networkID
    },
    ZebrangoPriceGuessOperator
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(receipt.transactionHash)

  state.genesisStarted = true;
}catch(error){
  console.log(error)
}
  await updateState();

  return
}

async function lockgenesisRound(){
      console.log('locking genesis Round')
      try{
      const tx = contract.methods.genesisLockRound();
      const gas = await tx.estimateGas({from: operatorAddress});
      const gasPrice = await web3.eth.getGasPrice();
      const data = tx.encodeABI();
      const nonce = await web3.eth.getTransactionCount(operatorAddress);

      const signedTx = await web3.eth.accounts.signTransaction(
        {
          to: contract.options.address,
          data,
          gas,
          gasPrice,
          nonce,
          chainId: networkID
        },
        ZebrangoPriceGuessOperator
      );
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(receipt.transactionHash)
      state.genesisLocked = true;

    }catch(error){
      console.log(error)
    }
      await updateState();
      return;
}

init();
