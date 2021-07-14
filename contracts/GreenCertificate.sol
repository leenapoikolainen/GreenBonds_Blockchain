// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

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

    // Member variables
    address private _owner;
    address private _company;
    string[] private _projectList;

    // Mapping for certified projects
    mapping(string => bool) _greenProjects;

    constructor(address company) {
        _company = company;
        _owner = msg.sender;
    }

    // Getter functions
    function getOwner() external view returns (address) {
        return _owner;
    }

    function getCompany() external view returns (address) {
        return _company;
    }

    function getProjects() public view returns (string[] memory) {
        return _projectList;
    }

    // Function to check if a project is certified
    function isCertifiedProject(string memory name) external view returns (bool) {
        return (_greenProjects[name]);
    }

    // Functions to add and remove certified projects
    function addProject(string memory name) external onlyOwner {
        _greenProjects[name] = true;
        _projectList.push(name);
        emit ProjectAdded(name);
    }
}