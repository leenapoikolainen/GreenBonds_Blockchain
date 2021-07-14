// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenCertificate.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract GreenCertifier {
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


    // Owner of this contract
    address private _owner;

    // Mapping of company to a green certificate
    mapping(address => GreenCertificate) private _greenCertificates;
    // Mapping of certified companies
    mapping(address => bool) private _certifiedCompanies;


    constructor() {
        _owner = msg.sender;
    }

    // Getter functions
    function getOwner() external view returns (address) {
        return _owner;
    }

    // Function to check if a company is certified
    function isCertifiedCompany(address company) public view returns (bool) {
        return _certifiedCompanies[company];
    }

    // Function to get the address of the company's certificate
    function getCompanyCertificateAddress(address company) public view returns (address) {
        require(isCertifiedCompany(company), "Given company is not certified");
        return address(_greenCertificates[company]);     
    }

    // Function to get a list of certified projects
    function getCertifiedProjects(address company) external view returns (string[] memory) {
        require(isCertifiedCompany(company), "Given company is not certified");
        return _greenCertificates[company].getProjects();
    }

    function isCeritifiedProject(address company, string memory project) external view returns (bool) {
        require(isCertifiedCompany(company), "Given company is not certified");
        GreenCertificate certificate = _greenCertificates[company];
        return certificate.isCertifiedProject(project);
    }


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

