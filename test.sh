#!/bin/sh

cd src/app/client/
npm install @angular/cli
npm install
ng lint
ng build --prod
npm run test-coverage