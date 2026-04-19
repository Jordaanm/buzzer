* Figure out deployment strategy
  * Server + Client should be deployed to AWS
  * Ideally, this should be automated via Github Actions

Steps:
1. /grill-me to nail down the details
2. Create the .workflow folder + action.yml
3. Provide AWS credentials as secrets in Github
4. Test the action as a manually invoked workflow
5. Set the action to run on push to main
