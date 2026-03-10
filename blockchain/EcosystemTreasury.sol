// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AshCoin.sol";
import "./ReentrancyGuard.sol";

/**
 * @title EcosystemTreasury
 * @dev Multi-sig treasury contract for the QSE Ecosystem.
 *      Manages ecosystem funds with governance-controlled spending.
 */
contract EcosystemTreasury is ReentrancyGuard {
    AshCoin public ashCoin;

    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public requiredApprovals;

    struct Proposal {
        address recipient;
        uint256 amount;
        string description;
        uint256 approvals;
        bool executed;
        mapping(address => bool) approved;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed id, address indexed recipient, uint256 amount, string description);
    event ProposalApproved(uint256 indexed id, address indexed signer);
    event ProposalExecuted(uint256 indexed id, address indexed recipient, uint256 amount);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event FundsDeposited(address indexed from, uint256 amount);

    modifier onlySigner() {
        require(isSigner[msg.sender], "Treasury: not a signer");
        _;
    }

    constructor(address _ashCoin, address[] memory _signers, uint256 _requiredApprovals) {
        require(_signers.length >= _requiredApprovals, "Treasury: not enough signers");
        require(_requiredApprovals > 0, "Treasury: approvals must be > 0");

        ashCoin = AshCoin(_ashCoin);
        requiredApprovals = _requiredApprovals;

        for (uint256 i = 0; i < _signers.length; i++) {
            address s = _signers[i];
            require(s != address(0), "Treasury: zero address signer");
            require(!isSigner[s], "Treasury: duplicate signer");
            isSigner[s] = true;
            signers.push(s);
            emit SignerAdded(s);
        }
    }

    function deposit(uint256 amount) external nonReentrant {
        require(ashCoin.transferFrom(msg.sender, address(this), amount), "Treasury: deposit failed");
        emit FundsDeposited(msg.sender, amount);
    }

    function createProposal(
        address recipient,
        uint256 amount,
        string calldata description
    ) external onlySigner returns (uint256) {
        require(recipient != address(0), "Treasury: zero recipient");
        require(amount > 0, "Treasury: zero amount");

        uint256 id = proposalCount++;
        Proposal storage p = proposals[id];
        p.recipient = recipient;
        p.amount = amount;
        p.description = description;

        emit ProposalCreated(id, recipient, amount, description);
        return id;
    }

    function approveProposal(uint256 id) external onlySigner {
        Proposal storage p = proposals[id];
        require(!p.executed, "Treasury: already executed");
        require(!p.approved[msg.sender], "Treasury: already approved");

        p.approved[msg.sender] = true;
        p.approvals += 1;

        emit ProposalApproved(id, msg.sender);

        if (p.approvals >= requiredApprovals) {
            _executeProposal(id);
        }
    }

    function _executeProposal(uint256 id) internal nonReentrant {
        Proposal storage p = proposals[id];
        require(!p.executed, "Treasury: already executed");
        require(ashCoin.balanceOf(address(this)) >= p.amount, "Treasury: insufficient funds");

        p.executed = true;
        require(ashCoin.transfer(p.recipient, p.amount), "Treasury: transfer failed");
        emit ProposalExecuted(id, p.recipient, p.amount);
    }

    function getTreasuryBalance() external view returns (uint256) {
        return ashCoin.balanceOf(address(this));
    }

    function getSigners() external view returns (address[] memory) {
        return signers;
    }
}
