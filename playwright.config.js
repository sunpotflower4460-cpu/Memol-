import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({testDir:'./tests',testMatch:'*.spec.js',fullyParallel:true,use:{baseURL:'http://localhost:4173',browserName:'chromium',launchOptions:{executablePath:existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']}},webServer:{command:'npm run preview -- --port 4173',port:4173,reuseExistingServer:!process.env.CI}});
