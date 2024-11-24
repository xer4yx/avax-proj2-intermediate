// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Contract {
    address public seller;
    uint256 public price;
    uint256 private sellerBalance = 0;

    event Announcement(string message);

    constructor () {
        seller = msg.sender;
    }

    modifier onlySeller () {
        require(msg.sender == seller, "Invalid seller address.");
        _;
    }

    function setPrice(uint256 _newPrice) external onlySeller {
        price = _newPrice;
        assert(price == _newPrice);
        emit Announcement("Price changed successfully");
    }

    function getBalance() external view onlySeller returns (uint256) {
        return sellerBalance;
    }
    
    function pay(uint256 _toPay) external {
        require(_toPay == price, "Not enough funds to pay.");
        emit Announcement("Item paid successfully!");
        sellerBalance += _toPay;
    }
}