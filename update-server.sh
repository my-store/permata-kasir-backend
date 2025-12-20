#!/bin/bash

# For to terminate PM2 process
pm2 stop permata-kasir-backend

# Force to restore un-staged
git restore .

# Make a pull request and force to rebase (linear)
git pull --rebase

# Re-build the app
npm run build

# Restart PM2 process
pm2 start permata-kasir-backend