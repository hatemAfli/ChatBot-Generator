# Architecture Backend - Générateur de Chatbots

## 📋 Vue d'ensemble du projet

Ce projet est un **générateur de chatbots pour sites web** qui permet aux utilisateurs de créer, configurer et déployer des chatbots personnalisés sur leurs sites web. Les visiteurs peuvent interagir avec ces chatbots pour obtenir des réponses basées sur le contenu spécifique du site.

---

## 🏗️ Architecture globale

Le backend suit une **architecture REST API modulaire** avec séparation des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE BACKEND                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │──────│   Backend    │──────│ Service AI   │
│   (React)    │ HTTP │  (Node.js)   │ HTTP │  (FastAPI)   │
└──────────────┘      └──────────────┘      └──────────────┘
                            │
                            │
                      ┌──────────────┐
                      │  PostgreSQL  │
                      │  (Drizzle)   │
                      └──────────────┘
```

---

## 📁 Structure du dossier backend

```
backend/
├── src/
│   ├── config/          # Configuration (connexion DB)
│   ├── controllers/     # Logique métier (CRUD, auth, chat)
│   ├── db/              # Schéma DB et relations
│   ├── middleware/      # Authentification et autorisation
│   ├── routes/          # Définition des routes API
│   ├── public/          # Fichiers statiques (bots générés)
│   └── index.ts         # Point d'entrée (Express server)
├── drizzle/             # Migrations de base de données
├── scripts/             # Scripts utilitaires (seed)
└── package.json         # Dépendances et scripts
```

---

## 🔧 Technologies utilisées

| Composant            | Technologie        | Rôle                                      |
| -------------------- | ------------------ | ----------------------------------------- |
| **Framework**        | Express.js 5.1     | Serveur HTTP REST API                     |
| **Language**         | TypeScript         | Typage statique, meilleure maintenabilité |
| **ORM**              | Drizzle ORM 0.44   | Abstraction base de données, migrations   |
| **Base de données**  | PostgreSQL         | Stockage relationnel                      |
| **Authentification** | JWT (jsonwebtoken) | Tokens d'accès et refresh                 |
| **Sécurité**         | bcrypt             | Hashage des mots de passe                 |
| **Communication**    | Axios              | Appels HTTP vers service AI               |
| **Email**            | Nodemailer         | Envoi d'invitations                       |
| **Fichiers**         | fs-extra           | Génération de fichiers JS pour bots       |

---

## 🗄️ Modèle de données (Base de données)

### Schéma relationnel

```
┌─────────────┐
│   users     │ (Utilisateurs du système)
│─────────────│
│ id (PK)     │
│ email       │
│ role        │──┐
│ motdepasse  │  │
│ nom, prenom │  │
└─────────────┘  │
                 │
┌─────────────┐  │  ┌──────────────┐
│    bots     │  │  │  invitation  │
│─────────────│  │  │──────────────│
│ idBot (PK)  │  │  │ tokenHash    │
│ name        │  │  │ email        │
│ status      │  │  │ role         │
│ ownerId (FK)├──┘  │ expireAt     │
│ createdAt   │     └──────────────┘
└─────────────┘
      │
      ├──┐
      │  │
┌─────┴──┴──────────┐
│    userBot        │ (Table de liaison many-to-many)
│───────────────────│
│ userId (FK)       │
│ botId (FK)        │
└───────────────────┘
      │
      │
┌─────┴──────────────┐
│   bot_configs      │ (Configuration du bot)
│────────────────────│
│ cnfigId (PK)       │
│ botId (FK)         │
│ generalJson        │ ← Nom, domaine d'expertise, etc.
│ designeJson        │ ← Couleurs, style, icônes
│ behaviorJson       │ ← Comportement, réponses
│ sourcesJson        │ ← Sources de données (RAG)
│ fromJson           │ ← Informations de contact
└────────────────────┘
      │
      │
┌─────┴──────────────┐
│   conversation     │ (Sessions de chat)
│────────────────────│
│ idConversation(PK) │
│ botId (FK)         │
│ startedAt          │
│ local              │
└────────────────────┘
      │
      │
┌─────┴──────────────┐
│     messages       │ (Messages échangés)
│────────────────────│
│ idMessages (PK)    │
│ conversationId(FK) │
│ content            │
│ sourcesJson        │ ← Sources utilisées (RAG)
│ latencyMs          │
└────────────────────┘

