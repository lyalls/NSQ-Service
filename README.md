Introduction
============

Quick start
-----------
####1. build business logic of each module in its `manager.js` file with fixed parameter formation: must contain 2 parameters, first is the data object, second is the callback function
The `manager.js` file should look like this:
```javascript
module.exports = {
    some_api : function( parameterObject, callback ){
       // some business logic
       // ...
    },
    
    some_other_api: function( parameterObject, callback ){
       // some other business logic
       // ...
    },

    // ...   
}
```
It's just suggested to use `manager.js` as the business logic file name, to compliant with the concept of `manager` which will be used in the later step

####2. Setup the NSQ configurations
The configuration should look like this:
```javascript
nsqServiceConfig: {
        address: '127.0.0.1',      // NSQ server address
        writerPort: 4150,          // NSQ writer port, default is 4150
        readerPort: 4150,          // NSQ reader port, default is 4150
        maxInFlight: 1,            // NSQ parameter `maxInFlight`
        maxAttempts: 5,            // NSQ parameter `maxAttempts`
        producerQueue: 'auth',     // Define the name of `producer` queue
        customerQueue: 'auth-cust',// Define the name of `customer` queue
        channel: 'main'            // Default NSQ Channel is `main`
}
```

####3. Start NSQ-Service
In the very beginning of your project entry file, normally is `app.js`,
```javascript
var app = require('express')    // or restify, koa, etc.
// ...
var NS = require('nsq-service')
NS.queue.setConfig( nsqServiceConfig )   // the config object defined above
NS.handler.addManager(require('./PATH/TO/MANAGER')) // add some manager
NS.handler.ready( function() {      
    // NSQ-service need to be ready before start the local service
    // ...
    app.listen(3000)
})
```

Concepts
-------------
####1. `Producer` and `Customer`
Every module in a distributed architecture is a `Producer` and at the mean time, is a `Customer` too. The communication sequence is:

(1) `module[A]` want to invoke an `api` of `module[B]`, 
    `module[A]` will send a message to `module[B]`'s `producerQueue`, 
    in that message, 
    information of `module[A]`'s `customerQueue` is attached

(2) `module[B]` receive that message from `module[A]`, 
    parse the `api` and arguments out, 
    invoke the specified api with those arguments, 
    when finished, 
    `module[B]` send the result back to `module[A]`'s `customerQueue`,
    according to the attached information

(3) `module[A]` receive the execution result,
    from its `customerQueue`,
    and then execute the coresponding `callback`

####2. `MessageID` and `Async`
Every message contains a `MessageID`, which is composed by timestamp, machine name, and random numbers, it's very hard to get collision even in millions messages per second

Every message is executed asynchronously

