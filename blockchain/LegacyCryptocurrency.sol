// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ParentCurrency.sol";

/**
 * @title LegacyCryptocurrency
 * @dev Legacy token representing historical value in the QSE Ecosystem.
 *      Used for long-term holder rewards and ecosystem heritage recognition.
 */
contract LegacyCryptocurrency is ParentCurrency {
    uint256 public constant MAX_SUPPLY = 21_000_000 * (10 ** 18); // 21 million, Bitcoin-inspired

    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingSince;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor() ParentCurrency("LegacyCoin", "LGC", 10_000_000) {}

    function stake(uint256 amount) external nonReentrant {
        require(balanceOf[msg.sender] >= amount, "LegacyCryptocurrency: insufficient balance");
        _transfer(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        stakingSince[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake() external nonReentrant {
        uint256 staked = stakingBalance[msg.sender];
        require(staked > 0, "LegacyCryptocurrency: nothing staked");

        uint256 duration = block.timestamp - stakingSince[msg.sender];
        uint256 reward = (staked * duration * 5) / (365 days * 100); // 5% APY

        stakingBalance[msg.sender] = 0;
        stakingSince[msg.sender] = 0;

        _transfer(address(this), msg.sender, staked);
        if (reward > 0 && totalSupply + reward <= MAX_SUPPLY) {
            _mint(msg.sender, reward);
        }

        emit Unstaked(msg.sender, staked, reward);
    }

    function getStakingReward(address user) external view returns (uint256) {
        if (stakingBalance[user] == 0) return 0;
        uint256 duration = block.timestamp - stakingSince[user];
        return (stakingBalance[user] * duration * 5) / (365 days * 100);
    }
}
