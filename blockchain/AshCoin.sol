// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ParentCurrency.sol";

/**
 * @title AshCoin
 * @dev Primary utility token of the QSE Ecosystem.
 *      Used for rewards, training enrollment, marketplace purchases, and governance.
 */
contract AshCoin is ParentCurrency {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * (10 ** 18); // 1 billion ASH

    event RewardIssued(address indexed recipient, uint256 amount, string reason);

    constructor() ParentCurrency("AshCoin", "ASH", 100_000_000) {}

    /**
     * @dev Issue a reward to a user. Only callable by owner (ecosystem contracts).
     */
    function issueReward(address recipient, uint256 amount, string calldata reason) external onlyOwner {
        require(totalSupply + amount <= MAX_SUPPLY, "AshCoin: max supply exceeded");
        _mint(recipient, amount);
        emit RewardIssued(recipient, amount, reason);
    }
}
