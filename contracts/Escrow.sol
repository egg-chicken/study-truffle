pragma solidity ^0.4.17;

import "./Owned.sol";
import "./OreCoin.sol";

contract Escrow is Owned {
    OreCoin public orecoin;
    uint public amount;
    uint public price;
    address public buyer;
    address public seller;
    bool public agreement;

    function Escrow(address _orecoin, uint _amount, uint _price) public {
        orecoin = OreCoin(_orecoin);
        amount = _amount;
        price = _price;
        seller = msg.sender;
    }

    function () payable public {
        require(buyer == address(0) && msg.value == price);
        buyer = msg.sender;
        updateAgreement();
    }

    function updateAgreement () public {
        agreement = orecoin.balances(this) == amount && this.balance == price;
    }

    function solve () public {
        require(agreement);
        orecoin.sendCoin(buyer, amount);
        seller.transfer(price);
        selfdestruct(owner);
    }

    function cancel () public {
        require(buyer == msg.sender || seller == msg.sender);
        if(orecoin.balances(this) == amount) {
            orecoin.sendCoin(seller, amount);
        }
        if(this.balance == price) {
            buyer.transfer(price);
        }
        selfdestruct(owner);
    }
}