┌────────────────────┐
│ refresh_tokens     │ (Tokens de rafraîchissement)
│────────────────────│
│ id (PK)            │
│ userId (FK)        │
│ token              │
│ createdAt          │
└────────────────────┘

┌────────────────────┐
│ statistics_daily   │ (Statistiques quotidiennes)
│────────────────────│
│ statisticsId (PK)  │
│ botId (FK)         │
│ data               │
│ sessions           │
│ escalations        │
└────────────────────┘
```

### Rôles utilisateurs (RBAC)

- **superadmin** : Accès complet, gestion des utilisateurs
- **admin** : Gestion des bots et configurations
- **analyste** : Consultation et analyse

---

## 🔄 Flux de données complet

### 1. **Flux d'authentification**

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│Frontend │                    │ Backend │                    │   DB    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ POST /auth                   │                              │
     │ {email, motdepasse}          │                              │
     ├─────────────────────────────>│                              │
     │                              │ SELECT * FROM users          │
     │                              │ WHERE email = ?              │
     │                              ├─────────────────────────────>│
     │                              │<─────────────────────────────┤
     │                              │                              │
     │                              │ bcrypt.compare()             │
     │                              │                              │
     │                              │ generateAccessToken()        │
     │                              │ generateRefreshToken()       │
     │                              │                              │
     │                              │ INSERT refresh_tokens        │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │<─────────────────────────────┤                              │
     │ {accessToken}                │                              │
     │ Set-Cookie: jwt=refreshToken │                              │
     │                              │                              │
```

**Fichiers impliqués :**

- `controllers/authController.ts` : Gère la connexion
- `controllers/utils.ts` : Génère les tokens JWT
- `middleware/verifyJwt.ts` : Vérifie les tokens sur les routes protégées

---

### 2. **Flux de création et configuration d'un bot**

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│Frontend │                    │ Backend │                    │   DB    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ POST /bots                   │                              │
     │ {name, status, owner_id}     │                              │
     ├─────────────────────────────>│                              │
     │                              │ INSERT INTO bots             │
     │                              ├─────────────────────────────>│
     │                              │<─────────────────────────────┤
     │<─────────────────────────────┤                              │
     │ {idBot, name, status, ...}   │                              │
     │                              │                              │
     │ POST /botConfigs              │                              │
     │ {generalJson, designeJson,   │                              │
     │  behaviorJson, sourcesJson,  │                              │
     │  bot_id}                     │                              │
     ├─────────────────────────────>│                              │
     │                              │ INSERT INTO bot_configs      │
     │                              ├─────────────────────────────>│
     │                              │<─────────────────────────────┤
     │<─────────────────────────────┤                              │
     │ {cnfigId, ...}               │                              │
```

**Fichiers impliqués :**

- `controllers/botsController.ts` : CRUD des bots
- `controllers/botConfigsController.ts` : CRUD des configurations
- `db/schema.ts` : Définition des tables

**Structure de `botConfigs` :**

- **generalJson** : Nom du bot, domaine d'expertise, description
- **designeJson** : Couleurs (primaire, secondaire, neutre), taille police, icônes, animations
- **behaviorJson** : Comportement, réponses par défaut, personnalité
- **sourcesJson** : **Sources pour RAG** (URLs, fichiers, bases de connaissances)
- **fromJson** : Informations de contact (email, téléphone)

---

### 3. **Flux de chat (RAG - Retrieval-Augmented Generation)**

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  Site   │      │ Backend │      │Service │      │   DB    │
│  Web    │      │         │      │  AI    │      │         │
└────┬────┘      └────┬────┘      └────┬────┘      └────┬────┘
     │                │                │                │
     │ POST /chat/:botId               │                │
     │ {message: "..."}                │                │
     ├───────────────>│                │                │
     │                │ SELECT bot_configs              │
     │                │ WHERE botId = ?                 │
     │                ├───────────────────────────────>│
     │                │<───────────────────────────────┤
     │                │                                │
     │                │ POST /predict                   │
     │                │ {botConfig, message}            │
     │                ├───────────────────────────────>│
     │                │                                │
     │                │                                │ RAG Process:
     │                │                                │ 1. Extract sourcesJson
     │                │                                │ 2. Retrieve relevant docs
     │                │                                │ 3. Generate context
     │                │                                │ 4. Call OpenAI API
     │                │                                │ 5. Return response
     │                │<───────────────────────────────┤
     │                │                                │
     │                │ INSERT INTO conversation       │
     │                │ INSERT INTO messages           │
     │                ├───────────────────────────────>│
     │                │                                │
     │<───────────────┤                                │
     │ {message: "..."}                                │
```

