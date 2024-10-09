# Cosmic Simulation
## What is this Repository?
This Repository contains the Source Code for the Nightsky-Project and the SkySim-Project. 

### Nightsky
Nightsky is a Web-Application with which Celestial Constellations and their drift over long periods of time can be simulated. 

### SkySim
SkySim is a Web-Application with which artificial and real Solar-Systems can be simulated. 

## How to start this Project

### Start Nightsky

Nightsky is a Vanilla-JavaScript Application and thus can directly be served using any Web-Server, we recommend using [Apache](https://httpd.apache.org/docs/trunk/getting-started.html). 
Alternatively, the `Nightsky/index.html`-File can be opened locally using a Web-Browser. 

### Start SkySim

SkySim is a React-Application and thus needs to be started including ReactJS. You can alternatively generate a Production-Build of SkySim for Deployment on a Web-Server. 

1. Install [NodeJS](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-installer-to-install-nodejs-and-npm)
2. Navigate into the Directory `SkySim/`
3. Run `npm install` to install all dependencies
4. Run `npm start` to start the Development build of SkySim
5. Optionally: Run `npm run-script build` to generate a Production-Build of SkySim