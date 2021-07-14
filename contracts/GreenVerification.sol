// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract GreenVerification {
    // Voting options
    enum Vote {
        BELOW,
        PAR,
        ABOVE,
        UNDEFINED
    }

    /**
     * @dev Modified for functions that can only be called by the green verifier
     */
    modifier onlyGreenVerifier {
        require(
            msg.sender == _greenVerifier,
            "Only green verifier can call the function"
        );
        _;
    }

    /**
     * @dev Event to emit when investor of verifier votes
     */
    event Voted(address voter, Vote vote);

    // Members
    address private _greenVerifier;
    address private _company;
    string private _project;
    Vote private _verifierVote;
    uint256 private _votingClosingTime;
    uint256[3] private _investorVotes;
    bool private _verified;
    mapping(address => bool) private _votedInvestors;

    // Test members for resetting
    address[] _voterList;
    uint256 _voterCount;

    /**
     * Constructor, takes company address, project name and voting close time as parameters
     */
    constructor(
        address company,
        string memory project,
        uint256 votingClosingTime
    ) {
        require(block.timestamp < votingClosingTime, "Voting closing time can not be in the past");
        _greenVerifier = msg.sender;
        _company = company;
        _project = project;
        _votingClosingTime = votingClosingTime;
        _verified = false;
        _verifierVote = Vote.UNDEFINED;
    }

    // TESTING
    event Reset(string reason);

    function reset(string calldata reason) external onlyGreenVerifier {
        // Reset votes
        uint256 length = _voterCount;
        for(uint i = 0; i < length; i++) {
            _votedInvestors[_voterList[i]] = false;
            _voterList[i] = address(0);
            _voterCount--;
        }
        // Reset verifier's vote
        _verifierVote = Vote.UNDEFINED;
        emit Reset(reason);
    }

    function getVoterCount() external view returns (uint256) {
        return _voterCount;
    }

    // Getter functions
    function getGreenVerifier() external view returns (address) {
        return _greenVerifier;
    }

    function getCompany() external view returns (address) {
        return _company;
    }

    function getProject() external view returns (string memory) {
        return _project;
    }

    function isVerified() external view returns (bool) {
        return _verified;
    }

    function getVotingClosingTime() external view returns (uint256) {
        return _votingClosingTime;
    }

    function getVerifierVote() external view returns (uint256) {
        return uint256(_verifierVote);
    }

    function getInvestorVotesPerVote(uint256 vote)
        external
        view
        returns (uint256)
    {
        require(vote >= 0 && vote <= 2, "Vote must be between 0-2");
        return _investorVotes[vote];
    }

    // Only for testing purposes
    function investorHasVoted(address investor) external view returns (bool) {
        return _votedInvestors[investor];
    }

    function greenVerifierVote(uint256 verifierVote)
        external
        onlyGreenVerifier
    {
        require(
            verifierVote >= 0 && verifierVote <= 2,
            "Vote must be between 0-2"
        );
        _verifierVote = Vote(verifierVote);
        emit Voted(msg.sender, Vote(verifierVote));
    }

    function vote(uint256 investorVote) external {
        require(
            _votedInvestors[msg.sender] == false,
            "Investor can only vote once"
        );
        require(
            investorVote >= 0 && investorVote <= 2,
            "Vote must be between 0-2"
        );

        uint256 currenNumberOfVotes = _investorVotes[investorVote];
        _investorVotes[investorVote] = currenNumberOfVotes + 1;

        _votedInvestors[msg.sender] = true;
        emit Voted(msg.sender, Vote(investorVote));
        // ADDED
        if(_voterList.length >= _voterCount) {
            _voterList.push(msg.sender);
        } else {
            _voterList[_voterCount] = msg.sender;
        }
        _voterCount++;
    }

    function verify() external onlyGreenVerifier {
        uint256 totalVotes = _investorVotes[0] +
            _investorVotes[1] +
            _investorVotes[2];
        uint256 verifierVote = uint256(_verifierVote);
        if ((_investorVotes[verifierVote] * 100) / totalVotes >= 50) {
            _verified = true;
        } else {
            _verified = false;
        }
    }
}
