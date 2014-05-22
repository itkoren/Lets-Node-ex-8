Eighth Exercise (Unit Testing)
=================================================

Please complete the following steps:

1. Write tests for **"sentiment"** module (**HINT: consider that AFINN.json may be upgraded and your tests should not be influenced from it**)

2. Write tests for **"sentigator"** **"content"** route, mock only the **"request"** module (**HINT: Start by moving the **"content"** route handling code to a file named **"aggregator.js"** in **"lib"** directory to allow testing only the aggregation logic**)

3. Refactor **"sentigator"** server to use **"supertest"** and write tests for the API

#####Use the **"sentiment"** and the **"sentigator"** modules in this repository as a starting point for the exercise