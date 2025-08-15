# Documentation des Routes REST API

Ce document décrit les nouvelles routes REST API créées pour le système de vending machine.

## 🏠 Base URL

Les routes sont accessibles via : `http://localhost:3000` (en développement)

## 💳 Paiement par Carte Bancaire

### POST `/api/card-payment/process`

Traite un paiement par carte bancaire via Stripe.

**Body (JSON):**

```json
{
  "number": "4242424242424242",
  "exp_month": 12,
  "exp_year": 2025,
  "cvc": "123",
  "country": "FR",
  "amount": 2500,
  "currency": "eur",
  "metadata": {
    "order_id": "order_123",
    "user_id": "user_456",
    "machine_id": "machine_789"
  }
}
```

**Réponses possibles:**

✅ **Paiement réussi:**

```json
{
  "status": "PAYMENT_SUCCESSFUL",
  "payment_intent_id": "pi_1234567890",
  "amount": 2500,
  "currency": "eur",
  "created": 1640995200,
  "metadata": { ... }
}
```

❌ **Paiement refusé:**

```json
{
  "status": "PAYMENT_DECLINED",
  "payment_intent_id": "pi_1234567890",
  "failure_reason": "Your card was declined."
}
```

### POST `/api/card-payment/test`

Route de test avec des données de carte Stripe prédéfinies.

**Réponse:**

```json
{
  "status": "PAYMENT_SUCCESSFUL",
  "payment_intent_id": "pi_test_123",
  "amount": 2000,
  "currency": "eur"
}
```

## 📱 Validation de Commandes (QR Code)

### POST `/api/order-validation/validate-qr`

Valide une commande à partir des données extraites d'un QR code.

**Body (JSON):**

```json
{
  "orderID": "123456789",
  "machineID": "machine_001",
  "userID": "user_123"
}
```

**Réponses possibles:**

✅ **Commande valide:**

```json
{
  "status": "VALID_ORDER",
  "message": "Commande valide et prête pour le retrait",
  "order_id": "123456789",
  "user_id": "user_123",
  "machine_id": "machine_001",
  "items": [
    {
      "product_id": "prod_chips",
      "quantity": 1,
      "slot_number": 1
    }
  ],
  "expires_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T08:00:00Z"
}
```

❌ **Commande invalide:**

```json
{
  "status": "INVALID_ORDER",
  "message": "Commande expirée",
  "order_id": "123456789",
  "expired_at": "2024-01-15T10:30:00Z"
}
```

### POST `/api/order-validation/validate-token`

Valide une commande à partir du token QR existant.

**Body (JSON):**

```json
{
  "qr_code_token": "qr_token_abc123"
}
```

### GET `/api/order-validation/order/:orderId`

Récupère le statut d'une commande.

**Réponse:**

```json
{
  "order_id": "123456789",
  "status": "active",
  "user_id": "user_123",
  "machine_id": "machine_001",
  "created_at": "2024-01-15T08:00:00Z",
  "expires_at": "2024-01-15T10:30:00Z",
  "items": [...],
  "is_expired": false
}
```

## 📦 Livraison de Commandes

### POST `/api/order-delivery/confirm`

Confirme qu'une commande a été livrée avec succès.

**Body (JSON):**

```json
{
  "order_id": "123456789",
  "machine_id": "machine_001",
  "timestamp": "2024-01-15T09:15:00Z",
  "items_delivered": [
    {
      "product_id": "prod_chips",
      "slot_number": 1,
      "quantity": 1
    }
  ]
}
```

**Réponses possibles:**

✅ **Livraison confirmée:**

```json
{
  "status": "DELIVERY_CONFIRMED",
  "message": "Commande livrée avec succès",
  "order_id": "123456789",
  "delivered_at": "2024-01-15T09:15:00Z",
  "original_status": "active",
  "new_status": "used",
  "items": [...]
}
```

❌ **Erreur de livraison:**

```json
{
  "status": "DELIVERY_ERROR",
  "message": "Impossible de livrer: commande dans l'état expired",
  "order_id": "123456789",
  "current_status": "expired"
}
```

### DELETE `/api/order-delivery/order/:orderId`

Supprime (archive) une commande après livraison.

**Réponse:**

```json
{
  "status": "ORDER_DELETED",
  "message": "Commande supprimée avec succès",
  "order_id": "123456789",
  "archived_at": "2024-01-15T09:20:00Z",
  "previous_status": "used"
}
```

### POST `/api/order-delivery/cancel/:orderId`

Annule une commande.

**Réponse:**

```json
{
  "status": "ORDER_CANCELLED",
  "message": "Commande annulée avec succès",
  "order_id": "123456789",
  "cancelled_at": "2024-01-15T09:20:00Z",
  "status": "cancelled"
}
```

## 🔧 Codes d'État

| Status                    | Description                               |
| ------------------------- | ----------------------------------------- |
| `PAYMENT_SUCCESSFUL`      | Paiement traité avec succès               |
| `PAYMENT_DECLINED`        | Paiement refusé par la banque             |
| `PAYMENT_REQUIRES_ACTION` | Authentification 3D Secure requise        |
| `VALID_ORDER`             | Commande valide et prête                  |
| `INVALID_ORDER`           | Commande invalide, expirée ou inexistante |
| `DELIVERY_CONFIRMED`      | Livraison confirmée avec succès           |
| `DELIVERY_ERROR`          | Erreur lors de la livraison               |
| `ORDER_DELETED`           | Commande supprimée/archivée               |
| `ORDER_CANCELLED`         | Commande annulée                          |

## 🧪 Tests

### Cartes de test Stripe

- **Succès:** `4242424242424242`
- **Refusé:** `4000000000000002`
- **3D Secure:** `4000002760003184`

### Exemples cURL

**Test de paiement:**

```bash
curl -X POST http://localhost:3000/api/card-payment/test
```

**Validation de commande:**

```bash
curl -X POST http://localhost:3000/api/order-validation/validate-qr \
  -H "Content-Type: application/json" \
  -d '{"orderID": "123456789", "machineID": "machine_001"}'
```

**Confirmation de livraison:**

```bash
curl -X POST http://localhost:3000/api/order-delivery/confirm \
  -H "Content-Type: application/json" \
  -d '{"order_id": "123456789", "machine_id": "machine_001"}'
```
