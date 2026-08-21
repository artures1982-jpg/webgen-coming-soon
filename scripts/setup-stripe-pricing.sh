#!/usr/bin/env bash
# scripts/setup-stripe-pricing.sh — Faza 5 dokonczenie: tworzy w Stripe produkty/ceny dla
# nowego modelu Pro + 2 nowe dodatki (social_media, statystyki), a potem od razu dodaje
# wynikowe Price ID jako zmienne srodowiskowe w Vercel (production).
#
# Uruchom TYLKO Ty, lokalnie, z prawdziwym kluczem Stripe — sekret nigdy nie trafia do
# tej rozmowy. Przyklad uzycia:
#   STRIPE_SECRET_KEY='sk_test_...' bash scripts/setup-stripe-pricing.sh
#
# Wymaga: zalogowany `vercel` CLI, projekt polaczony (masz to juz z tej sesji).

set -e

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Brak STRIPE_SECRET_KEY w srodowisku. Uruchom tak:"
  echo "  STRIPE_SECRET_KEY='sk_test_...' bash scripts/setup-stripe-pricing.sh"
  exit 1
fi

extract_field() {
  # $1 = surowy JSON, $2 = nazwa pola — odporne na spacje po dwukropku
  echo "$1" | grep -oE "\"$2\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed -E 's/.*"([^"]*)"$/\1/'
}

fail_if_empty() {
  # $1 = wyciagnieta wartosc, $2 = surowy JSON (do pokazania bledu), $3 = opis kroku
  if [ -z "$1" ]; then
    echo "BLAD przy: $3"
    echo "Odpowiedz Stripe: $2"
    exit 1
  fi
}

create_product() {
  local raw
  raw=$(curl -s https://api.stripe.com/v1/products -u "$STRIPE_SECRET_KEY:" -d name="$1")
  local id
  id=$(extract_field "$raw" id)
  fail_if_empty "$id" "$raw" "tworzenie produktu '$1'"
  echo "$id"
}

create_price() {
  # $1 = product id, $2 = unit_amount (grosze), $3 = interval (month|year), $4 = opis do bledow
  local raw
  raw=$(curl -s https://api.stripe.com/v1/prices -u "$STRIPE_SECRET_KEY:" \
    -d product="$1" -d unit_amount="$2" -d currency=pln \
    -d "recurring[interval]=$3")
  local id
  id=$(extract_field "$raw" id)
  fail_if_empty "$id" "$raw" "tworzenie ceny '$4'"
  echo "$id"
}

echo "-> Tworze produkt Webgen Pro..."
PRO_PRODUCT=$(create_product "Webgen Pro")
PRO_MONTHLY=$(create_price "$PRO_PRODUCT" 39900 month "Pro miesiecznie")
PRO_YEARLY=$(create_price "$PRO_PRODUCT" 399000 year "Pro rocznie")
echo "   Pro miesiecznie: $PRO_MONTHLY"
echo "   Pro rocznie:     $PRO_YEARLY"

echo "-> Tworze produkt Webgen - Social Media..."
SOCIAL_PRODUCT=$(create_product "Webgen - Integracja Social Media")
SOCIAL_PRICE=$(create_price "$SOCIAL_PRODUCT" 7900 month "Social Media")
echo "   Social Media: $SOCIAL_PRICE"

echo "-> Tworze produkt Webgen - Statystyki..."
STATS_PRODUCT=$(create_product "Webgen - Statystyki odwiedzin")
STATS_PRICE=$(create_price "$STATS_PRODUCT" 4900 month "Statystyki")
echo "   Statystyki: $STATS_PRICE"

echo ""
echo "-> Dodaje zmienne srodowiskowe do Vercel (production)..."
vercel env add STRIPE_PRICE_PRO production --value "$PRO_MONTHLY" --yes
vercel env add STRIPE_PRICE_PRO_YEARLY production --value "$PRO_YEARLY" --yes
vercel env add STRIPE_PRICE_ADDON_SOCIAL_MEDIA production --value "$SOCIAL_PRICE" --yes
vercel env add STRIPE_PRICE_ADDON_STATYSTYKI production --value "$STATS_PRICE" --yes

echo ""
echo "Gotowe. Wszystkie 4 ceny utworzone i dodane do Vercel."
echo "Pamietaj: potrzebny nowy deploy zeby zaczely dzialac na produkcji."
