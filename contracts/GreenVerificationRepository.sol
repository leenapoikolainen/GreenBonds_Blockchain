// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenVerification.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract GreenVerificationRepository {
    //EVENTS

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

    // STATE VARIABLES

    address private _owner;
    // Mapping of company to a green certificate
    mapping(string => GreenVerification) private _greenVerifications;
    // Mapping for verifications
    mapping(string => bool) private _verifiedBonds;
    

    // CONSTRUCTOR
    constructor() {
        _owner = msg.sender;
    }

    // FUNCTIONS

    /**
     * @dev Function to return the owner of the repository (Green verifier) 
     */
    function getOwner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Function to check if a verification exists
     */
    function isVerifiedBond(string memory symbol) public view returns (bool) {
        return _verifiedBonds[symbol];
    }

    /**
     * @dev Function to get the address of the bond's verification
        Requires that a verification contract exists.
     */
    function getVerificationAddress(string memory symbol) public view returns (address) {
        require(isVerifiedBond(symbol), "No verification exists");
        return address(_greenVerifications[symbol]);     
    }

    /**
     * @dev Function to get a list of verifications.
        Requires that a verification contract exists.
     */
    function getResults(string memory symbol) external view returns (uint256[] memory) {
        require(isVerifiedBond(symbol), "A verification does not exist for that bond");
        return _greenVerifications[symbol].getResults();
    }

    /**
     * @dev Function to get the number of verifications.
            
     */
    function getNumberOfResults(string memory symbol) external view returns (uint256) {
       require(isVerifiedBond(symbol), "A verification does not exist for that bond");
       return _greenVerifications[symbol].getNumberOfResults(); 
    }

    /**
     * @dev Function to get a specific verification.
            Requires that a verification contract exists.
     */ 
    function getResult(string memory symbol, uint256 number) external view returns (uint256) {
        require(isVerifiedBond(symbol), "A verification does not exist for that bond");
        return _greenVerifications[symbol].getResult(number);
    }

    /**
     * @dev Function to add a new verification result.
            Can be only called by the owner.
     */
    function addVerification(string memory symbol, uint256 result) external onlyOwner {
        // Create verification for the bond if it already does not exist
        if(_verifiedBonds[symbol] == false) {
            // Create certificate
            GreenVerification newVerification = new GreenVerification(symbol);
            _verifiedBonds[symbol] = true;
            _greenVerifications[symbol] = newVerification;

            // Create an event
            emit VerificationContract(address(newVerification));
        } 

        // Add result to the list
        GreenVerification verification = _greenVerifications[symbol];
        verification.addResult(result); 
        emit BondVerification(symbol, result);     
    }
}
