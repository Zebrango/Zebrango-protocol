const Zebrango = artifacts.require("Zebrango");
const timeMachine = require('ganache-time-traveler');


contract('Zebrango', (accounts)=>{
  let zebrango;
  const eventPeriod = 40;
  const bufferSecods = 20;
  const fee = 1000;

  before(async()=>{
    zebrango = await Zebrango.new(eventPeriod, bufferSecods, fee, accounts[0], accounts[0]);

  })
  describe('Zebrango deployment', async () => {
      it('should check if the Zebrango contract is deployed.', async ()=>{
          assert(zebrango.address != '');
        })

      it('should check for the initial state.', async ()=>{
          const _eventPeriod = await zebrango.eventPeriod();
          const _bufferSecods = await zebrango.bufferSeconds();
          const _fee = await zebrango.fee();
          const _currentEvent = await zebrango.currentEvent();
          const _genesisEventIsStarted = await zebrango.genesisEventIsStarted();


          assert.equal(_eventPeriod, eventPeriod);
          assert.equal(_bufferSecods, bufferSecods);
          assert.equal(_fee, fee);
          assert.equal(_currentEvent, 0);
          assert.equal(_genesisEventIsStarted, false);
        })
      })

      //this test will test startGenesisEvent aswell as _safeStartEvent the internal function.
    describe('startGenesisEvent()', async () => {
        before(async ()=>{
          await zebrango.startGenesisEvent({from:accounts[0]});
        })


        it('should check for the state after starting genesisEvent.', async ()=>{
          let eventi = await zebrango.events.call(1);
          const _genesisEventIsStarted = await zebrango.genesisEventIsStarted();

          assert.equal(eventi.eventId, 1);
          assert.equal(_genesisEventIsStarted, true);
        })
      })

    describe('addProp()', async () => {
        before(async ()=>{
          await zebrango.addProp(1, {from:accounts[1], value:web3.utils.toWei('2','ether')});
          await zebrango.addProp(1, {from:accounts[2], value:web3.utils.toWei('12','ether')});
          await zebrango.addProp(1, {from:accounts[3], value:web3.utils.toWei('10','ether')});

        })


        it('should check for the state after adding a prop.', async ()=>{
          let prop1 = await zebrango.getProposals(1 , 0);
          assert.equal(prop1._proposalID, 0);
          assert.equal(prop1._voteCount, 0);
          assert.equal(prop1._maker, accounts[1]);

          let prop2 = await zebrango.getProposals(1 , 1);
          assert.equal(prop2._proposalID, 1);
          assert.equal(prop2._voteCount, 0);
          assert.equal(prop2._maker, accounts[2]);

          let prop3 = await zebrango.getProposals(1 , 2);
          assert.equal(prop3._proposalID, 2);
          assert.equal(prop3._voteCount, 0);
          assert.equal(prop3._maker, accounts[3]);
          })
      })
    describe('voteOnProposal()', async () => {
        before(async ()=>{
          await zebrango.voteOnProposal(1, 0, {from:accounts[2], value:web3.utils.toWei('1','ether')});
          await zebrango.voteOnProposal(1, 0, {from:accounts[1], value:web3.utils.toWei('2','ether')});
          await zebrango.voteOnProposal(1, 1, {from:accounts[3], value:web3.utils.toWei('3','ether')});
          await zebrango.voteOnProposal(1, 2, {from:accounts[4], value:web3.utils.toWei('5','ether')});
          await zebrango.voteOnProposal(1, 2, {from:accounts[5], value:web3.utils.toWei('2','ether')});
          await zebrango.voteOnProposal(1, 2, {from:accounts[6], value:web3.utils.toWei('1','ether')});
          await zebrango.voteOnProposal(1, 2, {from:accounts[7], value:web3.utils.toWei('2','ether')});
        })
        it('should check for the state after voting.', async ()=>{
          let prop1 = await zebrango.getProposals(1 , 0);
          assert.equal(prop1._proposalID, 0);
          assert.equal(prop1._voteCount, 2);
          assert.equal(prop1._maker, accounts[1]);

          let prop2 = await zebrango.getProposals(1 , 1);
          assert.equal(prop2._proposalID, 1);
          assert.equal(prop2._voteCount, 1);
          assert.equal(prop2._maker, accounts[2]);

          let prop3 = await zebrango.getProposals(1 , 2);
          assert.equal(prop3._proposalID, 2);
          assert.equal(prop3._voteCount, 4);
          assert.equal(prop3._maker, accounts[3]);

          bal = await web3.eth.getBalance(zebrango.address);
          assert.equal(web3.utils.fromWei(bal,'ether'), 40);
          })
    })
    describe('executeEvent()', async () => {
        before(async()=>{
          bal = await web3.eth.getBalance(accounts[3]);
          await timeMachine.advanceTime(eventPeriod);
        })
        before(async ()=>{
          await zebrango.executeEvent({from:accounts[0]});
        })
        it('should check for the state after executeEvent.', async ()=>{
          bal = await web3.eth.getBalance(accounts[3]);

          await timeMachine.advanceTime(eventPeriod);
          const _currentEvent = await zebrango.currentEvent();
          let winningProps = await zebrango.getWinningProposals(1);
          let prop = await zebrango.getProposals(1, winningProps.toString());
          let eventi = await zebrango.events.call(1);
          //_prize = (web3.utils.toWei('40','ether') / 10000 ) * 7500;

          assert.equal(prop._proposalID, 2);
          assert.equal(prop._maker, accounts[3]);
          //assert.equal(eventi.prize.toString(), _prize.toString());
          assert.equal(winningProps.toString(), '2');
          assert.equal(_currentEvent, 2);

          let eventiafter = await zebrango.events.call(2);
          assert.equal(eventiafter.eventId, 2);
          })

      })
})
