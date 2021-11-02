# TXN-Wallet

## Demo
https://serene-brattain-268de5.netlify.app/

## Client
$ cd Client
$ npm i 
$ npm start

## Server
$ cd Server
$ npm i 
$ npm start

## Build Android App (Requires Cordova and Java)
$ cd Client
$ npm run build
(due to tailwindcss being used and cordova not working well with post-css, copy the css chunk from build/static/css and replace all contents in src/index.css)

$ npm install -g cordova
$ npm i
$ cordova platform add android
$ cordova build android
