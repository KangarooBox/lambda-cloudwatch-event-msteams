var AWS = require('aws-sdk');
var url = require('url');
var https = require('https');
var config = require('./config');

const WEBHOOK_URL = config.WEBHOOK_URL;
const COLOR_DANGER = config.COLOR_DANGER;
const COLOR_WARNING = config.COLOR_WARNING;
const COLOR_OK = config.COLOR_OK;

// Post the message to the chat URL
var postMessage = function(message, callback) {
  var body = JSON.stringify(message);
  var options = url.parse(WEBHOOK_URL);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };

  var postReq = https.request(options, function(res) {
    var chunks = [];
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      return chunks.push(chunk);
    });
    res.on('end', function() {
      var body = chunks.join('');
      if (callback) {
        callback({
          body: body,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage
        });
      }
    });
    return res;
  });

  postReq.write(body);
  postReq.end();
};

// Format the message for IAM events
var handleIAM = function(event, context) {
  var subject = "AWS IAM Notification";
  var detail = event.detail;
  var message = { 'summary': subject, 'sections': [] };

  try {
    message['title'] = `${subject} - account ${event.account}`;

    // Decode the important details of the event...
    var event_details = { 'facts':[] };
    switch(detail.eventName.split(/(?=[A-Z])/)[0]){
      case "Create":
        message['themeColor'] = COLOR_DANGER;
        event_details['facts'].push( { 'name': 'Event Name', 'value': detail.eventName });
        event_details['facts'].push( { 'name': 'Actor', 'value': `${detail.userIdentity.userName} (${detail.userIdentity.type})` });
        event_details['facts'].push( { 'name': 'Affected User', 'value': detail.requestParameters.userName });
        break;

      case "Delete":
        message['themeColor'] = COLOR_OK;
        event_details['facts'].push( { 'name': 'Event Name', 'value': detail.eventName });
        event_details['facts'].push( { 'name': 'Actor', 'value': `${detail.userIdentity.userName} (${detail.userIdentity.type})` });
        event_details['facts'].push( { 'name': 'Affected User', 'value': detail.requestParameters.userName });
        break;

      case "Start":
        message['themeColor'] = COLOR_OK;
        event_details['facts'].push( { 'name': 'Event Name', 'value': detail.eventName } );
        event_details['facts'].push( { 'name': 'Actor', 'value': `${detail.userIdentity.sessionContext.sessionIssuer.userName} (${detail.userIdentity.type})`} );
        break;

      default:
        message['themeColor'] = COLOR_WARNING;
        break;
    }

    // Add in some common facts...
    event_details['facts'].push( { 'name': 'Event ID', 'value': `[${detail.eventID}](https://console.aws.amazon.com/cloudtrail/home?region=${event.region}#/events?EventId=${detail.eventID})` });
    event_details['facts'].push( { 'name': 'Region', 'value': detail.awsRegion });

    message['sections'].push(event_details);
  } catch(e) {
    message = processError(e, event);
  }

  return message;
};

// Build a suitable error message
var processError = function(e, event){
  var message = { 'summary': 'Error processing event', 'sections': [] };
  message['title'] = message['summary'];
  message['themeColor'] = COLOR_DANGER;

  var error_details = {};
  error_details['title'] = "Error Details";
  error_details['facts'] = [
    { 'name': 'NodeJS', 'value': `> "${e}"` },
    { 'name': 'Event', 'value': `> ${JSON.stringify(event)}` }
  ];
  message['sections'].push(error_details);

  return message;
};

// Main handler
exports.handler = function(event, context, callback) {
  // console.log("sns received:" + JSON.stringify(event, null, 2));
  var message = null;

  switch(event.source) {
    case "aws.iam":
      console.log("processing IAM notification...");
      message = handleIAM(event,context);
      break;
    default:
      console.log("processing unknown notification...");
      message = processError(null, event);
  }

  postMessage(message, function(response) {
    if (response.statusCode < 400) {
      callback(null, 'message posted successfully');
    } else if (response.statusCode < 500) {
      // Don't retry because the error is due to a problem with the request
      callback(null, `error posting message to API: ${response.statusCode} - ${response.statusMessage}`);
    } else {
      // Let Lambda retry
      callback(`server error when processing message: ${response.statusCode} - ${response.statusMessage}`);
    }
  });
};
