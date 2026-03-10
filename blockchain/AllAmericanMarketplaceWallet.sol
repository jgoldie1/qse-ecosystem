// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AshCoin.sol";
import "./ReentrancyGuard.sol";

/**
 * @title AllAmericanMarketplaceWallet
 * @dev Escrow and payment wallet for the QSE Marketplace.
 *      Handles purchases, escrow release, and refunds with reentrancy protection.
 */
contract AllAmericanMarketplaceWallet is ReentrancyGuard {
    AshCoin public ashCoin;
    address public owner;
    uint256 public feePercent = 2; // 2% platform fee

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        bool released;
        bool refunded;
        uint256 createdAt;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;
    uint256 public collectedFees;

    event EscrowCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowReleased(uint256 indexed id, address indexed seller, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address indexed buyer, uint256 amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Marketplace: not owner");
        _;
    }

    constructor(address _ashCoin) {
        ashCoin = AshCoin(_ashCoin);
        owner = msg.sender;
    }

    function createEscrow(address seller, uint256 amount) external nonReentrant returns (uint256) {
        require(amount > 0, "Marketplace: amount must be positive");
        require(ashCoin.transferFrom(msg.sender, address(this), amount), "Marketplace: transfer failed");

        uint256 id = escrowCount++;
        escrows[id] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            released: false,
            refunded: false,
            createdAt: block.timestamp
        });

        emit EscrowCreated(id, msg.sender, seller, amount);
        return id;
    }

    function releaseEscrow(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(msg.sender == e.buyer || msg.sender == owner, "Marketplace: unauthorized");
        require(!e.released && !e.refunded, "Marketplace: already settled");

        uint256 fee = (e.amount * feePercent) / 100;
        uint256 payout = e.amount - fee;
        collectedFees += fee;
        e.released = true;

        require(ashCoin.transfer(e.seller, payout), "Marketplace: payout failed");
        emit EscrowReleased(id, e.seller, payout);
    }

    function refundEscrow(uint256 id) external nonReentrant onlyOwner {
        Escrow storage e = escrows[id];
        require(!e.released && !e.refunded, "Marketplace: already settled");
        e.refunded = true;

        require(ashCoin.transfer(e.buyer, e.amount), "Marketplace: refund failed");
        emit EscrowRefunded(id, e.buyer, e.amount);
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = collectedFees;
        collectedFees = 0;
        require(ashCoin.transfer(owner, amount), "Marketplace: fee withdrawal failed");
        emit FeesWithdrawn(owner, amount);
    }
}
