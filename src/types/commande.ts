export interface CommandeItem {
  id: string;
  produit: string;
  quantity: number;
  unit_price?: number;
  prescription_image?: string | null;
  disponibilite?: string;
  note_pharmacie?: string;
}

export interface Commande {
  id: string;
  order_number: string;
  statut: CommandeStatut;

  clt_phone: string;
  adresse_livraison: string;
  date_commande: string;

  devis_envoye_at?: string;
  accepte_par_client_at?: string;
  delivery_fee?: number;

  items: CommandeItem[];

  notes?: string;
  raison_refus?: string;
}

export type CommandeStatut =
  | "soumis"
  | "en_attente"
  | "en_attente_de_prix"
  | "devis_envoye"
  | "accepte_par_client"
  | "refuse_par_client"
  | "reviser_prix"
  | "en_preparation"
  | "en_livraison"
  | "livree"
  | "annulee";


  export interface Notification {
    id: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at?: string;
    data?: Record<string, unknown> | null;
  }

  export type WebSocketStatus = "disconnected" | "connecting" | "connected" | "error";