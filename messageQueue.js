'use strict';

var nsq = require('nsq.js'),
os = require('os'),
config = {};

function newReader(isWorker) {
	var topic = (isWorker)?config.producerQueue:config.customerQueue;
	var reader = nsq.reader({
		  nsqd: [config.address + ':' + config.readerPort],
		  maxInFlight: config.maxInFlight,
		  maxAttempts: config.maxAttempts,
		  topic: topic,
		  channel: config.channel
		});
	
	reader.on('error', function(err){
		  console.log('[NSQ Service] Reading message error:', err);
	});
	
	reader.on('discard', function(msg){
		  var body = msg.body.toString();
		  console.log('[NSQ Service] topic + ' queue discarding message: %s', body);
		  msg.finish();
	});
	
	reader.on('closed',function(){
		console.log('[NSQ Service] topic + ' queue reader closed');
	});
	return reader;
}

exports.newProducerReader = function(){
	return newReader(true);
};

exports.newCustomerReader = function(){
	return newReader(false);
}

exports.newReader = exports.newProducerReader;

exports.newWriter = function(){
	var writer = nsq.writer(config.address + ':' + config.writerPort);
	writer.on('error', function(err){
		console.log('[NSQ Service] Writing message error:', err);
	});
	writer.on('OK', function(a, b){
		console.log('[NSQ Service] Writer OK message:', a, b);
	});
	writer.on('closed', function(){
		console.log('[NSQ Service] Writer closed');
	});
	return writer;
}

exports.newMsgId = function(){
	return os.hostname() + '_' + process.pid + '_' + new Date() /1000 + '_' + Math.random();
}

exports.producerQueue = config.producerQueue;
exports.customerQueue = config.customerQueue;

exports.setConfig = function(aConfig){
	if(!aConfig) return;
	config = aConfig;
}
