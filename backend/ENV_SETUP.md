# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `backend` folder with the following content:

```
JWT_SECRET=107ddec3e93d841d5136768b9a7b6240b9778903d687a4e5d050d247e12a9c06
MONGO_URI=your_mongodb_connection_string_here
```

## Steps to Create .env File

1. Navigate to the `backend` folder
2. Create a new file named `.env` (make sure it starts with a dot)
3. Add the JWT_SECRET and MONGO_URI values
4. Save the file
5. Restart your server

## Important Notes

- Never commit the `.env` file to version control
- The `.env` file should be in your `.gitignore`
- Make sure `.env` is in the same directory as `package.json`

