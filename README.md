Introduction
============


Quick Start
-----------
####1. Understand configs
```javascript
nsqConfig: {
	address: '127.0.0.1', 	   // NSQ server address
	writerPort: 4150,          // NSQ writer port, default is 4150
	readerPort: 4150,          // NSQ reader port, default is 4150
	maxInFlight: 1,            // NSQ parameter `maxInFlight`
	maxAttempts: 5,            // NSQ parameter `maxAttempts`
	producerQueue: 'auth',     // Define the name of `producer` queue
	customerQueue: 'auth-cust',// Define the name of `customer` queue
	channel: 'main'            // Default NSQ Channel is `main`
}
```

####2. Concept of `Producer` and `Customer`
Every module in a distributed architecture is a `Producer` and at the mean time, is a `Customer` too. The communication sequence is:
    (1) `module[A]` want to invoke an `api` of `module[B]`, `module[A]` will send a message to `module[B]`'s `producerQueue`, in that message, information of `module[A]`'s `customerQueue` is attached
    (2) `module[B]` receive that message from `module[A]`, parse the `api` and arguments out, invoke the specified api with those arguments, when finished, `module[B]` send the result back to `module[A]`'s `customerQueue` according to the attached information
    (3) `module[A]` receive the execution result of the invoked api from its `customerQueue` and execute the coresponding `callback`


