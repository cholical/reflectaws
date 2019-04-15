## Mongo-Test

Functions for mongo queries, inserts, and updates

#### Run Lambda
1. ```npm install -g serverless```
2. ```npm install```
3. Fill missing config Values for [serverless.yaml](serverless.yaml)
```yaml
provider:
  name: aws
  runtime: nodejs8.10
  stage: dev
  region: us-east-2
  environment:
    TwilioAccountSid: 
    TwilioAuthToken: 
    MONGODB_URI: 
```
3. ```serverless deploy```
4. For code changes: ```serverless deploy -f app```
5. For yaml/infra changes: ```serverless deploy```

This will update existing AWS Lambda function with your changes

---



#### Connect to MongoDB

MongoDB is running in an EC2 instance.

##### Steps to Connect through Mongo Shell
1. Enable SSH with your IP for the default security group (Ohio region)
2. Download key for EC2
3. ```ssh -vvv -i ./ec2-document-key.pem <USER>@<PASSWORD>@<EC2ADRESS>.us-east-2.compute.amazonaws.com```
4. ```mongo ```

##### Steps to Connect through Robo 3T
1. Enable SSH with your IP for the default security group in your region (Ohio)
2. Fill connection information, see slack channel