**Fichiers impliqués :**

- `controllers/chatController.ts` : Reçoit le message, récupère la config, appelle le service AI
- `servicePython/service.py` : Traite le message avec RAG et OpenAI

**Processus RAG détaillé :**

1. **Récupération de la configuration** : Le backend récupère `botConfig` depuis PostgreSQL
2. **Extraction des sources** : Le service AI lit `sourcesJson` (URLs, fichiers, etc.)
3. **Retrieval (Récupération)** :
   - Les sources sont indexées/vectorisées (embeddings)
   - Recherche sémantique des documents pertinents pour la question
4. **Augmentation** : Le contexte récupéré est ajouté au prompt
5. **Generation** : OpenAI génère la réponse basée sur le contexte + question
6. **Retour** : La réponse est renvoyée au backend puis au site web

**Note** : Le service Python actuel semble être une version simplifiée. Un système RAG complet nécessiterait :

- Un vector store (Pinecone, Weaviate, ou FAISS)
- Des embeddings (OpenAI embeddings, ou sentence-transformers)
- Un système de chunking des documents
- Une recherche de similarité vectorielle

---

### 4. **Flux de publication d'un bot**

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│Frontend │                    │ Backend │                    │ File    │
│         │                    │         │                    │ System  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ POST /bots/:id/publish        │                              │
     ├─────────────────────────────>│                              │
     │                              │ SELECT bot_configs          │
     │                              │ WHERE botId = ?              │
     │                              │                              │
     │                              │ generateJs(botId, designConf)│
     │                              │                              │
     │                              │ writeFile(                  │
     │                              │   "public/bot-{id}.js"      │
     │                              │ )                            │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │<─────────────────────────────┤                              │
     │ HTML snippet:                │                              │
     │ <script src="...bot-{id}.js">│                              │
     │ <link rel="stylesheet"...>   │                              │
```

**Fichiers impliqués :**

- `controllers/publishBotController.ts` : Génère le fichier JS du bot
- `src/public/bot-{id}.js` : Fichier généré (widget JavaScript)

**Ce que fait le fichier généré :**

- Crée un widget chatbot sur le site web
- Applique le design personnalisé (couleurs, style)
- Gère l'ouverture/fermeture du chat
- Envoie les messages au backend via `/chat/:botId`
- Affiche les réponses du bot

---

## 📦 Composants détaillés

### 1. **Configuration (`src/config/`)**

**`dbConn.ts`** : Connexion à PostgreSQL via Drizzle ORM

```typescript
const db = drizzle(process.env.DATABASE_URL!, { logger: true });
```

---

### 2. **Contrôleurs (`src/controllers/`)**

#### **`authController.ts`**

- **`handleLogin`** : Authentification utilisateur
  - Vérifie email/mot de passe (bcrypt)
  - Génère access token (15min) et refresh token (7j)
  - Stocke refresh token en DB et cookie HTTP-only

#### **`refreshTokenController.ts`**

- Rafraîchit l'access token à partir du refresh token

#### **`botsController.ts`**

- **`createBot`** : Crée un nouveau bot
- **`getBotsOfUser`** : Liste les bots d'un utilisateur avec leurs configs
- **`getAllBots`** : Liste tous les bots
- **`getBotById`** : Récupère un bot par ID
- **`updateBot`** : Met à jour un bot
- **`deleteBot`** : Supprime un bot (cascade)
- **`publish`** : Génère le fichier JS du bot

#### **`botConfigsController.ts`**

- **`createBotConfig`** : Crée une configuration
- **`getBotConfigByBotId`** : Récupère la config d'un bot
- **`updateBotConfig`** : Met à jour la config
- **`deleteBotConfig`** : Supprime la config

#### **`chatController.ts`**

- **`chatWithMe`** : Point d'entrée pour les messages
  - Récupère `botConfig` depuis la DB
  - Appelle le service AI (`http://localhost:8000/predict`)
  - Retourne la réponse au client

#### **`inviteUserController.ts`**

- Envoie une invitation par email avec token

#### **`accpetInvitationController.ts`**

- Accepte l'invitation et crée le compte utilisateur

#### **`usersController.ts`**

- CRUD des utilisateurs

#### **`utils.ts`**

- **`generateAccessToken`** : Génère JWT access token
- **`generateRefreshToken`** : Génère JWT refresh token

