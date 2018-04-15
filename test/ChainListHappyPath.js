// Wrap loaded contract in Truffle contract abstraction
var ChainList = artifacts.require("./ChainList.sol");

// Test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  // Adaptation include suffix to support multiple articles for sale
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1 testing";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2 testing";
  var articlePrice2 = 20;

  // Include variables for Buyer
  var buyer = accounts[2];
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  // Define testcase 1
  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      //return instance.getArticle();
      chainListInstance = instance;
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      // console.log("data item 3 = ", data[3]);
      // assert.equal(data[0], 0x0, "seller must be empty");
      // include buyer information from getArticle modification
      // assert.equal(data[1], 0x0, "buyer must be empty");
      // Shift remaining data index by 1
      // assert.equal(data[2], "", "article name must be empty");
      // assert.equal(data[3], "", "article description must be empty");
      // assert.equal(data[4].toNumber(), 0, "article price must be zero");
      // from uint to number
      assert.equal(data.toNumber(), 0, "Number of articles must be zero to start with");
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      // Should have empty array, mapping is empty and articleCounter is initialize to zero
      // Use Java promises to test result in sequence
      assert.equal(data.length, 0, "There should not be any article for sales");
    }) // does not give error if there is no semi-colon here???
  });

  // Define testcase 2 for seller
  // it("should sell an article", function() {
  //  return ChainList.deployed().then(function(instance) {
  //    chainListInstance = instance;
  //    return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
  //   }).then(function() {
      // Check the changed article state
  //    return chainListInstance.getArticle();
  //  }).then(function(data) {
  //    assert.equal(data[0], seller, "seller must be " + seller);
      // include buyer information from getArticle modification
  //    assert.equal(data[1], 0x0, "buyer must be empty after we sell an article");
      // Shift remaining data index by 1
  //    assert.equal(data[2], articleName, "article name must be " + articleName);
  //    assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
  //    assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
  //  }) // does not give error if there is no semi-colon here???
  //});

  // New testcase 2 for seller based on multiple articles
  // Sell a first article
  it("should let us sell a first article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName1,
        articleDescription1,
        web3.toWei(articlePrice1, "ether"),
        {from: seller}
      );
    }).then(function(receipt) {
      // Check the LogSellArticle event
      assert.equal(receipt.logs.length, 1, "one sell event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "Event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1"); // Convert from uint Big number to JS number
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 1, "number of articles sold must be one now!");

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one article for sale");
      assert.equal(data[0].toNumber(), 1, "article id must be 1");

      // check article is saved in the articles mapping
      return chainListInstance.articles(data[0]);
    }).then(function(data) {
      // using the return values from getter to check all data is available
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article1 price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // Sell a second article
  it("should let us sell a second article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName2,
        articleDescription2,
        web3.toWei(articlePrice2, "ether"),
        {from: seller}
      );
    }).then(function(receipt) {
      // Check the LogSellArticle event
      assert.equal(receipt.logs.length, 1, "one more sell event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "Event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2"); // Convert from uint Big number to JS number
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price must be " + web3.toWei(articlePrice2, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "number of articles sold must be TWO now!");

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be TWO articles for sale");
      assert.equal(data[1].toNumber(), 2, "article id must be 2 for the second element in the array");

      // This time check article 2 is saved in the articles mapping
      return chainListInstance.articles(data[1]);
    }).then(function(data) {
      // using the return values from getter to check all data is available
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName2, "article name must be " + articleName2);
      assert.equal(data[4], articleDescription2, "article description must be " + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article1 price must be " + web3.toWei(articlePrice2, "ether"));
    });
  });

  // Define testcase 3 for buyer
  //it("should buy an article and should trigger an event when a new article is bought", function() {
  //  return ChainList.deployed().then(function(instance) {
  //    chainListInstance = instance;
      // Record balances of seller and buyer before buyArticle
  //    sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
  //    buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
  //    return chainListInstance.buyArticle({
  //      from: buyer,
  //      value: web3.toWei(articlePrice, "ether") // Buy at the selling price
  //    });
  //  }).then(function(receipt) {
  //    assert.equal(receipt.logs.length, 1, "one buy event should have been triggered");
  //    assert.equal(receipt.logs[0].event, "LogBuyArticle", "Event should be LogBuyArticle");
  //    assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
  //    assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
  //    assert.equal(receipt.logs[0].args._name, articleName, "event article name must be " + articleName);
  //    assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));

      // record balances of buyer and seller after the buyArticle
  //    sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
  //    buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effects of buy on the balances of buyer and seller, taken into consideration on the gas used for buyArticle
  //    assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice, "seller should have earned " + articlePrice + " ETH");
  //    assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice, "buyer should have spent " + articlePrice + " ETH");

      // Chain another promise after checking the above
  //    return chainListInstance.getArticle();
  //  }).then(function(data) {
  //    assert.equal(data[0], seller, "seller must be " + seller);
      // include buyer information from getArticle modification
  //    assert.equal(data[1], buyer, "buyer must be " + buyer);
  //    assert.equal(data[2], articleName, "article name must be " + articleName);
  //    assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
  //    assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
  //  }) // does not give error if there is no semi-colon here???
  //});

  // Testcase for buying the first article
  it("should buy the first article and should trigger an event when the first article is bought", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // Record balances of seller and buyer before buyArticle
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle(1, { // identify the articleId
        from: buyer,
        value: web3.toWei(articlePrice1, "ether") // Buy at the selling price
      });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one buy event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "Event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id for first bought article must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "first event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "first event article price must be " + web3.toWei(articlePrice1, "ether"));

      // record balances of buyer and seller after the buyArticle
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effects of buy on the balances of buyer and seller, taken into consideration on the gas used for buyArticle
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

      // Chain another promise after checking the above
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there should now be only ONE article left for sale");
      assert.equal(data[0].toNumber(), 2, "article 2 should be the only article left for sale");

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 2, "there should still be TWO articles in total for sale");
    }) // does not give error if there is no semi-colon here???
  });

  // Event testcase 4
  // it("should trigger an event when a new article is sold", function() {
  //  return ChainList.deployed().then(function(instance) {
  //    chainListInstance = instance;
  //    return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
  //  }).then(function(receipt) {
  //    assert.equal(receipt.logs.length, 1, "one sell event should have been triggered");
  //    assert.equal(receipt.logs[0].event, "LogSellArticle", "Event should be LogSellArticle");
  //    assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
  //    assert.equal(receipt.logs[0].args._name, articleName, "event article name must be " + articleName);
  //    assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event article price must be " + web3.toWei(articlePrice, "ether"));
  //  }); // does not give error if there is no semi-colon here???
  //});
  // End of testcases
});
