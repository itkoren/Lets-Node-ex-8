Eighth Exercise (Unit Testing)
=================================================

Please complete the following steps:

1. Write some tests for **"sentiment"** module (**HINT: consider that AFINN.json may be upgraded and your tests should not be influenced from it**)

2. Write some tests for **"parser.js"**, mock the **"sentiment"** module in your tests

3. Write some tests for **"sentigator"** **"content"** route, mock only the **"[request](https://github.com/mikeal/request)"** module (**HINT: Start by moving the "content" route handling code to a file named "aggregator.js" in "lib" directory to allow testing only the aggregation logic. Use the StringReader stream implementation "reader.js", located in the root directory, for mocking the "[request](https://github.com/mikeal/request)" stream**)

4. Refactor **"sentigator"** server to use **"[supertest](https://github.com/visionmedia/supertest)"** and write some tests for the API

#####Use the **"sentiment"** and the **"sentigator"** modules in this repository as a starting point for the exercise
#####*Use "reader.js", located in the root directory, as StringReader stream implementation, for mocking the "[request](https://github.com/mikeal/request)" stream, in step #3*