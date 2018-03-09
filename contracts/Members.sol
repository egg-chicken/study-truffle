pragma solidity ^0.4.17;

import "./Owned.sol";

contract Members is Owned {
    Rank[] public ranks;
    mapping (address => Member) public members;

    struct Member {
        uint transactionCount;
        uint transactionAmount;
        uint rankIndex;
    }

    struct Rank {
        string name;
        uint minCount;
        uint minAmount;
        uint8 discountRate;
    }

    function Members() public {
        pushRank('Default', 0, 0, 0);
    }

    function pushRank(string name, uint minCount, uint minAmount, uint8 discountRate) onlyOwner public {
        ranks.push(Rank(name, minCount, minAmount, discountRate));
    }

    function editRank(uint index, string name, uint minCount, uint minAmount, uint8 discountRate) onlyOwner public {
        ranks[index] = Rank(name, minCount, minAmount, discountRate);
    }

    function addTransactionAmount(address memberAddr, uint amount) public {
        Member storage member = members[memberAddr];
        member.transactionCount += 1;
        member.transactionAmount += amount;
        for(uint i=0; i<ranks.length; i++) {
            if(ranks[i].minCount <= member.transactionCount &&
               ranks[i].minAmount <= member.transactionAmount &&
               ranks[i].discountRate > ranks[member.rankIndex].discountRate) {
                member.rankIndex = i;
            }
        }
    }

    function getDiscountRate(address memberAddr) view public returns(uint8){
        uint rankIndex = members[memberAddr].rankIndex;
        return ranks[rankIndex].discountRate;
    }
}
