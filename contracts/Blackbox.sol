// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Blackbox {
    mapping(address => string[]) consumerGoods;

    event BoughtGoods(address indexed buyer, string goodsCategory, string illegalGoods);

    modifier correctPayment(uint256 payment) {
        require(msg.value == payment, "Insufficient ETH amount sent.");
        _;
    }

    function getRandomPrize(string memory goodsCategory) internal pure returns (string memory) {
        if (keccak256(abi.encodePacked(goodsCategory)) == keccak256(abi.encodePacked("Melee"))) {
            return "SOG Seal Pup";
        } else if (keccak256(abi.encodePacked(goodsCategory)) == keccak256(abi.encodePacked("Handgun"))) {
            return "Glock 17";
        } else {
            return "You got nothing!";
        }
    }

    function buyMelee() external payable correctPayment(1 ether) {
        string memory prize = getRandomPrize("Melee");
        consumerGoods[msg.sender].push(prize);
        emit BoughtGoods(msg.sender, "Melee", prize);
    }

    function buyHandgun() external payable correctPayment(2 ether) {
        string memory prize = getRandomPrize("Handgun");
        consumerGoods[msg.sender].push(prize);
        emit BoughtGoods(msg.sender, "Handgun", prize);
    }

    function getMyPrizes() external view returns (string[] memory) {
        return consumerGoods[msg.sender];
    }
}