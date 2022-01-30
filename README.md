# Zebrango-protocl


WHAT IS ZEBRANGO?

1. collection of decentralized casino games, where people can play, earn money in a fast, fair, anonymous way.
2. is a space for developers, creative people to show thier extraordinary talent,
by sharing thier games which will be added to the Echosystem after a fair Voting

# contracts

* [**Zebrango-Gov.**](https://testnet.snowtrace.io/address/0x4257D70Da346Db204AEA3B6Be22D9c5967c5D333#code)  
Zebrango Core contract handles the Events on Zebrango, here are the most important functions:  


**submit proposals to the current Event :**   


```bash
    function addProp (uint256 _eventId) external  payable whenNotPaused
```


**voting on submitted proposal:**

```bash
    function voteOnProposal (uint256 _eventId, uint256 _propId) external payable whenNotPaused //eventID = currentEvent
```

**adding game to the platform:**

```bash
      function addGame(address _game)external  onlyAdmin whenNotPaused
```




**executeEvent this function can only be called from the operator address:**  
this function Ends the current event, starts the next one.


```bash
    function executeEvent()external onlyOperator whenNotPaused
```




internal functions :  

**start the next Eventand lock the current one:**  
this functions triggers when the operator execute the ***executeEvent()*** function.


```bash
    function _safeLockEvent(uint256 _eventID) internal // eventID = currentround
    function _safeStartEvent(uint256 _eventID)internal // eventID = currentround + 1
```

**withdrawing the fees collected from all the games collection:**  
this function triggers by the  ***_safeStartEvent(uint256 _eventID)***  function. and it will collect
the accumulated fees in each game on the plattform

```bash
    function _withdrowGames(uint256 _eventID) internal
```

**set the winners for the current Event:**  
this function triggers by the ***_safeLockEvent(uint256 _eventID)*** function . and it will set the winners for the current Event


```bash
    function _setWinners() internal
```

* [**ZebrangoPriceGuess**](https://testnet.snowtrace.io/address/0x1c234a147786b14d67a9b3f7a7801dae752a0fc2#code)

this game was inspired by the pancakeswap price prediction game [Pancakeswap Price Predicton](https://pancakeswap.finance/prediction)

Price prediction game where users can Bet on the price of Avax/Usd for the next 5 minutes, this game is added to the protocol as The first game to help the First event get funds
## installation
To run Zebrango, pull the repository from GitHub and install its dependencies. You will need npm installed.

```bash
git clone https://github.com/Zebrango/Zebrango-protocol.git && cd Zebrango-protocol
npm install
```

## Testing
to run the tests run :

```bash
truffle test
```




## License
[MIT](https://choosealicense.com/licenses/mit/)
