// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AshCoin.sol";

/**
 * @title LegacyKid
 * @dev NFT-style achievement and identity token for youth members of the QSE Ecosystem.
 *      Represents membership, achievements, and progress milestones for young users.
 */
contract LegacyKid {
    AshCoin public ashCoin;
    address public owner;

    struct Profile {
        string username;
        uint256 level;
        uint256 achievementPoints;
        uint256 joinedAt;
        bool active;
    }

    mapping(address => Profile) public profiles;
    mapping(address => string[]) public achievements;

    uint256 public totalMembers;

    event ProfileCreated(address indexed user, string username);
    event AchievementUnlocked(address indexed user, string achievement, uint256 reward);
    event LevelUp(address indexed user, uint256 newLevel);

    modifier onlyOwner() {
        require(msg.sender == owner, "LegacyKid: not owner");
        _;
    }

    constructor(address _ashCoin) {
        ashCoin = AshCoin(_ashCoin);
        owner = msg.sender;
    }

    function createProfile(string calldata username) external {
        require(!profiles[msg.sender].active, "LegacyKid: profile already exists");
        require(bytes(username).length > 0, "LegacyKid: username required");

        profiles[msg.sender] = Profile({
            username: username,
            level: 1,
            achievementPoints: 0,
            joinedAt: block.timestamp,
            active: true
        });

        totalMembers += 1;
        emit ProfileCreated(msg.sender, username);
    }

    function unlockAchievement(address user, string calldata achievement, uint256 rewardAmount) external onlyOwner {
        require(profiles[user].active, "LegacyKid: profile not found");

        achievements[user].push(achievement);
        profiles[user].achievementPoints += 10;

        if (profiles[user].achievementPoints >= profiles[user].level * 50) {
            profiles[user].level += 1;
            emit LevelUp(user, profiles[user].level);
        }

        if (rewardAmount > 0) {
            ashCoin.issueReward(user, rewardAmount, achievement);
        }

        emit AchievementUnlocked(user, achievement, rewardAmount);
    }

    function getAchievements(address user) external view returns (string[] memory) {
        return achievements[user];
    }
}
