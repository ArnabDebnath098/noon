/**
 * Sample updates for the noon nano bell (Figma Kids-Side "02 · Notifications —
 * the bell", 36:10275 — the happy path's four cards, in order). Each entry is
 * one Notification card variant (33:3405): type × status × marketplace, with
 * an optional parent's note (`message`).
 *
 * `go` is where tapping the card leads (Figma "Where a card leads"):
 * Task → Tasks, Top-up → Wallet, Order → the marketplace's tracking (no
 * tracking screen in this prototype yet, so Order cards just close the stack).
 */

export const SAMPLE_UPDATES = [
  {
    id: 'task-bedroom',
    type: 'Task',
    status: 'Success',
    amount: 'dhm 10  added',
    title: 'Clean up your bedroom',
    meta: 'Completed yesterday · 5 Sep',
    go: 'tasks',
  },
  {
    id: 'topup-39',
    type: 'Top-up',
    status: 'Success',
    amount: 'dhm39',
    title: 'landed in your wallet',
    meta: 'Today, 9:12 AM',
    go: 'wallet',
  },
  {
    id: 'order-noon',
    type: 'Order',
    status: 'Success',
    marketplace: 'noon',
    title: 'Arriving between\n11:42 - 11:56 PM',
    meta: ['Paid from wallet', 'dhm148'],
    go: null,
  },
  {
    id: 'order-supermall',
    type: 'Order',
    status: 'Error',
    marketplace: 'supermall',
    title: 'Order not placed',
    meta: 'Nothing was paid · dhm148',
    message: 'We have a water bottle at home. Want to pick something else?',
    go: null,
  },
]

// every Notification card variant (33:3405), for design QA: `?updates=all`
const ORDER = { title: 'Arriving between\n11:42 - 11:56 PM', meta: ['Paid from wallet', 'dhm148'] }
const DECLINED = { title: 'Order not placed', meta: ['Nothing was paid', 'dhm148'] }
const NOTE = 'We have a water bottle at home. Want to pick something else?'
export const ALL_VARIANTS = [
  SAMPLE_UPDATES[0],
  { id: 'task-redo', type: 'Task', status: 'Error', title: 'Clean up your bedroom', meta: 'Have another go — no rush', message: 'Please make the bed too, then mark it done again.', go: 'tasks' },
  { id: 'task-new', type: 'Task', status: 'Received', title: 'Clean up your bedroom', meta: 'Due Fri, 6 Sep', amount: 'dhm10', go: 'tasks' },
  SAMPLE_UPDATES[1],
  { id: 'topup-no', type: 'Top-up', status: 'Error', amount: 'dhm39', title: 'wasn’t added this time', meta: 'Today, 9:12 AM', go: 'wallet' },
  { id: 'topup-no-note', type: 'Top-up', status: 'Error', amount: 'dhm39', title: 'wasn’t added this time', meta: 'Today, 9:12 AM', message: 'You’ve already had a topup this week. Ask me again on Sunday.', go: 'wallet' },
  ...['noon', 'supermall', 'minutes', 'food'].flatMap((m) => [
    { id: `order-${m}-ok`, type: 'Order', status: 'Success', marketplace: m, ...ORDER, go: null },
    { id: `order-${m}-no`, type: 'Order', status: 'Error', marketplace: m, ...DECLINED, go: null },
    { id: `order-${m}-note`, type: 'Order', status: 'Error', marketplace: m, title: 'Order not placed', meta: 'Nothing was paid · dhm148', message: NOTE, go: null },
  ]),
]

const MODE = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('updates') : null

/** pretend fetch: resolves after a beat; `?updates=error` fails once (to show the error state) */
let failOnce = MODE === 'error'
export function loadUpdates() {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (failOnce) {
        failOnce = false
        reject(new Error('Couldn’t load notifications'))
      } else resolve(MODE === 'all' ? ALL_VARIANTS : SAMPLE_UPDATES)
    }, 650)
  })
}
