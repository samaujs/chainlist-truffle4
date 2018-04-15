App = {


     // Initial all variables
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false, // use to prevent multiple asynchronous calls are made at the same time for reloadArticles

     init: function() {
          // Modified from Section7, lecture 40
          // load articlesRow for hardcoded testing
          // var articlesRow = $('#articlesRow');
          // var articleTemplate = $('#articleTemplate');

          //articleTemplate.find('.panel-title').text('article 1');
          // articleTemplate.find('.article-description').text('Description for article 1');
          // articleTemplate.find('.article-price').text("10.23");
          //articleTemplate.find('.article-seller').text("Ox12345678901234567890");

          // articlesRow.append(articleTemplate.html());
          // End of modification for hardcoded testing, instead modify initWeb3 for node testing

          return App.initWeb3();
     },

     initWeb3: function() {
      // Modified for node testing
      // Initialize web3
      // If web3 has been injected by Metamask
      if (typeof web3 !== 'undefined') {
        // Reuse the provider of the Web3 object injected by Metamask
        App.web3Provider = web3.currentProvider;
      } else {
        // create a new provider and plug it directly into our local node
        // Strategy recommended by Metamask to initialize web3
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);
      // Display account and balance info
      App.displayAccountInfo();
      // End of modification for node testing

      // Initialize the connection with the contract and instantiate the contract
      return App.initContract();
     },

     // Note : This code does not depend on being chainlist contract being initialized
     // Thus, the contract initialization and the loading of account information can be performed in parallel
     displayAccountInfo: function() {
       // One selected account in the Metamask is being displayed at one time
       // console.log(web3.eth.accounts);

       web3.eth.getCoinbase(function(err, account) {
         if (err === null) {
           App.account = account;
           $('#account').text(account);
           web3.eth.getBalance(account, function(err, balance) {
             if (err === null) {
               $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
             }
           }) // No semi-colon?
         }
       });
     },

     initContract: function() {
        // To interact with chainlist contract, create an instance and attached to frontend
        // JQuery ajax call
        // Fetch json file that is created by Truffle during the computation process and stored in the build/contracts
        // The 'ChainList.json' is exposed at the root of our application because of browser sync and loaded asynchronously by the
        // JQuery s.getJSON.  Browser Sync is configured by bs-config.json and done by our box
        // Use this JSON file to configure the truffle contract abstraction with the ABI describing the interface of our contract and
        // its deployment address on the Ethereum node.
        $.getJSON('ChainList.json', function(chainListArtifact) {
          // get the contract artifact file and use it to instantiate a truffle contract abstraction
          // previous step don't have to do it as it is done by truffle
          App.contracts.ChainList = TruffleContract(chainListArtifact);
          // Need to put 'ChainList.json' file at the root of our host so that we can load it asychronously
          // set the provider for our contract so that it knows which node to communicate with
          App.contracts.ChainList.setProvider(App.web3Provider);

          // Listen to Events
          App.listenToEvents();

          // After all required initization, we can retrieve the article from the contract
          return App.reloadArticles();
        });
     },

     reloadArticles: function() {
       // Avoid re-entry bugs for basic protection
       if (App.loading) { // App is already loading
         return;
       }
       App.loading = true;

       // Refresh account information because the balance might have changed
       App.displayAccountInfo();
       // retrieve the article placeholder and clear it
       // $('#articlesRow'),empty();

       // Use to store loaded instance
       var chainListInstance;

       // ChainList is a truffle contract abstraction and has a deployed function
       App.contracts.ChainList.deployed().then(function(instance) {
         //return instance.getArticle();
         chainListInstance = instance;
         return instance.getArticlesForSale();
       //}).then(function(article) {
         // Check if article has been initialized
        // if (article[0] == 0x0) {
           // No article
        //   return;
        // }
       }).then(function(articleIds) {
         // retrieve the article placeholder and clear it
         $('#articlesRow').empty();
         for (var i = 0; i < articleIds.length; i++) {
           var articleId = articleIds[i];
           // remember to use toNumber for conversion for this articles mapping asychronous call
           chainListInstance.articles(articleId.toNumber()).then(function(article) {
             App.displayArticle(article[0], article[1], article[3], article[4], article[5]); // skip field [2] that is the buyer
           });
         }
         App.loading = false;

         // Added for buying information, price is in the fourth position of getArticle()
         // var price = web3.fromWei(article[4], "ether");

         // Retrieve the article template and fill it with data
         // var articleTemplate = $('#articleTemplate');
         // article index increase by 1; since buyer is article[1]
         // articleTemplate.find('.panel-title').text(article[2]);
         // articleTemplate.find('.article-description').text(article[3]);
         // articleTemplate.find('.article-price').text(price);
         // Store price value in the button attribute that can be retrieved
         // articleTemplate.find('.btn-buy').attr('data-value', price);

         // var seller = article[0]; // Should not be nil
         // if (seller == App.account) {
           // Check current user account saved in earlier displayAccountInfo function
           // instead of seller's account address
           // Able to see article sold by oneself
           // seller = "You";
         // }
         // articleTemplate.find('.article-seller').text(seller);

         // Logic for buyer
         // var buyer = article[1];
         //if (buyer == App.account) {
           // buyer = "You";
         //} else if (buyer == 0x0) {
           //buyer = "No buyer yet";
         //}
         // articleTemplate.find('.article-buyer').text(buyer);

         // Display article template, hide/show buy button
         // article[0] is seller and article[1] is buyer
         // if (article[0] == App.account || article[1] != 0x0) {
           // articleTemplate.find('.btn-buy').hide(); // jQuery function
         // } else {
           // articleTemplate.find('.btn-buy').show();
         // }

         // add this article to articlesRow
         // $('#articlesRow').append(articleTemplate.html());
       }).catch(function(err) {
         // To handle error with catch
         console.error(err.message);
         App.loading = false; // unlocked even for error so that the reloadArticles() can be called again
       });
     },

     // Display list of articles in the template
     displayArticle: function(id, seller, name, description, price) {
       var articlesRow = $('#articlesRow');
       var etherPrice = web3.fromWei(price, "ether");
       var articleTemplate = $("#articleTemplate"); // using "" here instead of ''

       articleTemplate.find('.panel-title').text(name);
       articleTemplate.find('.article-description').text(description);
       articleTemplate.find('.article-price').text(etherPrice + " ETH");
       // Store id and price values in the button attributes that can be retrieved later
       articleTemplate.find('.btn-buy').attr('data-id', id);
       articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

       // if seller is connected
       if (seller == App.account) {
         articleTemplate.find('.article-seller').text("You");
         articleTemplate.find('.btn-buy').hide();
       } else {
         articleTemplate.find('.article-seller').text(seller);
         articleTemplate.find('.btn-buy').show();
       }

       // add this new article to the list of articles
       articlesRow.append(articleTemplate.html());
     },

     // Preparation to sell article on web page
     sellArticle: function() {
       // retrieve the details of the article from modal dialog where we entered the details
       var _article_name = $('#article_name').val();
       var _description = $('#article_description').val();
       // use zero value as default
       var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

       // No name is entered for the article or price is zero
       if ((_article_name.trim() == '') || (_price == 0)) {
         // nothing to sell
         return false;
       }

       App.contracts.ChainList.deployed().then(function(instance) {
         return instance.sellArticle(_article_name, _description, _price, {
           from: App.account,
           gas: 500000
         });
       }).then(function(result) { // block corresponding to sell article has been mined
         // App.reloadArticles();
         // Replaced by direct reloadArticles in the event watch, listenToEvents()
       }).catch(function(err) {
         console.error(err);
       });
     },

     // Implement listening to events triggered by contract on the web
     listenToEvents: function() {
       App.contracts.ChainList.deployed().then(function(instance) {
         // keep default values for filter and block range, fetch the last event triggered by contract
          instance.LogSellArticle({}, {}).watch(function(error, event) {
            if (!error) {
              // Add events to list of Events on page
              $("#events").append('<li class ="list-group-item">' + event.args._name + ' is now for sale!</li>');
            } else {
              console.error(error);
            }
            App.reloadArticles();
          });

          // Listen to buy event to notify and refresh page when article is bought
          // no filter and no range on the watcher
          instance.LogBuyArticle({}, {}).watch(function(error, event) {
            if (!error) {
              // Add events to list of Events on page when buyer bpught the article
              $("#events").append('<li class ="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
            } else {
              console.error(error);
            }
            App.reloadArticles();
          });
       });
     },

     buyArticle: function() {
       event.preventDefault(); // trick to avoid any issues

       // Retrieve the article Price, data value stored in the btn-buy button attribute
       var _price = parseFloat($(event.target).data('value')); // button is the event.target

       // Retrieve the articleId from the btn-buy button
       var _article_Id = $(event.target).data('id');

       // call buyArticle function exposed by contract
       App.contracts.ChainList.deployed().then(function(instance) {
         // return instance.buyArticle({
         return instance.buyArticle(_article_Id, {
           from: App.account, // any connected account
           value: web3.toWei(_price, "ether"),
           gas: 500000
         });
       }).catch(function(error) {
         console.error(error);
       });
     }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});

// Amend app.css to add some paddings to improve display as the list of articles will grow and not overright the footer
