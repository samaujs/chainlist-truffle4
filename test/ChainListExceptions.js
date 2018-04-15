// Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// Test Suite
contract("ChainList", function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1 in testing exception";
  var articleDescription = "Description for article 1 in testing exception";
  var articlePrice = 20; // Different from 10 in the smart contract

  // Mocha test framework
  // no article for sale yet
  it("should throw an exception if you try to buy an article when there is no article for sale yet", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // need to include buying article 1 in the previous "return chainListInstance.buyArticle({ as follow
      return chainListInstance.buyArticle(1, {
        // should fail because no article is for sale yet
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail) // catch exception that is thrown with buyArticle
    .catch(function(error) {
      assert(true); // error can be checked when it is captured here
    }).then(function() {
      // ensure that the state of contract was not altered with this failed function call and reverted
      // return chainListInstance.getArticle();
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      // Initial state of the contract
      // assert.equal(data[0], 0x0, "seller must be empty");
      // assert.equal(data[1], 0x0, "buyer must be empty");
      // assert.equal(data[2], "", "article name must be empty");
      // assert.equal(data[3], "", "article description must be empty");
      // assert.equal(data[4].toNumber(), 0, "article price must be zero");

      assert.equal(data.toNumber(), 0, "number of articles for sale must be zero");
    });
  });

  // New test case for buying an article that does not exist
  it("should throw an exception if you try to buy an article that does not exist", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
    }).then(function(receipt) {
      // we do not need to check on the event as it has been done in ChainListHappyPath.js test suite
      // Sell article 1 and buy article 2 that does not exist should fail
      return chainListInstance.buyArticle(2, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() { // check the state of the article
      // ensure that the state of contract was not altered with this failed function call and reverted
      return chainListInstance.articles(1);
    }).then(function(data) {
      // Initial state of the contract
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article1 price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // buying an article you are selling
  it("should throw an exception if you try to buy your own article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
    //  return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
    // }).then(function(receipt) {
      // we do not need to check on the receipt
      // return chainListInstance.buyArticle({from: seller, value: web3.toWei(articlePrice, "ether")});

      // This time we do not need to sellArticle as we have done with the new modifications above
      // Buy article with id = 1
      return chainListInstance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() { // without a . infront of then causes error "The contract code couldn't be stored, please check your gas amount."
      // ensure that the state of contract was not altered with this failed function call and reverted
      // return chainListInstance.getArticle();
      // Instead check contents are the same in article 1
      return chainListInstance.articles(1);
    }).then(function(data) {
      // Initial state of the contract
      //assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      // incease index by 1 for all the remaining fields to check the respective states of the contract to the point before buying in revert
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // buyer intends to buy an article that does not correspond to the seller asking price (incorrect value)
  it("should throw an exception if you try to buy an article for a value different from its price", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // Do not need to call sellArticle, as the article is still stored from the previous testcase
      // This time buyer attempts to buy at a lower price by 1 (higher or lower will be rejected by contract)
      // return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice - 1, "ether")});
      // specify to buy article id=1 by calling in buyArticle "./ChainList.sol"
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice - 1, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() { // without a . infront of then causes error "The contract code couldn't be stored, please check your gas amount."
      // ensure that the state of contract was not altered with this failed function call and reverted
      //return chainListInstance.getArticle();
      return chainListInstance.articles(1); // mapping getter provide the details
    }).then(function(data) {
      // Initial state of the contract
      // assert.equal(data[0], seller, "seller must be " + seller);
      // assert.equal(data[1], 0x0, "buyer must be empty");
      // assert.equal(data[2], articleName, "article name must be " + articleName);
      // assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      // assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));

      // Check contract status is unchanged
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      // incease index by 1 for all the remaining fields to check the respective states of the contract to the point before buying in revert
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // buyer intends to buy an article that has already been sold
  it("should throw an exception if you try to buy an article that has already been sold", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // Do not need to call sellArticle, as the article is still stored from the previous testcase
      // return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")});
      // specify to buy article id=1 by calling in buyArticle "./ChainList.sol"
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice, "ether")});
    }).then(function() {
      // This time buyer attempts to buy an article that has already been sold
      // specify to buy article id=1 by calling in buyArticle "./ChainList.sol"
      // return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")});
      // this time modified to buy from coinbase account but the buyer
      return chainListInstance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() { // without a . infront of then causes error "The contract code couldn't be stored, please check your gas amount."
      // ensure that the state of contract was not altered with this failed function call and reverted
      // return chainListInstance.getArticle();
      return chainListInstance.articles(1); // mapping getter provide the details
    }).then(function(data) {
      // Initial state of the contract
      // assert.equal(data[0], seller, "seller must be " + seller);
      // Check contract status is unchanged
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      // incease index by 1 for all the remaining fields to check the respective states of the contract to the point before buying in revert
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], buyer, "buyer must be " + buyer);
      assert.equal(data[3], articleName, "article name must be " + articleName);
      assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

});
