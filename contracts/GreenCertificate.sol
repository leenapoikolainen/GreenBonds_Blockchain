// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

contract GreenCertificate {

    /** 
    * @dev Event to be emitted when a project is added
    */
    event ProjectAdded(string name);
    /** 
    * @dev Event to be emitted when a project is removed
    */
    event ProjectRemoved(string name);

    // function modifier
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    // STATE VARIABLES
    address private _owner;
    address private _company;
    string[] private _projectList;

    // Mapping for certified projects
    mapping(string => bool) _greenProjects;

    // CONSTRUCTOR
    constructor(address company) public {
        _company = company;
        _owner = msg.sender;
    }

    // FUNCTIONS
    /**
     * @dev Function to return the owner of the certificate (Green certifier) 
     */
    function getOwner() external view returns (address) {
        return _owner;
    }

    /**
     * @dev Function to return the company that is certified on the contract
     */
    function getCompany() external view returns (address) {
        return _company;
    }

    /**
     * @dev Function to get the list of projects certified within this contract 
     */
    function getProjects() public view returns (string[] memory) {
        return _projectList;
    }

    /**
     * @dev Function to check if a project is certified
     */
    function isCertifiedProject(string calldata name) external view returns (bool) {
        return (_greenProjects[name]);
    }

    /**
     * @dev Function to add projects to the certificate.
            Can be only called by the owner.
     */
    function addProject(string calldata name) external onlyOwner {
        _greenProjects[name] = true;
        _projectList.push(name);
        emit ProjectAdded(name);
    }
}