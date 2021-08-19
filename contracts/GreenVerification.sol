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

    event ResultAdded(uint256 recordedResult);

 
    // Members
    address private _owner;
    string private _symbol;
    uint256[] _resultArray;

    /**
     * Constructor, takes company address, project name and voting close time as parameters
     */
    constructor(
        string memory symbol
    ) {
        _owner = msg.sender;
        _symbol = symbol;
    }


    // Getter functions
    function getOwner() public view returns (address) {
        return _owner;
    }

    function getBond() public view returns (string memory) {
        return _symbol;
    }

   function getResults() public view returns (uint256[] memory) {
       return _resultArray;
    }

    function getResult(uint256 number) public view returns (uint256) {
        require(number > 0 && number <= _resultArray.length, "no such result");
        return _resultArray[number - 1];
    }

    function getNumberOfResults() public view returns (uint256) {
        return _resultArray.length;
    }

 
    function addResult(uint256 result) 
        external
        onlyOwner
    {
        
        _resultArray.push(result);
        emit ResultAdded(result);
    }
    



    
}
