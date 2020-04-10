pragma solidity >=0.4.21 <0.7.0;

//Name of the smart contract
contract Ballot {
    //variables
    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
    }
    enum Stage {
        Init,
        Reg,
        Vote,
        Done
    }
    Stage public stage = Stage.Init;
    address public chairperson;
    mapping(address => Voter) voters;
    uint256[4] proposals;
    uint256 startTime;

    event VotingCompleted();

    //modifiers
    modifier onlyOwner() {
        require(msg.sender == chairperson);
        _;
    }
    modifier onlyStage(Stage _stage) {
        //require(stage == _stage);
        _;
    }

    //constructor
    constructor() public {
        chairperson = msg.sender;
        voters[chairperson].weight = 2; // weight is 2 for testing purposes
        stage = Stage.Reg;
        startTime = now;
    }

    //functions
    function register(address _voter) public onlyOwner onlyStage(Stage.Reg) {
        require(voters[_voter].weight == 0);
        voters[_voter].weight = 1;
        if (now > startTime + 30 seconds) {
            stage = Stage.Vote;
        }
    }

    function vote(uint8 _vote) public onlyStage(Stage.Vote) {
        Voter storage _voter = voters[msg.sender];
        require(!_voter.voted && _vote < proposals.length && _voter.weight > 0); 
        _voter.voted = true;
        _voter.vote = _vote;
        proposals[_vote] += _voter.weight;
        if (now > startTime + 60 seconds) {
            stage = Stage.Done;
            emit VotingCompleted();
        }
    }

    function winningProposal() public view onlyStage(Stage.Done) returns(uint8 _win) {
        uint256 _winCount = 0;
        for(uint8 i = 0; i < proposals.length; i++) {
            if (proposals[i] > _winCount) {
                _win = i;
                _winCount = proposals[i];
            }
        }
        assert(_winCount > 0);
    }

    function getCount() public view returns (uint256[4] memory) {
        return proposals;
    }
}
