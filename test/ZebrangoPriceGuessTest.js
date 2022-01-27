const AggregatorV3Mock = artifacts.require("AggregatorV3Mock");
const ZebrangoPriceGuess = artifacts.require("ZebrangoPriceGuess");
const Zebrango = artifacts.require("Zebrango");
const timeMachine = require('ganache-time-traveler');

contract('VooDooPrice', (accounts)=>{
  let gov,voodooPrice,aggregator;
  const intervalSeconds = 300;
  const bufferSeconds = 50;
  const minBet = 1000;
  const oracleUpdateAllowance = 30;
  const fee = 1000;
  let closeprice,lockprice
  let claimRecipt;
  before(async()=>{
    aggregator = await AggregatorV3Mock.new();
    zebrango = await Zebrango.new(intervalSeconds, bufferSeconds, accounts[0], accounts[0], fee);
    zebrangoPriceGuess = await ZebrangoPriceGuess.new(aggregator.address, accounts[0], accounts[0], zebrango.address, intervalSeconds, bufferSeconds, minBet, oracleUpdateAllowance, fee);
    })
  describe('VooDooPrice deployment',  async () => {
      it('should check if the VooDooPrice contract is deployed.', async ()=>{
          assert(zebrangoPriceGuess.address != '');

        })
        it('should check for the initial state.', async ()=>{
            const _intervalSeconds = await zebrangoPriceGuess.intervalSeconds();
            const _bufferSeconds = await zebrangoPriceGuess.bufferSeconds();
            const _fee = await zebrangoPriceGuess.fee();
            const _minBet = await zebrangoPriceGuess.minBet();
            const _oracleUpdateAllowance = await zebrangoPriceGuess.oracleUpdateAllowance();
            const _admin = await zebrangoPriceGuess.admin();
            const _operator = await zebrangoPriceGuess.operator();
            const _zebrangoAddress = await zebrangoPriceGuess.govAddress();
            const _reserve = await zebrangoPriceGuess.reserve();
            const _currentRound = await zebrangoPriceGuess.currentRound();
            const _oracleLatestRoundId = await zebrangoPriceGuess.oracleLatestRoundId();
            const _oracle = await zebrangoPriceGuess.oracle();
            const _genesisStarted = await zebrangoPriceGuess.genesisStarted();
            const _genesisLocked = await zebrangoPriceGuess.genesisLocked();
            const round = await zebrangoPriceGuess.rounds(1);

            assert.equal(_intervalSeconds, intervalSeconds);
            assert.equal(_bufferSeconds, bufferSeconds);
            assert.equal(_fee, fee);
            assert.equal(_minBet, minBet);
            assert.equal(_oracleUpdateAllowance, oracleUpdateAllowance);
            assert.equal(_admin, accounts[0]);
            assert.equal(_operator, accounts[0]);
            assert.equal(_zebrangoAddress, zebrango.address);
            assert.equal(_reserve, 0);
            assert.equal(_currentRound, 0);
            assert.equal(_oracleLatestRoundId, 0);
            assert.equal(_oracle, aggregator.address);
            assert.equal(_genesisStarted, false);
            assert.equal(_genesisLocked, false);


          })
        })

        describe('genesisStartRound()', async () => {
          let starttimestamp,closeTimeStamp;
            before(async ()=>{
              let recipt = await zebrangoPriceGuess.genesisStartRound({from:accounts[0]});
               starttimestamp = await web3.eth.getBlock(recipt['receipt']['blockNumber'])
               closeTimeStamp = (starttimestamp.timestamp ) + (2 * intervalSeconds)
            })
            it('should check for the state after starting genesisRound.', async ()=>{
              const _genesisStarted = await zebrangoPriceGuess.genesisStarted();
              const _round = await zebrangoPriceGuess.rounds.call(1);

              assert.equal(_genesisStarted, true);
              assert.equal(_round.startTimestamp, starttimestamp.timestamp)
              assert.equal(_round.closeTimestamp, closeTimeStamp)
              assert.equal(_round.episode, 1)
              assert.equal(_round.totalAmount, 0)
            })
          })
        describe('betUp()', async () => {

            before(async ()=>{

              await zebrangoPriceGuess.betUp(1, {from:accounts[0] ,value:web3.utils.toWei('1', 'ether')})

              })
              it('should check for the state after betting up.', async ()=>{

                const _round = await zebrangoPriceGuess.rounds.call(1);
                const betInfo = await zebrangoPriceGuess.docs.call(1, accounts[0]);


                assert.equal(_round.totalAmount, web3.utils.toWei('1', 'ether'))
                assert.equal(_round.upAmount, web3.utils.toWei('1', 'ether'))
                assert.equal(betInfo.stand, 0)
                assert.equal(betInfo.amount, web3.utils.toWei('1', 'ether'))


              })
            })
          describe('betDown()', async () => {

              before(async ()=>{

                await zebrangoPriceGuess.betDown(1, {from:accounts[1] ,value:web3.utils.toWei('1', 'ether')})

              })
              it('should check for the state after betting down.', async ()=>{
                const _round = await zebrangoPriceGuess.rounds.call(1);
                const betInfo = await zebrangoPriceGuess.docs.call(1, accounts[1]);


                assert.equal(_round.totalAmount, web3.utils.toWei('2', 'ether'))
                assert.equal(_round.downAmount, web3.utils.toWei('1', 'ether'))
                assert.equal(betInfo.stand, 1)
                assert.equal(betInfo.amount, web3.utils.toWei('1', 'ether'))

                })
              })

          describe('genesisLockRound()', async () => {
            before(async()=>{
              await timeMachine.advanceTime(intervalSeconds );
            })
            before(async ()=>{

              await zebrangoPriceGuess.genesisLockRound({from:accounts[0]})

            })
              it('should check for the state after locking the genesis round.', async ()=>{
                const currentRound = await zebrangoPriceGuess.currentRound.call();
                const genesisLocked = await zebrangoPriceGuess.genesisLocked.call();
                const _round = await zebrangoPriceGuess.rounds.call(1);
                const _round1 = await zebrangoPriceGuess.rounds.call(2);

                assert.equal(currentRound, 2)
                assert(genesisLocked)

                assert(_round.lockOracleId > 0 )
                assert(_round.totalAmount > 0)
                assert(_round.lockprice > 0)

                assert(_round1.startTimestamp > 0)
                assert(_round1.closeTimestamp > 0)
                assert(_round1.lockTimestamp > 0)
                assert.equal(_round1.episode , 2)

              })
            })
          describe('executeRound()', async () => {
            before(async()=>{
              await timeMachine.advanceTime(intervalSeconds);
            })
            before(async ()=>{

              await zebrangoPriceGuess.executeRound({from:accounts[0]})

            })
              it('should check for the state after locking the genesis round.', async ()=>{
                const currentRound = await zebrangoPriceGuess.currentRound.call();

                const oracleLatestRoundId = await zebrangoPriceGuess.oracleLatestRoundId.call();
                const reserve = await zebrangoPriceGuess.reserve.call();

                const _round = await zebrangoPriceGuess.rounds.call(1);
                const _round1 = await zebrangoPriceGuess.rounds.call(2);
                const _round2 = await zebrangoPriceGuess.rounds.call(3);


                assert.equal(currentRound, 3)
                assert(reserve > 0)


                assert(_round.closeprice > 0 )
                assert(_round.closeOracleID > 0)
                assert(_round.oracleCalled)
                assert(BigInt(_round.rewardBaseCalAmount) > 0)
                assert(_round.rewardAmount> 0)



                assert(_round1.lockprice > 0)
                assert(_round1.lockOracleId > 0)
                assert(_round1.closeTimestamp > 0)


                assert(_round2.startTimestamp > 0)
                assert(_round2.lockTimestamp > 0)
                assert(_round2.closeTimestamp > 0)
                assert.equal(_round2.episode, 3)


                })
              })

          describe('claim()', async () => {

            before(async ()=>{
              const round = await zebrangoPriceGuess.rounds.call(1);
              lockprice =  round.lockprice.toString();
              closeprice =  round.closeprice.toString();
              console.log(lockprice)
              console.log(closeprice)

              })
            before(async()=>{

              //Up wins
              if(Number(closeprice)>Number(lockprice))
              {
                console.log("Upwins")
                let recipt = await zebrangoPriceGuess.claim([1],{from:accounts[0]})

              }
              //Down wins
              else{
                console.log("Downwins")
                let recipt = await zebrangoPriceGuess.claim([1],{from:accounts[1]})


              }
            })

            it('should check for the state after claiming.', async ()=>{
              if(Number(closeprice)>Number(lockprice))
              {

              }
              //Down wins
              else{


              }

            })

            })
          })
