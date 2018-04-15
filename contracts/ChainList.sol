pragma solidity ^0.4.18;

// Import contract for inheritance purposes
import "./Ownable.sol";

// append "is Ownable" to inherit from parent contract
contract ChainList is Ownable {

  // It is crucial and highly recommended to invoke Self Destruct by owner only; the account that deployed the contracts
  // This will de-activate contracts and it will irreversible with all variables becoming unavailable

  // Custom types to store a list of articles for sale
  struct Article {
    uint id; // identify each article in the associated array

    address seller;
    address buyer;
    string name;
    string description;
    uint256 price; // amount in Wei 256 bits
  }
  // compiler generates articles function with no argument but returns the 6 values like the following:
  // function articles(uint_id) public returns (
  // uint id,
  // address seller,
  // address buyer,
  // string name,
  // string description,
  // uint256 price; // amount in Wei 256 bits
  // ) {
  // id = articles[_id].id;
  // seller = articles[_id].seller;
  // buyer = articles[_id].buyer;
  // name = articles[_id].name;
  // description = articles[_id].description;
  // price = articles[_id].price;
  // }

  // state variables
  mapping (uint => Article) public articles; // store a list of articles, getter is set and not setter
  // mapping cannot be iterated and do not know which keys are set or not
  // articleCounter helps to keep track of size of mapping and which key should have an associated value
  uint articleCounter; // same as uint256

  // Saving the owner address for self destruct function
  // address owner; // can be removed because it is stored in parent contract "Ownable"

  // Define constructor called once to initialize default article when contract is deployed to the blockchain
  // constructor format has same name as contract, might not have arguments, no return value
  // This test constructor is used before we adapt the web page for selling an article
  //function ChainList() public {
    // 1 ETH, 18 zeros
    // sellArticle("Default article", "This is an article set by default", 1000000000000000000);
  //}

  // Events
  event LogSellArticle(
    // Include a new id for identifying multiple articles
    uint indexed _id,
    address indexed _seller, // able to filter events by value of seller address on client side, indexed aka keys
    string _name,
    uint256 _price
  );

  event LogBuyArticle(
    // Include a new id for identifying multiple articles
    uint indexed _id,
    address indexed _seller, // able to filter events by value of seller address on client side, indexed aka keys
    address indexed _buyer, // watch only event specific to them
    string _name,
    uint256 _price
  );

  // modifiers with no return value
  // modifier onlyOwner() {
  //  require(msg.sender == owner);
  //  _; // _ is the placeholder whereby it represents the code when the modifier is applied to
  // }
  // function modifier has been declared in the parent contract "Ownable" so it can be removed

  // Constructor, function has the same name as contract, called only once when contract is deployed
  // function ChainList() public {
  //   owner = msg.sender; // Save address of the owner deploying the contract
  // }
  // constructor has been declared in the parent contract "Ownable" so it can be removed

  // De-activate the contracts
  function kill() public onlyOwnerParent {
    // only allow the contract owner to de-activate; check the caller of function
    // This protection is good because the private key of user is used to sign the transaction which is kept securely
    // The following require line can be omitted with the onlyOwner modifier included above
    // It combines the modifier code with this function and the main objective is for the function to focus on the code
    // intentions and reuse generated pieces of code. Function Modifier offers basic aspect implementations.
    // require(msg.sender == owner); // Otherwise exception must be thown and execution of function is interrupted

    selfdestruct(owner); // refund the remainging funds in the contract
  }

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    // seller = msg.sender;
    // name = _name;
    // description = _description;
    // price = _price;
    // Adapt the above for selling multiple articles for different sellers

    // a new articleCounter
    // Increment the articleCounter
    articleCounter++;

    // Store this article inside article mapping with initializer for structure type
    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
    );

    // Trigger the event
    // add an ID to the LogSellArticle event
    // LogSellArticle(seller, name, price);
    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  // get an article
  // No longer required as we can get from the mapping getter
  // function getArticle() public view returns (
  //  address _seller,
    // include buyer information
  //  address _buyer,
  //  string _name,
  //  string _description,
  //  uint256 _price
  //  ) {
  //  return(seller, buyer, name, description, price);
  // }

  // Fetch the current number of articles in the contract
  function getNumberOfArticles() public view returns (uint) {
    return articleCounter;
  }

  // Fetch and return all article IDs for articles that are still for sale
  // view function does not cost any gas and no state variables will be modified
  // Currently, solidity does not allow function to return struct so we have to use the Ids for identifying articles
  function getArticlesForSale() public view returns (uint[]) {
    // Prepare output array, we specify to store in memory rather than storage which is expensive
    uint[] memory articleIds = new uint[](articleCounter);
    uint numberOfArticlesForSale = 0;
    // Iterate over articles
    for (uint i = 1; i <= articleCounter; i++) {
      // Keep the ID if the article is still available for sellArticle
      // mapping articles start from index 1 and array starts from index 0
      if (articles[i].buyer == 0x0) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // Copy the articleIds array into a smaller forSale array
    uint[] memory articlesForSale = new uint[](numberOfArticlesForSale);
    for (uint j = 0; j < numberOfArticlesForSale; j++) {
      articlesForSale[j] = articleIds[j];
    }
    return articlesForSale;
  }

  // buy an article
  // function marked as payable so that caller can send ETH value to it; otherwise, cannot receive value from caller
  // Change to support buying multiple articles, need to identify which article to buy
  // function buyArticle() payable public {
  function buyArticle(uint _id) payable public {
    // Consider Local variables to store struct variables
    //address seller;
    //address buyer;
    //string name;
    //string description;
    //uint256 price;


    // Check whether there is an article for sale
    // require(seller != 0x0);
    // Instead check whether any article is for sale as seller field does not appear the contract any more, it is in the struct
    // Do not need to check whether article has seller anymore because the only way to have the article added in the article list
    // is by sellArticle function that sets the seller value of the article
    // Contract initialize with articleCounter = 0
    require(articleCounter > 0);
    // Check that article exists
    require(_id > 0 && _id <= articleCounter);
    // Identify article and retrieve it from the mapping before storing in the storage pointer
    // so that in future modification of the field of this variable, it wiil be stored in the contract state
    // storage is the default for store complex type local variable like this
    // explicit definition here otherwise the compiler will complain
    Article storage article = articles[_id];

    // Check that the article has not been sold yet
    // require(buyer == 0x0);
    require(article.buyer == 0x0);

    // Don't allow the seller to buy his own article
    // require(msg.sender != seller);
    require(msg.sender != article.seller);

    // Check that the value sent corresponds to the price of the article
    // require(msg.value == price);
    require(msg.value == article.price);

    // Store the buyer's information
    // Good practice to update contract state before actual sending money even if reversal is required when transfer does not go through
    // This is to avoid certain re-entrance problem
    // buyer = msg.sender;
    article.buyer = msg.sender;

    // Buyer can then pay seller directly
    // seller.transfer(msg.value);
    article.seller.transfer(msg.value);

    // Trigger the buyer event; notify watcher
    // LogBuyArticle(seller, buyer, name, price);
    LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);

    // Several ways to interrupt contract function execution namely throw, assert, require and revert
    // All of them have basic consequences when the condition fails:
    // (1) value gets refunded;
    // (2) state changes reverted;
    // (3) function interrupted, no more gas will be spent;
    // (4) gas up to that point spent is not refunded;
    // (5) REVERT opcode is returned (aka throw an exception)
    // Note : They provide possibility of roll-back and make contract function atomic
    // throw = legacy (baackward compatibility)
    // assert = interal errors (bugs in the contract)
    // require = preconditions (conditions tested)
    // revert = imperative exceptions (for interrupt function execution, condition is more sophisticated then preconditions)
    // certain instructions can interrupt execution of function with similar behaviours like the above
    // address type has 2 methods to send value to account; namely send (need to check return value and do explicit revert if needed);
    // and transfer functions (automatically throws revert style exception in contract if value transfer fails)
    // (eg. balance from transfer account is not large enough)
    // In the case of, divide by zero or out-of-bound array access, assert style exception will be triggered
    // Any smart contract has its own cryptocurrency balance just like any other account.
    // In Ethereum, there are 2 types of accounts External account (key-value pairs can be used by human users);
    // and Contract account for deploying contracts
    // Attached value to transaction calling a payable function on a contract means transferring cryptocurrency from balance of sender
    // to balance of corresponding contract.  Any code of the contract can spend value from its balance by sending/transferring
    // to another account or keep it for later use.
    // seller.transfer(msg.value) means transfer value from balance of the contract to the seller account with the amount of msg.value
  }
}
