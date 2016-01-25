'use strict';

var _ = require('lodash'), 
MQ = require('./messageQueue'),
managers = {
};

var callbackForMessage = {},
writer = null,
customerReader = null,
producerReader = null;

module.exports = {
		ready: function(callbackWhenReady){
			writer = MQ.newWriter();
			writer.on('ready', function(){
				producerReader = MQ.newProducerReader();
				producerReader.on('ready', function(){
					customerReader = MQ.newCustomerReader();
					
					customerReader.on('ready', function(){
						// proxy message to managers 
						producerReader.on('message', function(msg){
							try{
								var msgObj = JSON.parse(msg.body.toString());
								console.log('[NSQ Service] MQ.producerQueue + ' queue reading msg:', JSON.stringify(msgObj));

								if(msgObj.api && msgObj.id && msgObj.customerQueue && msgObj.data){
									msg.finish();
									var resMsg = {
											id: msgObj.id
									}
									var response = function(resMsg){
										console.log('[NSQ Service] publishing to queue: ', msgObj.customerQueue +' a message: '+JSON.stringify(resMsg));
										writer.publish(msgObj.customerQueue, resMsg);
									}
									if(managers[msgObj.module] && managers[msgObj.module][msgObj.api] && typeof(managers[msgObj.module][msgObj.api]) === 'function'){
										managers[msgObj.module][msgObj.api](msgObj.data, function(err, data){
											if(err){
												resMsg.error = err;
											}else{
												resMsg.data = data;	
											}	
											response(resMsg);
										})
									}else{
										resMsg.error = 'Illegal api request '+msgObj.module+'.'+msgObj.api+' in queue: '+MQ.producerQueue;
										response(resMsg);
									}
								}else{
									msg.finish();
								}
							}catch(e){
								console.log('[NSQ Service] MQ.producerQueue + ' queue error when reading message:', e);
								msg.finish();
								//callback(MQ.producerQueue + ' queue error when reading message:' + e);
							}
						});
						// Handle response messages for co-operation
						customerReader.on('message', function(msg){
							try{
								var msgObj = JSON.parse(msg.body.toString());
								console.log('[NSQ Serviec] MQ.customerQueue + ' queue reading msg:', JSON.stringify(msgObj));
								if(msgObj.id && callbackForMessage[msgObj.id]){
									callbackForMessage[msgObj.id](msgObj.error, msgObj.data);
									delete callbackForMessage[msgObj.id];
									msg.finish();
								}else{
									msg.requeue();
								}
							}catch(e){
								console.log('[NSQ Service] Error when reading message:', e);
								msg.finish();
								//callback('Error when reading message:' + e);
							}
						});
						// Message Queue is ready
						callbackWhenReady();
					});
				});

			})
		},

		cooperate: function(producerQueue, module, api, data, callback){
			if(!producerQueue || !api || !data){
				return callback('fatal error: no target queue or api or message data');
			}
			var reqMsg = {
					module: module,
					api: api,
					data: data,
					id: MQ.newMsgId(),
					customerQueue: MQ.customerQueue
			};
			callbackForMessage[reqMsg.id] = callback;
			writer.publish(producerQueue, reqMsg);
		},

		loadManager: function(name, manager){
			managers[name] = manager;
		}
}
