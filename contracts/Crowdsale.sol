pragma solidity ^0.4.17;

import "./Owned.sol";
import "./OreCoin.sol";

contract Crowdsale is Owned {
    uint public fundingGoal;
    uint public fundingTotal;
    uint public startTime;
    uint public endTime;
    uint public price;
    uint public rewardTotal;
    OreCoin public orecoin;
    mapping (address => Funder) public funders;

    struct Funder {
        uint fund;
        uint reward;
        bool withdrew;
    }

    // all argument's unit is wei
    function Crowdsale (uint _fundingGoal,
                        uint _startTime,
                        uint _endTime,
                        uint _price,
                        address _orecoin) public {
        fundingGoal = _fundingGoal;
        startTime = _startTime;
        endTime = _endTime;
        price = _price;
        orecoin = OreCoin(_orecoin);
    }

    function () payable public {
        require(startTime <= now && now < endTime);
        uint reward = msg.value * bonusRate() / price / 100;
        funders[msg.sender].fund += msg.value;
        funders[msg.sender].reward += reward;
        fundingTotal += msg.value;
        rewardTotal += reward;
    }

    function bonusRate() view private returns(uint) {
        if (startTime + 30 days >= now) {
            return 200;
        } else if (startTime + 60 days >= now) {
            return 150;
        } else if (startTime + 90 days >= now) {
            return 110;
        } else {
            return 100;
        }
    }

    function withdraw() public {
        require(endTime > now);
        require(!funders[msg.sender].withdrew);
        funders[msg.sender].withdrew = true;
        if (fundingGoal > fundingTotal) {
            msg.sender.transfer(funders[msg.sender].fund);
        } else {
            orecoin.sendCoin(msg.sender, funders[msg.sender].reward);
        }
    }

    function withdrawByOwner() onlyOwner public {
        require(endTime > now);
        if (fundingGoal > fundingTotal) {
            orecoin.sendCoin(owner, orecoin.balances(this));
        } else {
            owner.transfer(funders[msg.sender].fund);
        }
    }
}
