// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenCertificate.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract GreenCertificateRepository {
    using Address for address;

    /**
     * @dev Modifier to allow function to be called only by the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    /**
     * @dev Event to be emmitted when a company certificate is created
     */
    event CompanyCertification(address certificate);

    /**
     * @dev Event to be emmitted when a project is added
     */
    event ProjectCertification(address company, string project);

    // STATE VARIABLES 

    // Owner of this contract
    address private _owner;

    // Mapping of company to a green certificate
    mapping(address => GreenCertificate) private _greenCertificates;
    
    // Mapping of certified companies
    mapping(address => bool) private _certifiedCompanies;

    // CONSTRUCTOR
    constructor() {
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
     * @dev Function to check if a company is certified
     */
    function isCertifiedCompany(address company) public view returns (bool) {
        return _certifiedCompanies[company];
    }

    /**
     * @dev Function to get the address of the company's certificate.
        Requires that a certificate for the company exists
     */
    function getCompanyCertificateAddress(address company) public view returns (address) {
        require(isCertifiedCompany(company), "Given company is not certified");
        return address(_greenCertificates[company]);     
    }

    /**
     * @dev Function to get a list of certified project for a company.
            Requires that a certificate for the company exists.
     */
    function getCertifiedProjects(address company) external view returns (string[] memory) {
        require(isCertifiedCompany(company), "Given company is not certified");
        return _greenCertificates[company].getProjects();
    }

    /**
     * @dev Function to check if a project is certified.
            Requires that a certificate for the company exists.
     */
    function isCeritifiedProject(address company, string memory project) external view returns (bool) {
        require(isCertifiedCompany(company), "Given company is not certified");
        GreenCertificate certificate = _greenCertificates[company];
        return certificate.isCertifiedProject(project);
    }

    /**
     * @dev Function to create a new certificate. 
            Can be only called by the owner of the contract.
            Creates a new certificate contract if one does not exits 
            for the company. Adds the project to the list of certified projects.
     */
    function createCertificate(address company, string memory project) external onlyOwner {
        // Create certificate for the company if it already does not exist
        if(_certifiedCompanies[company] == false) {
            // Create certificate
            GreenCertificate newCertificate = new GreenCertificate(company);
            _certifiedCompanies[company] = true;
            _greenCertificates[company] = newCertificate;

            // Create an event
            emit CompanyCertification(address(newCertificate));
        } 

        // Add project to the list
        GreenCertificate certificate = _greenCertificates[company];
        certificate.addProject(project);   
        emit ProjectCertification(company, project);      
    }
 
}

