"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@/components/ui";
import { Settings, User, Bell, Shield, Database, Download } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configurez votre back-office et vos préférences
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil administrateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom d&apos;utilisateur</label>
                <Input
                  defaultValue="admin@vendingmachine.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <Input
                  defaultValue="Administrateur Principal"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rôle</label>
                <Input
                  defaultValue="Super Administrateur"
                  disabled
                  className="mt-1"
                />
              </div>
              <Button>Mettre à jour le profil</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Ruptures de stock</div>
                  <div className="text-sm text-muted-foreground">
                    Alertes quand un produit est en rupture
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Machines hors ligne</div>
                  <div className="text-sm text-muted-foreground">
                    Notifications de déconnexion des machines
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Commandes expirées</div>
                  <div className="text-sm text-muted-foreground">
                    Alertes pour les commandes non récupérées
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <Button>Sauvegarder les préférences</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Mot de passe actuel
                </label>
                <Input type="password" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Nouveau mot de passe
                </label>
                <Input type="password" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Confirmer le mot de passe
                </label>
                <Input type="password" className="mt-1" />
              </div>
              <Button>Changer le mot de passe</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestion des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Sauvegarde automatique</div>
                  <div className="text-sm text-muted-foreground">
                    Sauvegarde quotidienne des données
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter les données
                </Button>
                <Button variant="outline" className="w-full">
                  Planifier une sauvegarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informations système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="font-medium">VendingAdmin v1.0.0</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Dernière mise à jour
                </div>
                <div className="font-medium">15 Janvier 2024</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Statut</div>
                <div className="font-medium text-green-600">Opérationnel</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
