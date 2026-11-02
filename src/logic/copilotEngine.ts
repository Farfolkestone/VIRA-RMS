import { CopilotQAResponse, RoomCategoryCode } from '../types/hotel';
import { buildCompleteHotelDataset } from '../data/mockHotelData';

export function queryCopilot(
  query: string,
  dataset: ReturnType<typeof buildCompleteHotelDataset>
): CopilotQAResponse {
  const q = query.toLowerCase().trim();

  // Question 1: Surbooking
  if (q.includes('surbooking') || q.includes('sur-réservation')) {
    const overbookingDays = dataset.days.filter((d) =>
      Object.values(d.reconciliations).some((r) => r.isOverbookingRisk)
    );

    const targetDay = overbookingDays[0];
    const details = targetDay
      ? Object.entries(targetDay.reconciliations)
          .filter(([_, r]) => r.isOverbookingRisk)
          .map(([cat, r]) => `${cat}: ${r.commercialPublished} en vente vs ${r.physicalFree} libres (+${r.stockDelta})`)
          .join(', ')
      : 'Aucun surbooking détecté';

    return {
      question: query,
      summary: `Détection de risque de surbooking avéré sur la date du 12 novembre 2026. Le stock commercial publié sur D-Edge excède le stock physique TOPSYS admissible.`,
      metrics: [
        { label: 'Date critique', value: '12 nov. 2026', hint: 'J+10' },
        { label: 'Catégorie impactée', value: 'Double Classique (DCLA)' },
        { label: 'Chambres libres TOPSYS', value: '2 chambres' },
        { label: 'Stock commercial D-Edge', value: '5 chambres' },
        { label: 'Surcapacité exposée', value: '+3 chambres', hint: 'Risque élevé' },
      ],
      period: 'Période analysée: 93 jours (2 nov 2026 au 2 fév 2027)',
      sources: [
        { name: 'VIGIE PLUS (TOPSYS v2.4)', timestamp: '2026-11-02 07:15 CET', reliability: 'Vérifié' },
        { name: 'VARA PLUS (D-Edge v0.3.50)', timestamp: '2026-11-02 07:30 CET', reliability: 'Vérifié' },
        { name: 'RMS Moteur de Réconciliation', timestamp: '2026-11-02 07:35 CET', reliability: 'Règle R-SURBOOK' },
      ],
      confidence: 96,
      limitations: 'Les réservations fictives ont bien été déduites. Les correspondances produits sont formellement validées à 100%.',
      recommendation: 'Réduire immédiatement le stock D-Edge de Double Classique de 5 à 2 chambres via le Centre des Actions simulées.',
      targetView: 'planning',
      targetDate: '2026-11-12',
      targetCategory: 'DCLA',
    };
  }

  // Question 2: Chambres libres non disponibles à la vente (sous-commercialisation)
  if (q.includes('libres dans topsys') || q.includes('non disponibles à la vente') || q.includes('sous-commercialis')) {
    return {
      question: query,
      summary: `Identification de sous-commercialisation critique le 18 novembre 2026 sur Twin Deluxe (TDLX), ainsi qu'un stock commercial nul le 8 novembre sur Double Classique.`,
      metrics: [
        { label: 'Date majeure', value: '18 nov. 2026' },
        { label: 'Catégorie', value: 'Twin Deluxe (TDLX)' },
        { label: 'Chambres libres TOPSYS', value: '2 chambres' },
        { label: 'Stock commercial D-Edge', value: '0 (Vente Fermée)' },
        { label: 'Manque à gagner estimé', value: '500.00 € (ADR 250€)' },
      ],
      period: '93 jours',
      sources: [
        { name: 'TOPSYS PMS Connecteur', timestamp: '2026-11-02 07:15 CET', reliability: 'Frais' },
        { name: 'D-Edge Channel Scraper', timestamp: '2026-11-02 07:30 CET', reliability: 'Frais' },
      ],
      confidence: 95,
      limitations: 'Aucune contrainte de travaux ou de maintenance enregistrée dans TOPSYS pour ces unités.',
      recommendation: 'Ouvrir les 2 chambres TDLX à la vente sur D-Edge pour capter la demande corporate.',
      targetView: 'planning',
      targetDate: '2026-11-18',
      targetCategory: 'TDLX',
    };
  }

  // Question 3: Plans VIP ouverts en contradiction
  if (q.includes('vip') || q.includes('stratégie demande leur fermeture')) {
    return {
      question: query,
      summary: `Sur la période du 22 au 25 novembre 2026, la stratégie J-10 prescrit la fermeture des tarifs VIP compte tenu de la reprise du stock, mais le plan VIP Partner (ID 4750) reste ouvert sur D-Edge.`,
      metrics: [
        { label: 'Plan concerné', value: 'VIP Partner Corporate (ID 4750)' },
        { label: 'Dates de déviation', value: '22-25 nov. 2026' },
        { label: 'Statut observé D-Edge', value: 'OUVERT' },
        { label: 'Préconisation Stratégie', value: 'FERMETURE REQUISE' },
      ],
      period: 'Horizon J-10 à J-25',
      sources: [
        { name: 'VARA PLUS Grille Tarifaire', timestamp: '2026-11-02 07:30 CET', reliability: 'Observé' },
        { name: 'Moteur Stratégies RMS STRAT-01', timestamp: '2026-11-02 08:00 CET', reliability: 'Règle simulée' },
      ],
      confidence: 92,
      recommendation: 'Envoyer une instruction de fermeture du plan VIP pour préserver le RevPAR sur les dates à fort potentiel.',
      targetView: 'status',
      targetDate: '2026-11-22',
    };
  }

  // Question 4: Écart supérieur à 1 €
  if (q.includes('écart') || q.includes('1 €') || q.includes('incohérence tarifaire') || q.includes('prix')) {
    return {
      question: query,
      summary: `Incohérence tarifaire majeure détectée le 5 novembre 2026 sur le plan MOBILE RO (Double Classique). Le prix observé sur D-Edge est de 140.00 € au lieu de 153.90 € (écart de -13.90 €).`,
      metrics: [
        { label: 'Date', value: '05 nov. 2026' },
        { label: 'RACK RO Référence', value: '190.00 €' },
        { label: 'Prix Règle Calculé', value: '153.90 € (-19%)' },
        { label: 'Prix Observé D-Edge', value: '140.00 €' },
        { label: 'Écart constaté (Δ)', value: '-13.90 €', hint: '> tolérance 1.00 €' },
      ],
      period: 'Semaine en cours',
      sources: [
        { name: 'D-Edge Plan 4720', timestamp: '2026-11-02 07:30 CET', reliability: 'Observé' },
        { name: 'Moteur Règles v2.2', timestamp: '2026-11-02 07:30 CET', reliability: 'Calculé' },
      ],
      confidence: 99,
      recommendation: 'Corriger le tarif MOBILE RO à 153.90 € pour rétablir la parité et la cohérence de grille.',
      targetView: 'rates',
      targetDate: '2026-11-05',
      targetCategory: 'DCLA',
    };
  }

  // Question 5: Évolution du RACK RO FLEX
  if (q.includes('évolution') || q.includes('rack ro flex') || q.includes('rack')) {
    return {
      question: query,
      summary: `Le tarif pivot RACK RO FLEX (ID 4685 sur Double Classique ID 5146) évolue entre 180.00 € (jours de semaine standards), 215.00 € (week-ends), 225.00 € (fêtes de fin d'année) et 250.00 € (Fashion Week). Une modification active a été enregistrée le 6 novembre.`,
      metrics: [
        { label: 'Prix moyen observé', value: '194.20 €' },
        { label: 'Prix plancher', value: '180.00 €' },
        { label: 'Prix plafond', value: '250.00 €' },
        { label: 'Dernier changement', value: '+20.00 € le 6 nov. (175€ -> 195€)' },
      ],
      period: '93 jours',
      sources: [
        { name: 'D-Edge Historique SQLite (VARA PLUS)', timestamp: '2026-11-02 07:30 CET', reliability: 'Observé' },
      ],
      confidence: 100,
      recommendation: 'Consulter la vue Tarifs pour inspecter la courbe complète et la propagation aux plans dérivés.',
      targetView: 'rates',
    };
  }

  // Question 6: Réservations annulées
  if (q.includes('annul') || q.includes('annulation')) {
    return {
      question: query,
      summary: `Une annulation explicite a été constatée : Réservation #BK-9842 (David Chen, 3 nuits en DCLA du 4 au 7 nov 2026, Expedia). La chambre a été restituée au stock physique TOPSYS.`,
      metrics: [
        { label: 'Dossier', value: '#BK-9842' },
        { label: 'Client', value: 'David Chen' },
        { label: 'Canal', value: 'Expedia (OTA)' },
        { label: 'Nuitées libérées', value: '3 nuits' },
        { label: 'Horodatage annulation', value: '01 nov 2026 à 18:42 CET' },
      ],
      period: 'Dernières 24 heures',
      sources: [
        { name: 'Flux Réservations D-Edge', timestamp: '2026-11-02 06:00 CET', reliability: 'Observé' },
        { name: 'Journal TOPSYS', timestamp: '2026-11-02 07:15 CET', reliability: 'Synchronisé' },
      ],
      confidence: 100,
      limitations: 'Une réservation absente d’une collecte partielle n’est jamais classée en annulation par le RMS.',
      recommendation: 'Le stock a été réouvert automatiquement. Aucune action manuelle requise.',
      targetView: 'reservations',
    };
  }

  // Question 7: Faible taux d'occupation sur les 30 prochains jours
  if (q.includes('faible') || q.includes('occupation') || q.includes('30 prochains')) {
    const lowOccDays = dataset.days
      .slice(0, 30)
      .filter((d) => d.occupancyRate < 60)
      .map((d) => `${d.date} (${d.occupancyRate}%)`);

    return {
      question: query,
      summary: `Sur les 30 prochains jours, plusieurs dates présentent une occupation inférieure à 60% : notamment les 18 nov (55.6%), 24 nov (51.1%) et début décembre en milieu de semaine.`,
      metrics: [
        { label: 'Occupation moyenne 30j', value: '68.4%' },
        { label: 'Dates sous le seuil', value: `${lowOccDays.length} dates identifiées` },
        { label: 'Date la plus basse', value: '24 nov 2026 (51.1%)' },
      ],
      period: '2 nov au 1 déc 2026',
      sources: [
        { name: 'TOPSYS PMS (VIGIE PLUS)', timestamp: '2026-11-02 07:15 CET', reliability: 'Frais' },
      ],
      confidence: 94,
      recommendation: 'Activer la stratégie d’ouverture des canaux mobiles et des promotions non-remboursables sur ces dates.',
      targetView: 'planning',
    };
  }

  // Question 8: Actions recommandées pour demain
  if (q.includes('demain') || q.includes('action')) {
    return {
      question: query,
      summary: `Pour demain 3 novembre 2026, l'occupation est de 88.9% (40 chambres occupées sur 45). Première observation du produit Terrasse Classique. Tous les prix sont conformes aux règles tarifaires.`,
      metrics: [
        { label: 'Date', value: '03 nov. 2026 (Demain)' },
        { label: 'Chambres libres', value: '5 chambres' },
        { label: 'Arrivées prévues', value: '6 arrivées' },
        { label: 'Risque surbooking', value: 'Aucun (0)' },
      ],
      period: 'Demain (J+1)',
      sources: [
        { name: 'TOPSYS v2.4', timestamp: '2026-11-02 07:15 CET', reliability: 'Frais' },
        { name: 'D-Edge v0.3.50', timestamp: '2026-11-02 07:30 CET', reliability: 'Frais' },
      ],
      confidence: 98,
      recommendation: 'Maintenir la fermeture des tarifs promotions pour préserver le plein tarif sur les 5 dernières chambres.',
      targetView: 'cockpit',
      targetDate: '2026-11-03',
    };
  }

  // Question 9: Pourquoi cette alerte a-t-elle été déclenchée ?
  if (q.includes('pourquoi') || q.includes('alerte')) {
    return {
      question: query,
      summary: `Explication du déclencheur d'alerte : l'alerte surbooking du 12 novembre est déclenchée par la règle stricte R-SURBOOK. Le stock commercial D-Edge (5 chambres) dépasse la capacité physique résiduelle TOPSYS (2 chambres réelles = 13 physiques - 11 occupées - 0 fictive).`,
      metrics: [
        { label: 'Règle déclenchante', value: 'R-SURBOOK (Disponibilité)' },
        { label: 'Seuil', value: 'Stock commercial > Stock physique' },
        { label: 'Écart constaté', value: '+3 chambres' },
        { label: 'Fiabilité source', value: '100% (collectes complètes et fraîches)' },
      ],
      period: '12 nov. 2026',
      sources: [
        { name: 'VIGIE PLUS TOPSYS', timestamp: '2026-11-02 07:15 CET', reliability: 'Frais' },
        { name: 'VARA PLUS D-Edge', timestamp: '2026-11-02 07:30 CET', reliability: 'Frais' },
      ],
      confidence: 99,
      recommendation: 'Approuver l’action simulée pour aligner le stock D-Edge à 2 chambres.',
      targetView: 'alerts',
      targetDate: '2026-11-12',
    };
  }

  // Question 10: Prépare les changements recommandés sans les appliquer
  if (q.includes('prépare') || q.includes('changements') || q.includes('sans les appliquer') || q.includes('simulation')) {
    return {
      question: query,
      summary: `4 actions recommandées ont été préparées dans le Centre des Actions en mode simulation sécurisée. Aucune écriture réelle n'est effectuée sur TOPSYS ni sur D-Edge.`,
      metrics: [
        { label: 'Actions préparées', value: '4 propositions' },
        { label: 'Statut système', value: 'SIMULATION ONLY' },
        { label: 'Mode écriture réelle', value: 'DÉSACTIVÉ PAR CONCEPTION' },
      ],
      period: 'Horizon 30 jours',
      sources: [
        { name: 'RMS Recommandation Engine', timestamp: '2026-11-02 08:00 CET', reliability: 'Sandbox' },
      ],
      confidence: 100,
      recommendation: 'Accédez au Centre des Actions pour examiner le comparatif Avant/Après et simuler la validation humaine.',
      targetView: 'actions',
    };
  }

  // Fallback intelligent query analyzer
  return {
    question: query,
    summary: `Analyse du portefeuille hôtelier (45 chambres) : 93 dates sous surveillance, 8 produits D-Edge mappés, 1 alerte critique de surbooking (12 nov), 1 sous-commercialisation (18 nov), 1 anomalie tarifaire (5 nov), et 1 blocage de recommandation pour cause de données périmées (28 nov).`,
    metrics: [
      { label: 'Chambres totales', value: '45 chambres' },
      { label: 'Taux occ. moyen', value: '62.4%' },
      { label: 'Alertes actives', value: `${dataset.alerts.length} alertes` },
    ],
    period: '2 nov 2026 au 2 fév 2027',
    sources: [
      { name: 'TOPSYS PMS Cache v2.4', timestamp: '2026-11-02 07:15 CET', reliability: 'Frais' },
      { name: 'D-Edge SQLite v0.3.50', timestamp: '2026-11-02 07:30 CET', reliability: 'Frais' },
    ],
    confidence: 90,
    recommendation: 'Cliquez sur l’un des parcours guidés pour explorer les différents modules du RMS.',
    targetView: 'cockpit',
  };
}
