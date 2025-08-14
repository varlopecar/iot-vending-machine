import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CartItem, AppliedOffer, Product } from "../types/product";
import { useAuth } from "./AuthContext";
import { getCurrentPoints as fetchServerPoints } from "../lib/loyalty";

interface CartContextType {
  cartItems: CartItem[];
  appliedOffers: AppliedOffer[];
  userBasePoints: number;
  getCurrentPoints: () => number;
  refreshUserPoints: () => Promise<void>;
  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  addOffer: (
    offer: AppliedOffer
  ) => { ok: true; offerName: string } | { ok: false; reason: string };
  removeOffer: (offerId: string) => void;
  lastOfferAdded: string | null;
  clearLastOfferAdded: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedOffers, setAppliedOffers] = useState<AppliedOffer[]>([]);
  const [userBasePoints, setUserBasePoints] = useState<number>(0);
  const [lastOfferAdded, setLastOfferAdded] = useState<string | null>(null);

  const refreshUserPoints = async () => {
    try {
      if (!user?.id) {
        setUserBasePoints(0);
        return;
      }
      const pts = await fetchServerPoints(user.id);
      setUserBasePoints(Number.isFinite(pts) ? pts : 0);
    } catch (e) {
      setUserBasePoints(0);
    }
  };

  useEffect(() => {
    // Charger les points serveur à l'arrivée ou au changement d'utilisateur
    void refreshUserPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getCurrentPoints = () => {
    const pointsUsed = appliedOffers.reduce(
      (sum, offer) => sum + offer.points,
      0
    );
    return Math.max(0, userBasePoints - pointsUsed);
  };

  const addToCart = (product: Product): boolean => {
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    if (totalItems >= 2) {
      return false; // Limite atteinte
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
          },
        ];
      }
    });
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== productId || item.fromOfferId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? item.fromOfferId
            ? item
            : { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedOffers([]);
  };

  const getTotalPrice = () => {
    const raw = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return Math.round(raw * 100) / 100;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const addOffer = (
    offer: AppliedOffer
  ): { ok: true; offerName: string } | { ok: false; reason: string } => {
    // Vérifier qu'on ne dépasse pas 2 items au total lorsque l'on ajoute les items de l'offre
    const currentTotal = getTotalItems();
    const offerItemsCount = offer.items.reduce(
      (sum, it) => sum + it.quantity,
      0
    );
    if (currentTotal + offerItemsCount > 2) {
      return { ok: false, reason: "Limite de 2 produits dépassée" };
    }

    // Ajouter les items de l'offre au panier
    setCartItems((prev) => {
      let next = [...prev];
      for (const it of offer.items) {
        const existing = next.find(
          (ci) => ci.id === it.id && ci.fromOfferId === offer.id
        );
        if (existing) {
          next = next.map((ci) =>
            ci.id === it.id && ci.fromOfferId === offer.id
              ? { ...ci, quantity: ci.quantity + it.quantity }
              : ci
          );
        } else {
          // L'écran d'offre doit fournir nom/prix/image via fusion côté appelant si nécessaire
          next.push({
            id: it.id,
            name: it.name,
            price: 0,
            image: null,
            quantity: it.quantity,
            fromOfferId: offer.id,
          });
        }
      }
      return next;
    });

    // Déduire les points en ajoutant l'offre
    setAppliedOffers((prev) => [...prev, offer]);

    // Enregistrer la dernière offre ajoutée pour la notification
    setLastOfferAdded(offer.name);

    return { ok: true, offerName: offer.name };
  };

  const removeOffer = (offerId: string) => {
    const offer = appliedOffers.find((o) => o.id === offerId);
    if (!offer) return;

    // Retirer les items ajoutés par cette offre
    setCartItems((prev) => {
      let next = [...prev];
      // Retirer uniquement les items associés à cette offre
      next = next.filter((ci) => ci.fromOfferId !== offerId);
      return next;
    });

    // Enlever l'offre appliquée (les points sont implicitement restaurés via getCurrentPoints)
    setAppliedOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  const clearLastOfferAdded = () => {
    setLastOfferAdded(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        appliedOffers,
        userBasePoints,
        getCurrentPoints,
        refreshUserPoints,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        addOffer,
        removeOffer,
        lastOfferAdded,
        clearLastOfferAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
