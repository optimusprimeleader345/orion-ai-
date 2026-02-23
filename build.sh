#!/bin/bash
cd ai-system/frontend
npm install
npx tsc --noEmit
npm run build
