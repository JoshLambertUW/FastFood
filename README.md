# FastFood

A website where users can discover deals for local restaurants.

## Features:

Deals
* Users can browse all deals or deals for specific restaurants
* Deals can be sorted by popularity, age, or expiring soon
* Registered users can post new deals and suggest new restaurants
* Registers users can also vote on deals and post comments
  
Profiles
* Secure authentication system using Passport
* Users can add restaurants to favorites
* Users can view list of personalized coupons and coupons they've posted
  
Restaurants
* Each restaurant page displays its name, website, mobile apps, and list of coupons
* A restaurant locator uses Google Maps to display nearby locations
  
  
## Tech:

This site is built using the MEAN stack.

* MongoDB using Mongoose ODM for Node.js
* Express for the back-end
* AngularJS for the front-end
* Node.js

## Usage:

First, navigate to the project directory and install the dependencies:

```sh
npm install
```

Then create an .env file with the following variables or replace them in App.js:

* **SESSION_SECRET**: A random key that will be used for Express Session
* **MongoDB**: Your MongoDB URL
* **MAPS_KEY**: Your Google Maps API Key

Finally, start the server with:

```sh
npm start
```

You can also start the server with nodemon while in development:

```sh
nodemon app.js
```  

Test data may be added to the database by running:

```sh
node populateMongo <your mongodb url>
```  
