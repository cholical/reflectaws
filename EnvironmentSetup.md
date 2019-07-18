Serverless Dev Environment Set Up

1. Install AWS cli 
2. Generate AWS credentials via the management console
3. Run 'aws cli configure' and fill out correct info 
4. Install Serverless using 'npm install -g serverless'
5. Navigate to the function folder
6. Run 'npm install' to install node modules
7. Fill out the correct environment variables for Twilio and MongoDB in serverless.yaml
8. In the function folder run 'serverless deploy -v' to deploy changes