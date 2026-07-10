// Shared data layer — one module per domain, usable by ANY experiment:
//   combo       — PDP product, bundle/combos, payment offers, seller, PLP
//   marketplace — marketplaces, address, categories, deals rails
//   address     — address-experiment tiles + saved-address list
//
// Namespaced re-exports avoid name clashes (e.g. `categories` exists in both
// marketplace and address):
//   import { combo } from '../../data'          → combo.product, combo.bundle
//   import { product } from '../../data/combo'  → direct named import
export * as combo from './combo'
export * as marketplace from './marketplace'
export * as address from './address'
