# gemini-ai-parking

lab homework

# Requirements

-   Node
-   NPM

# How to run backend

1. Make sure `.env` contains `API_KEY` from Gemini API.
2. Install requirements `npm install`.
3. Run `node main.js`.

# How to run frontend

1. Go to frontend folder `cd client-app`
2. Install requirements `npm install`
3. Run `npm start` and wait react to boot up

# How to use parking app

1. Upload an image of a plate number
2. Information in form o ftext will be shown below the image, indicating:
    - New scanned vehicle is entering, this will be stored in a list
    - Scanned vehicle is exiting, this will be removed from the list
3. Images not containing a plate number will be indicated properly
