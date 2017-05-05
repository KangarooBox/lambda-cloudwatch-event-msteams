# lambda-cloudwatch-event-msteams

An [AWS Lambda](http://aws.amazon.com/lambda/) function for better MS Teams notifications generated from CloudWatch
events. This work is a direct descendant of [lambda-cloudwatch-slack](https://github.com/assertible/lambda-cloudwatch-slack)
and wouldn't be possible without it.

[![BuildStatus](https://travis-ci.org/KangarooBox/lambda-cloudwatch-msteams.png?branch=master)](https://travis-ci.org/assertible/lambda-cloudwatch-msteams)
[![NPM version](https://badge.fury.io/js/lambda-cloudwatch-msteams.png)](http://badge.fury.io/js/lambda-cloudwatch-msteams)


## Overview

This function was originally derived from the
[lambda-cloudwatch-slack](https://github.com/assertible/lambda-cloudwatch-slack) project which was originally derived
from the [AWS blueprint named `cloudwatch-alarm-to-msteams`](https://aws.amazon.com/blogs/aws/new-msteams-integration-blueprints-for-aws-lambda/).
The function in this repo allows CloudWatch Events to generate MS Teams notifications.

![Deleting an ACCESS KEY](https://github.com/assertible/lambda-cloudwatch-msteams/raw/master/images/delete_access_key.png)

## Configuration

Clone this repository then follow the steps below:

1. Open your MS Teams client and choose a channel to receive your notifications
1. Go to the options screen for that channel and choose "Connectors"
1. Select the "Incoming Webhook" connector, fill in the options and hit the "Create" button
1. Copy the URL to your clipboard and save the connector
1. Copy the ``env.environment`` file to ``.env``
1. Open the ``.env`` file in your editor and update the values inside
11. The WEBHOOK_URL is the URL you copied to your clipboard in an earlier step
11. The COLOR_??? values can be changed as you see fit

## Tests

With the variables filled in, you can test the function:

```
npm install
npm test
```

## License

MIT License
