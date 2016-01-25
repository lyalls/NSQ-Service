Introduction
============


Quick Start
-----------
1. Understand configs
```javascript
nsqConfig: {
	address: '127.0.0.1', 	   // NSQ server address
	writerPort: 4150,          // NSQ writer port, default is 4150
	readerPort: 4150,	   // NSQ reader port, default is 4150
	maxInFlight: 1,            // NSQ parameter `maxInFlight`
	maxAttempts: 5,            // NSQ parameter `maxAttempts`
	producerQueue: 'auth',     // Define the name of `producer` queue
	customerQueue: 'auth-cust',// Define the name of `customer` queue
	channel: 'main'            // Default NSQ Channel is `main`
}
```

