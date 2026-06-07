# LoyalPass

SaaS multi-tenant de cartes de fidelite digitales pour Apple Wallet et Google Wallet. Le client final n'installe aucune application: il cree sa carte depuis une page mobile, l'ajoute a son Wallet, puis le commercant scanne le QR en caisse.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Database
- Vercel
- `qrcode`, `html5-qrcode`
- Apple PassKit et Google Wallet API, avec fallback non bloquant si les credentials ne sont pas encore configures

## Parcours MVP

1. Le super admin cree un commerce dans `/admin/merchants/new`.
2. LoyalPass cree le `merchant_id`, le compte commercant, le lien public `/m/[merchantId]` et la configuration Wallet.
3. Le client ouvre le lien public, saisit prenom, telephone et email facultatif.
4. LoyalPass cree le client, la carte de fidelite, le QR unique et la page success.
5. Le client ajoute sa carte a Apple Wallet ou Google Wallet.
6. Le commercant ouvre `/merchant/scan`, scanne le QR Wallet, puis arrive sur `/merchant/card/[cardId]`.
7. Il ajoute `+1`, `+2`, `+5` ou un montant personnalise.
8. Si `points >= objectif`, le statut passe a `reward_available`.
9. Le bouton `Utiliser recompense` enregistre la transaction et remet le compteur a zero ou deduit les points selon le commerce.

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir `http://localhost:3000`.

## Supabase

1. Creer un projet Supabase.
2. Executer `supabase/schema.sql` dans SQL Editor.
3. Activer Email/Password dans Authentication.
4. Creer un utilisateur auth pour le super admin.
5. Ajouter son profil:

```sql
insert into public.users (id, role, email)
values ('AUTH_USER_UUID', 'super_admin', 'admin@loyalpass.app');
```

6. Remplir `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Les routes serveur utilisent la service role key pour les operations systeme, et les routes marchandes verifient toujours `merchant_id` avant de retourner ou modifier une carte.

## Wallet

### Apple Wallet

Variables optionnelles:

```bash
APPLE_PASS_TYPE_IDENTIFIER=
APPLE_TEAM_IDENTIFIER=
APPLE_ORGANIZATION_NAME=LoyalPass
APPLE_WWDR_CERT_PATH=
APPLE_SIGNER_CERT_PATH=
APPLE_SIGNER_KEY_PATH=
APPLE_SIGNER_KEY_PASSPHRASE=
```

Quand ces credentials sont presents, `/api/wallet/apple/[cardId]` genere un fichier `.pkpass`. Sans credentials, la route retourne un JSON de diagnostic au lieu de bloquer le parcours.

### Google Wallet

Variables optionnelles:

```bash
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_WALLET_CLASS_SUFFIX=loyalpass
GOOGLE_APPLICATION_CREDENTIALS=
```

La route `/api/wallet/google/[cardId]` est structuree pour un Generic Pass. Sans issuer, elle redirige vers la page success avec un mode demo.

## Deploiement Vercel

1. Importer le repo dans Vercel.
2. Ajouter toutes les variables `.env.example`.
3. Mettre `NEXT_PUBLIC_APP_URL` sur l'URL Vercel de production.
4. Deployer.
5. Dans Supabase Auth, ajouter l'URL Vercel aux Redirect URLs.

## Pages

- `/login`
- `/admin`
- `/admin/merchants`
- `/admin/merchants/new`
- `/merchant/dashboard`
- `/merchant/scan`
- `/merchant/card/[cardId]`
- `/merchant/notifications`
- `/m/[merchantId]`
- `/m/[merchantId]/success/[cardId]`

## API

- `POST /api/merchants`
- `POST /api/customers`
- `GET /api/cards/[cardId]`
- `POST /api/cards/[cardId]/add-points`
- `POST /api/cards/[cardId]/redeem`
- `POST /api/wallet/update/[cardId]`
- `GET /api/wallet/apple/[cardId]`
- `GET /api/wallet/google/[cardId]`
- `POST /api/notifications`

## Notes production

- Les credentials Apple et Google doivent etre fournis avant une mise en production Wallet reelle.
- Pour Apple Wallet en production, ajouter aussi les endpoints Web Service PassKit `register`, `unregister`, `passesUpdatedSince` et APNs.
- Pour Google Wallet en production, signer le JWT avec le service account et creer la classe Generic Pass via Google Wallet API.
- Les pages publiques supportent `dir="auto"` pour les descriptions RTL comme l'hebreu.
