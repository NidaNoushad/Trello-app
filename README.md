# Trello Real-time WebSockets + API Frontend Assignment
This is a Trello-like app.It includes a **React frontend** and a **Node.js + Express backend** with real-time updates using **WebSockets** and **Trello API**.

## Setup Instructions

### 1. Backend Setup
1. **Expose backend using ngrok** (for webhook testing):
```bash
ngrok http 5000
```

Copy the HTTPS URL shown by ngrok — this will be used later as the Trello webhook callback URL.
Example placeholder: https://YOUR_NGROK_URL/trello-webhook

2. Start the backend server:
```
cd backend
node server.js
```

Backend will run at http://localhost:5000 and is accessible via the ngrok URL for webhook events.

### 2. Frontend Setup
1. Open a new terminal and go to the frontend folder:
```
cd frontend
```
2. Install dependencies (only needed once):
```
npm install
```
3. Start the frontend:
```
npm start
```
Frontend will open at http://localhost:3000.

## Trello API Key & Token
To connect the app to Trello, you need a Trello API key and token. Follow these steps:
1. **Get your Trello API Key**
   - Go to [Trello API Keys](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/).
   - Click **“Generate a new API key”**.
   - Copy the generated key.

2. **Get your Trello Token**
   - On the same page, click **“Generate a token”**.
   - Authorize your Trello account.
   - Copy the token.

3. **Add Key & Token to your backend**

   - In the `backend/` folder, create a `.env` file:
     ```
     TRELLO_KEY=your_trello_api_key
     TRELLO_TOKEN=your_trello_token
     PORT=5000
     ```
   - Replace `your_trello_api_key` and `your_trello_token` with your actual key and token.

## How to Get Trello Board & List IDs
To use this app, you need the Board ID and List IDs from Trello. Follow these steps:
### 1. Create a Board
1. Go to [Trello](https://trello.com) and log in.
2. Create a new board (e.g., "Trello Clone Test").

### 2. Find the Board ID
1. Open your board in the browser.
2. Look at the URL. Example:
https://trello.com/b/AbC123XYZ/my-board-name

3. The part after `/b/` (here `AbC123XYZ`) is your **Board ID**.  
4. Use this in your `.env`:

TRELLO_BOARD_ID=AbC123XYZ

### 3. Create Lists on the Board
1. Inside your board, create lists for `TODO`, `DOING`, and `DONE`.

### 4. Find List IDs
1. Open any list in Trello.
2. Use the Trello API to get the list ID:
```bash
curl -X GET "https://api.trello.com/1/boards/YOUR_BOARD_ID/lists?key=YOUR_KEY&token=YOUR_TOKEN"
```
The response will show each list with its id and name.

Copy the IDs for each list and put them in your .env:

TRELLO_LIST_ID_TODO=<ID of TODO list>

TRELLO_LIST_ID_DOING=<ID of DOING list>

TRELLO_LIST_ID_DONE=<ID of DONE list>

Now your .env file has all the required keys and IDs for the backend to connect to Trello.

## Trello Webhook Registration

To enable real-time updates from Trello, you need to register a webhook pointing to your backend.

### 1. Expose your backend using ngrok
1. Open a terminal / CMD and run:
```bash
ngrok http 5000
```

2. Copy the HTTPS URL shown by ngrok.
Example placeholder: https://YOUR_NGROK_URL/trello-webhook
This URL will allow Trello to send events to your local backend.

3. Register the Trello Webhook
Use cURL or Postman to register the webhook:
```
curl -X POST "https://api.trello.com/1/webhooks/?key=$TRELLO_KEY&token=$TRELLO_TOKEN" \
-d "description=Trello Clone Webhook" \
-d "callbackURL=https://YOUR_NGROK_URL/trello-webhook" \
-d "idModel=$TRELLO_BOARD_ID"
```

Replace YOUR_NGROK_URL with the URL from ngrok.
$TRELLO_KEY, $TRELLO_TOKEN, and $TRELLO_BOARD_ID are from your .env file.

## API Testing

You can test all four required endpoints using **Postman** or **cURL**.
### Postman
- A Postman collection is included in this repo:  
`Trello API.postman_collection.json`  
- Import it into Postman to test:  
  1. Create Card (`POST /api/tasks`)  
  2. Update Card (`PUT /api/tasks/:cardId`)  
  3. Delete Card (`DELETE /api/tasks/:cardId`)  
  4. Create Board (`POST /api/boards`)
 
## demo video included


