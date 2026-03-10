// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AshCoin.sol";
import "./LegacyCryptocurrency.sol";
import "./ReentrancyGuard.sol";

/**
 * @title OmniExchange
 * @dev Decentralized exchange for swapping QSE Ecosystem tokens.
 *      Supports ASH <-> LGC swaps with a constant-product AMM model.
 */
contract OmniExchange is ReentrancyGuard {
    AshCoin public ashCoin;
    LegacyCryptocurrency public legacyCoin;
    address public owner;

    uint256 public ashReserve;
    uint256 public lgcReserve;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant FEE_NUMERATOR = 3; // 0.3% fee

    event LiquidityAdded(address indexed provider, uint256 ashAmount, uint256 lgcAmount, uint256 shares);
    event LiquidityRemoved(address indexed provider, uint256 ashAmount, uint256 lgcAmount, uint256 shares);
    event SwapAshForLgc(address indexed trader, uint256 ashIn, uint256 lgcOut);
    event SwapLgcForAsh(address indexed trader, uint256 lgcIn, uint256 ashOut);

    modifier onlyOwner() {
        require(msg.sender == owner, "OmniExchange: not owner");
        _;
    }

    constructor(address _ashCoin, address _legacyCoin) {
        ashCoin = AshCoin(_ashCoin);
        legacyCoin = LegacyCryptocurrency(_legacyCoin);
        owner = msg.sender;
    }

    function addLiquidity(uint256 ashAmount, uint256 lgcAmount) external nonReentrant returns (uint256 shares) {
        require(ashAmount > 0 && lgcAmount > 0, "OmniExchange: amounts must be positive");

        ashCoin.transferFrom(msg.sender, address(this), ashAmount);
        legacyCoin.transferFrom(msg.sender, address(this), lgcAmount);

        if (totalLiquidity == 0) {
            shares = _sqrt(ashAmount * lgcAmount);
        } else {
            shares = _min(
                (ashAmount * totalLiquidity) / ashReserve,
                (lgcAmount * totalLiquidity) / lgcReserve
            );
        }

        require(shares > 0, "OmniExchange: insufficient liquidity minted");
        liquidity[msg.sender] += shares;
        totalLiquidity += shares;
        ashReserve += ashAmount;
        lgcReserve += lgcAmount;

        emit LiquidityAdded(msg.sender, ashAmount, lgcAmount, shares);
    }

    function swapAshForLgc(uint256 ashIn) external nonReentrant returns (uint256 lgcOut) {
        require(ashIn > 0, "OmniExchange: zero input");
        ashCoin.transferFrom(msg.sender, address(this), ashIn);

        uint256 ashInWithFee = ashIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        lgcOut = (ashInWithFee * lgcReserve) / (ashReserve * FEE_DENOMINATOR + ashInWithFee);

        require(lgcOut > 0, "OmniExchange: insufficient output");
        ashReserve += ashIn;
        lgcReserve -= lgcOut;
        legacyCoin.transfer(msg.sender, lgcOut);

        emit SwapAshForLgc(msg.sender, ashIn, lgcOut);
    }

    function swapLgcForAsh(uint256 lgcIn) external nonReentrant returns (uint256 ashOut) {
        require(lgcIn > 0, "OmniExchange: zero input");
        legacyCoin.transferFrom(msg.sender, address(this), lgcIn);

        uint256 lgcInWithFee = lgcIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        ashOut = (lgcInWithFee * ashReserve) / (lgcReserve * FEE_DENOMINATOR + lgcInWithFee);

        require(ashOut > 0, "OmniExchange: insufficient output");
        lgcReserve += lgcIn;
        ashReserve -= ashOut;
        ashCoin.transfer(msg.sender, ashOut);

        emit SwapLgcForAsh(msg.sender, lgcIn, ashOut);
    }

    function getAshForLgc(uint256 ashIn) external view returns (uint256) {
        if (ashReserve == 0 || lgcReserve == 0) return 0;
        uint256 ashInWithFee = ashIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        return (ashInWithFee * lgcReserve) / (ashReserve * FEE_DENOMINATOR + ashInWithFee);
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) { z = x; x = (y / x + x) / 2; }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
