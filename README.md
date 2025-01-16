1. Create an `.env` file

   Copy the contents of the `.env.sample` file, which contains a list of all the required environment variables, and paste it into a new file named `.env` in the root directory of your project.

   cp .env.sample .env

2. Fill in the values
   Open the .env file and replace the placeholders or example values with your actual configuration values. For example:

   DATABASE_HOST=localhost
   DATABASE_PORT=3000
   DATABASE_USERNAME=my_username
   DATABASE_PASSWORD=my_password

   Make sure to use your actual database host, port, and credentials. Similarly, replace other environment variables as needed for your application.

3. Do not commit .env file
   Ensure that the .env file is not committed to version control (e.g., Git). This is why .env is added to .gitignore by default.

   If you haven't yet done so, add the .env file to .gitignore:

   echo ".env" >> .gitignore

4. Use environment variables in your application
   Once your .env file is properly configured, you can use the environment variables throughout your application using the process.env object in Node.js. For example:

   const databaseHost = process.env.DATABASE_HOST;

5. Example .env.sample
   Here is an example of what the .env.sample file might look like:

   # Database Configuration

   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password

   # API Configuration

   API_KEY=your_api_key

   Ensure that all required environment variables are defined and filled in before starting your application.

   Additional Notes
   Make sure to add your .env file to .gitignore to prevent it from being tracked by Git.
   Never share your .env file with others, as it may contain sensitive information.
