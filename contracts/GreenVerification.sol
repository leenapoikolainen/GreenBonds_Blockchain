// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract GreenVerification {
  
    /**
     * @dev Modified for functions that can only be called by the  owner/green verifier
     */
    modifier onlyOwner {
        require(
            msg.sender == _owner,
            "Only owner can call the function"
        );
        _;
    }

    // EVENTS
    /**
     * @dev Event to be emmited when a verification result is added
    */
    event ResultAdded(uint256 recordedResult);
 
    // STATE VARIABLES

    address private _owner;
    string private _symbol;
    uint256[] private _resultArray;

    // CONSTRUCTOR
    /**
     * Takes bond symbol as constructor parameter
     */
    constructor(
        string memory symbol
    ) {
        _owner = msg.sender;
        _symbol = symbol;
    }

    // FUNCTIONS

    /**
     * @dev Function to return the owner of the contract 
     */
    function getOwner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Function to return the bond symbol 
     */
    function getBond() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Function to return the list of verification results
     */
    function getResults() public view returns (uint256[] memory) {
       return _resultArray;
    }

    /**
     * @dev Function to return a specific verification results.
            E.g. Result matching coupon 1.
            Requires that result has been recorded.
     */
    function getResult(uint256 number) public view returns (uint256) {
        require(number > 0 && number <= _resultArray.length, "no such result");
        return _resultArray[number - 1];
    }

    /**
     * @dev Function to return the number of results recorded on the verification.
     */
    function getNumberOfResults() public view returns (uint256) {
        return _resultArray.length;
    }

    /**
     * @dev Function to add new result.
            Can only be called by the owner of the contract.
     */
    function addResult(uint256 result) 
        external
        onlyOwner
    {
        
        _resultArray.push(result);
        emit ResultAdded(result);
    }   
}