---

### 3. **Middleware (`src/middleware/`)**

#### **`verifyJwt.ts`**

- Vérifie le JWT dans le header `Authorization: Bearer <token>`
- Extrait `userId` et `role` et les ajoute à `req`
- Protège les routes nécessitant une authentification

#### **`verifyRoles.ts`**

- Vérifie que l'utilisateur a le rôle requis (RBAC)
- Exemple : `verifyRole('admin', 'superadmin')`

---

### 4. **Routes (`src/routes/`)**

#### **`botsRouter.ts`**

```
POST   /bots              → createBot
GET    /bots              → getAllBots
GET    /bots/:id          → getBotById
PUT    /bots/:id          → updateBot
DELETE /bots/:id          → deleteBot
POST   /bots/:id/publish  → publish
GET    /bots/user/:id     → getBotsOfUser
```

#### **`botConfigsRouter.ts`**

```
POST   /botConfigs        → createBotConfig (admin+)
GET    /botConfigs        → getAllBotConfigs
GET    /botConfigs/:id    → getBotConfigByBotId
PUT    /botConfigs/:id    → updateBotConfig (admin+)
DELETE /botConfigs/:id    → deleteBotConfig (admin+)
```

#### **`usersRouter.ts`**

```
POST   /users             → createUser
GET    /users             → getAllUsers
PUT    /users/:id         → updateUser
DELETE /users/:id         → deleteUser
```

---

### 5. **Point d'entrée (`src/index.ts`)**

**Configuration Express :**

- CORS configuré pour frontend (localhost:5173)
- Middleware JSON parser
- Cookie parser pour refresh tokens
- Servir fichiers statiques depuis `/static`

**Routes principales :**

```typescript
POST   /auth              → handleLogin
GET    /refreshToken      → handleRefreshToken
POST   /auth/invite       → inviteUser
POST   /auth/accepte      → accpetInvitation
GET    /logout            → handleLogout
POST   /chat/:botId       → chatWithMe
GET    /static/*          → Fichiers statiques (bots générés)
```

---

## 🔐 Sécurité

1. **Authentification JWT** :

   - Access token : 15 minutes (dans le body de la réponse)
   - Refresh token : 7 jours (dans cookie HTTP-only, sécurisé)

2. **Hashage des mots de passe** : bcrypt

3. **RBAC (Role-Based Access Control)** : Vérification des rôles sur les routes sensibles

4. **CORS** : Origines autorisées configurées

5. **Cascade de suppression** : Suppression en cascade des données liées (foreign keys)

---

## 🚀 Processus complet : De la création à l'utilisation

### Étape 1 : Création d'un bot

1. Utilisateur se connecte (`POST /auth`)
2. Crée un bot (`POST /bots`) → Retourne `idBot`
3. Configure le bot (`POST /botConfigs`) :
   - Définit le nom, domaine d'expertise
   - Choisit les couleurs, style
   - Ajoute les sources (URLs, fichiers) pour RAG
   - Configure le comportement

### Étape 2 : Publication

1. Publie le bot (`POST /bots/:id/publish`)
2. Backend génère `bot-{id}.js` dans `public/`
3. Retourne le snippet HTML à intégrer sur le site

### Étape 3 : Utilisation sur le site web

1. Le site charge le script `bot-{id}.js`
2. Le widget s'affiche avec le design personnalisé
3. Visiteur envoie un message
4. Le widget appelle `POST /chat/:botId`
5. Backend récupère la config et appelle le service AI
6. Service AI fait le RAG et génère la réponse
7. Réponse retournée au widget et affichée

---

## 📊 Statistiques et monitoring

La table `statistics_daily` permet de suivre :

- Nombre de sessions par jour
- Nombre d'escalations (transferts vers humain)
- Par bot

---

## 🔄 Intégration avec le service AI (Python)

Le service Python (`servicePython/service.py`) reçoit :

```json
{
  "message": "Question de l'utilisateur",
  "botConfig": {
    "generalJson": { "domaines_expertise": [...] },
    "sourcesJson": { "urls": [...], "files": [...] },
    ...
  }
}
```

## 🎯 Résumé en une phrase

**Le backend est une API REST Node.js/TypeScript qui gère l'authentification, la configuration et le déploiement de chatbots, communique avec un service AI Python pour le RAG, et génère dynamiquement des widgets JavaScript personnalisés pour l'intégration sur n'importe quel site web.**
