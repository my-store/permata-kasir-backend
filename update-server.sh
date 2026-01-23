#!/bin/bash

# Hentikan proses daemon aplikasi
pm2 stop permata-kasir-backend

# Jika ada perubahan, batalkan perubahan dan ambil file terbaru dari github,
# jika tidak melakukan ini, proses "git pull" akan menghasilkan error.
git restore .

# Ambil update terbaru dari github
git pull --rebase

# Jalanakan script install, barangkali ada penambahan module baru pada update
npm install

# Compile aplikasi
npm run build

# Nyalakan ulang proses daemon aplikasi
pm2 start permata-kasir-backend