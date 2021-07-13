// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract GreenVerification {
    // Voting options
    enum Vote{BELOW, PAR, ABOVE, UNDEFINED}

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

    /**
     * Constructors, takes address
     */
    constructor(address greenVerifier, address company, string memory project, uint256 votingClosingTime) {
        _greenVerifier = greenVerifier;
        _company = company;
        _project = project;
        _votingClosingTime = votingClosingTime;
        _verified = false;
        _verifierVote = Vote.UNDEFINED;
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

    function getVerifierVote() external view returns (Vote) {
        return _verifierVote;
    }


    function getInvestorVotesPerVote(uint256 vote) external view returns (uint256) {
        require(vote >=0 && vote <=2, "Vote must be between 0-2");
        return _investorVotes[vote];
    }
    
    // Only for testing purposes
    function investorHasVoted(address investor) external view returns(bool) {
        return _votedInvestors[investor];
    }


    function greenVerifierVote(uint256 verifierVote) external {
        require(msg.sender == _greenVerifier, "Only green verifier can specify verifier vote");
        require(verifierVote >=0 && verifierVote <=2, "Vote must be between 0-2");
        _verifierVote = Vote(verifierVote); 
        emit Voted(msg.sender, Vote(verifierVote));
    }

    function vote(uint256 investorVote) external {
        require(_votedInvestors[msg.sender] == false, "Investor can only vote once");
        require(investorVote >=0 && investorVote <=2, "Vote must be between 0-2");

        uint256 currenNumberOfVotes = _investorVotes[investorVote];
        _investorVotes[investorVote] = currenNumberOfVotes + 1;

        _votedInvestors[msg.sender] = true;
        emit Voted(msg.sender, Vote(investorVote));
    }


    function verify() external {
        // Require that green verifier has voted
        require(_verifierVote != Vote.UNDEFINED, "Green verifier vote has not been defined");
        uint256 totalVotes = _investorVotes[0] + _investorVotes[1] + _investorVotes[2];
        uint256 verifierVote = uint256(_verifierVote);
        if((_investorVotes[verifierVote] * 100)/totalVotes >= 50) {
            _verified = true;
        } else {
            _verified = false;
        }
    }
}