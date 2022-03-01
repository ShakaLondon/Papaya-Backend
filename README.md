# PAPAYA PILOT BACKEND

### A hair and beauty review platform, inspired by TrustPilot.


## PROJECT DESCRIPTION

#### This capstone project was the final module I completed at Strive School as part of the Full Stack Development course I completed, and is intended as a final exhibition of all the skills I have gained during my time at Strive School. This is the first project that I have completely conceptualised and executed by myself.

#### I created this project from start to finish, it is a review platform for hair and beauty projects, this is the front end repository for the project. The backend can be found at (https://github.com/ShakaLondon/Papaya-Backend). The project contains a home page, review pages and profile pages and is a work in progress, in the future I intend to add product pages and barcode functionality to search for products. I used ReactJS to create the project and connected it to mongoDB using ExpressJS. The project also uses JWT authentication to register and log in users and a REDUX store to hold user information and various app states across the app. Some elements of the project are connected but I am currently working on connecting all pages and improving navigation through the app, I am also working on connecting search bars to display information from the database.

## TECHNOLOGIES USED

I used HTML, CSS, JAVASCRIPT, NODE, REACT, MONGODB, MONGOOSE and EXPRESS to create this app.

## SCREENSHOTS

#### Papaya Home Page
![Papaya Homepage Screenshot](https://res.cloudinary.com/shakalondon/image/upload/v1646088865/Papaya/Home-Page.png)

#### Papaya Business Review Page
![Papaya Business Review Screenshot](https://res.cloudinary.com/shakalondon/image/upload/v1646088860/Papaya/Business-Review-Page.png)

#### Papaya Category Search Page
![Papaya Category Search Screenshot](https://res.cloudinary.com/shakalondon/image/upload/v1646088862/Papaya/Category-Search-Page.png)

## BEFORE YOU START

##### - Create .env file in projects root folder.
##### - In that .env file input variables:

###### MONGO_CONNECTION="..."
###### JWT_SECRET="..."
###### JWT_EXPIRY="..."
###### JWT_REFRESH_EXPIRY=... (NUMERIC VALUE)

###### CLOUDINARY_NAME=...
###### CLOUDINARY_KEY=...
###### CLOUDINARY_SECRET=...

###### PORT=3005


## AVAILABLE SCRIPTS

###### In the project directory, you can run:

```npm run dev```

###### Will start express app with development environment variables.
###### Open http://localhost:3005 to view it in your browser.
