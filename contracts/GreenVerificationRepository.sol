// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenVerification2.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract GreenVerificationRepository {
  

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

    /**
     * @dev Event to be emmitted when a company certificate is created
     */
    event VerificationContract(address verification);

    /**
     * @dev Event to be emmitted when a verification is added
     */
    event BondVerification(string symbol, uint256 result);

 
    // Members
    address private _owner;
    // Mapping of company to a green certificate
    mapping(string => GreenVerification2) private _greenVerifications;
    // Mapping for verifications
    mapping(string => bool) private _verifiedBonds;
    

    /**
     * Constructor, sets function deployer as owner
     */
    constructor() {
        _owner = msg.sender;
    }


    // Getter functions
    function getOwner() public view returns (address) {
        return _owner;
    }

    // Function to check if a verification exists
    function isVerifiedBond(string memory symbol) public view returns (bool) {
        return _verifiedBonds[symbol];
    }

    // Function to get the address of the company's certificate
    function getVerificationAddress(string memory symbol) public view returns (address) {
        require(isVerifiedBond(symbol), "No verification exists");
        return address(_greenVerifications[symbol]);     
    }

    // Function to get a list of verifications
    function getResults(string memory symbol) external view returns (uint256[] memory) {
        require(isVerifiedBond(symbol), "A verification does not exist for that bond");
        return _greenVerifications[symbol].getResults();
    }

    // Function to get the number of verifications
    function getNumberOfResults(string memory symbol) external view returns (uint256) {
       require(isVerifiedBond(symbol), "A verification does not exist for that bond");
       return _greenVerifications[symbol].getNumberOfResults(); 
    }

    // Function to get a specific verification
    function getResult(string memory symbol, uint256 number) external view returns (uint256) {
        require(isVerifiedBond(symbol), "A verification does not exist for that bond");
        return _greenVerifications[symbol].getResult(number);
    }

    function addVerification(string memory symbol, uint256 result) external onlyOwner {
        // Create verification for the bond if it already does not exist
        if(_verifiedBonds[symbol] == false) {
            // Create certificate
            GreenVerification2 newVerification = new GreenVerification2(symbol);
            _verifiedBonds[symbol] = true;
            _greenVerifications[symbol] = newVerification;

            // Create an event
            emit VerificationContract(address(newVerification));
        } 

        // Add result to the list
        GreenVerification2 verification = _greenVerifications[symbol];
        verification.addResult(result); 
        emit BondVerification(symbol, result);     
    }
}
