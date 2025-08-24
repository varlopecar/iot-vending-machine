L’endpoint /health ne répond pas 200.

- URL testée: ${{ github.event.inputs.url }}
- Run ID: ${{ github.run_id }}

**Attendu**: HTTP 200 + { status: "ok" }
**Observé**: Code != 200

Actions: vérifier logs Scalingo, dernier déploiement, dépendances externes.

