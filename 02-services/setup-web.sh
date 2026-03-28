#!/bin/bash
# Script d'auto-deploiement VM2 - Serveur Web
# Telecharge les fichiers depuis GitHub et configure tout automatiquement

REPO="https://raw.githubusercontent.com/Pm-GUENE/openshift/main"

echo "=== Telechargement de l'application Node.js ==="
mkdir -p /home/fedora/app
curl -sL $REPO/02-services/app/server.js -o /home/fedora/app/server.js
curl -sL $REPO/02-services/app/package.json -o /home/fedora/app/package.json
chown -R fedora:fedora /home/fedora/app

echo "=== Installation des dependances npm ==="
cd /home/fedora/app && npm install

echo "=== Configuration de Nginx ==="
curl -sL $REPO/02-services/nginx/reverse-proxy.conf -o /etc/nginx/conf.d/reverse-proxy.conf
# Desactiver le serveur par defaut de Nginx
sed -i '/^    server {/,/^    }/s/^/#/' /etc/nginx/nginx.conf
systemctl enable nginx
systemctl start nginx

echo "=== Lancement de Node.js ==="
cd /home/fedora/app && node server.js &

echo "=== Deploiement termine ==="
