pragma solidity ^0.4.18;

// This is in the base contract so it can be extended to the ChainList contract with Inheritance
contract Ownable {
  // state variables
  address owner;

  // modifiers
  modifier onlyOwnerParent() {
    require(msg.sender == owner);
    _;
  }

  // Constructor function that takes same name as contract
  function Ownable() public {
    owner = msg.sender;
  }
}
