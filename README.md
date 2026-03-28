# Déploiement d'une architecture réseau 3-tiers virtualisée sur OpenShift

## Description
Ce projet déploie une architecture réseau multi-VM sur OpenShift Virtualization (KubeVirt),
reproduisant un environnement d'entreprise composé d'une passerelle/firewall, d'un serveur web
et d'un serveur de base de données. Chaque VM est provisionnée depuis GitHub et configurée
pour communiquer selon une topologie LAN/DMZ sécurisée.

## Architecture

```
Internet (NAT)
      │
      ▼
┌─────────────────┐
│  VM1 - Passerelle│  (Fedora + iptables)
│  Firewall        │
└────┬────────┬────┘
     │        │
  Service   Service
   DMZ       LAN
     │        │
     ▼        ▼
┌─────────┐ ┌─────────┐
│ VM2 Web │ │ Pod MySQL│
│ Nginx + │ │ (appdb) │
│ Node.js │ │         │
└─────────┘ └─────────┘
```

## Composants

| Composant | Type | Rôle |
|-----------|------|------|
| vm1-passerelle | VM KubeVirt | Firewall iptables, routage IP |
| vm2-serveur-web | VM KubeVirt | Nginx reverse proxy + API Node.js |
| mysql-deployment | Pod K8s | Base de données MySQL 8.0 |
| service-dmz | Service K8s | Réseau DMZ (ports 80, 443, 3000) |
| service-lan | Service K8s | Réseau LAN (port 3306) |
| service-passerelle | Service K8s | Accès passerelle (ports 80, 443) |

## Adaptations OpenShift Sandbox
- **Limite 2 VMs** : MySQL déployé en Pod au lieu d'une 3ème VM
- **Pas de Multus** : Services Kubernetes pour simuler les réseaux DMZ/LAN
- **Cloud-init < 2048 octets** : Scripts de setup téléchargés depuis GitHub
- **NetworkPolicies** : Isolation réseau au niveau Kubernetes

## Structure du dépôt

```
├── 01-virtualisation/
│   ├── vm1-passerelle.yaml       # VM Firewall/Passerelle
│   ├── vm2-serveur-web.yaml      # VM Serveur Web
│   └── mysql-deployment.yaml     # Pod MySQL
├── 02-services/
│   ├── service-dmz.yaml          # Réseau DMZ
│   ├── service-lan.yaml          # Réseau LAN
│   ├── service-passerelle.yaml   # Service Passerelle
│   ├── app/
│   │   ├── server.js             # API Node.js
│   │   └── package.json          # Dépendances Node.js
│   ├── nginx/
│   │   └── reverse-proxy.conf    # Config Nginx
│   └── setup-web.sh              # Script auto-déploiement VM2
├── 03-reseau/
│   ├── networkpolicy-mysql.yaml  # Isolation MySQL
│   └── networkpolicy-web.yaml    # Protection serveur web
├── .github/workflows/
│   └── deploy.yaml               # CI/CD GitHub Actions
└── README.md
```

## Déploiement rapide

### 1. Cloner le dépôt
```bash
git clone https://github.com/Pm-GUENE/openshift.git
cd openshift
```

### 2. Déployer les services réseau
```bash
oc apply -f 02-services/service-dmz.yaml
oc apply -f 02-services/service-lan.yaml
oc apply -f 02-services/service-passerelle.yaml
```

### 3. Déployer MySQL
```bash
oc apply -f 01-virtualisation/mysql-deployment.yaml
```

### 4. Déployer les VMs
```bash
oc apply -f 01-virtualisation/vm1-passerelle.yaml
oc apply -f 01-virtualisation/vm2-serveur-web.yaml
```

### 5. Appliquer les politiques réseau
```bash
oc apply -f 03-reseau/networkpolicy-mysql.yaml
oc apply -f 03-reseau/networkpolicy-web.yaml
```

## Validation
```bash
# Tester le status de l'app
curl http://localhost/status
# Réponse attendue : {"server":"OK","database":"OK"}

# Ajouter un utilisateur
curl -X POST http://localhost/users \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","email":"test@example.com"}'

# Lister les utilisateurs
curl http://localhost/users
```

## Auteur
- **Namespace** : pmguene-dev
- **Plateforme** : OpenShift Developer Sandbox
- **Cours** : Projet de fin de module - Dr. BABOU
