/**
 * Manager notifications in Telegram: one message per checkout stage with everything known so far, payment results,
 * a "confirm" button once the order can be confirmed, and reminders for card holds nobody confirmed.
 *
 * Env (CMS only): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (the manager chat or group; the bot must be a member),
 * TELEGRAM_MANAGER_IDS (optional, comma-separated Telegram user ids allowed to press "confirm"; empty = anyone in the chat).
 * Without them every call is a no-op. Buttons are read by long polling (getUpdates), so no public webhook/HTTPS is needed;
 * only presses from TELEGRAM_CHAT_ID are accepted.
 */
const API = 'https://api.telegram.org';

export function enabled() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}
export async function api(method: string, body: object, timeoutMs = 15000): Promise<any> {
  const response = await fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
  });
  const json: any = await response.json().catch(() => ({}));
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description || response.status}`);
  return json.result;
}

const esc = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const uah = (minor: number) => `${(Number(minor || 0) / 100).toLocaleString('uk-UA', {maximumFractionDigits: 2})} ₴`;

export const STAGES: Record<string, string> = {
  contacts: '👤 Залишив контакти',
  delivery: '🚚 Обрав доставку',
  payment: '💳 Обрав спосіб оплати',
  confirmation: '📝 На сторінці підтвердження',
  submitted: '✅ Замовлення оформлено',
  'payment:held': '💰 Кошти зарезервовано — потрібне підтвердження',
  'payment:test': '🧪 Тестова оплата пройшла (sandbox)',
  'payment:paid': '💵 Оплату списано',
  'payment:failed': '❌ Оплата не вдалася',
  'payment:reversed': '↩️ Резерв скасовано / кошти розблоковано',
  'payment:refunded': '↩️ Кошти повернуто',
  confirmed: '✔️ Замовлення підтверджено',
  cancelled: '🚫 Замовлення скасовано',
  reminder: '⏰ Нагадування: резерв ще не підтверджено',
};
const PAYMENT: Record<string, string> = {card: 'Картка онлайн (резерв LiqPay)', cod: 'Накладений платіж', invoice: 'Рахунок для юр. особи'};
const DELIVERY: Record<string, string> = {pickup: 'Самовивіз', nova: 'Нова Пошта', courier: 'Кур’єр по місту', address: 'Адресна доставка'};

function deliveryText(delivery: any) {
  if (!delivery) return '';
  const where = delivery.method === 'pickup' ? delivery.pickupShop?.name
    : delivery.method === 'nova' ? [delivery.city?.name, delivery.warehouse?.description].filter(Boolean).join(', ')
    : delivery.address;
  return `${DELIVERY[delivery.method] || delivery.method}${where ? `: ${where}` : ''}`;
}

/** Everything known about the order, as Telegram HTML. */
export function orderText(order: any, stage: string, extra = '') {
  const lines = [`<b>${esc(STAGES[stage] || stage)}</b>`, `Замовлення <b>${esc(order.number)}</b>${order.paymentTestMode ? ' (тест)' : ''}`];
  if (order.customerName || order.phone || order.email) {
    lines.push('', `👤 ${esc(order.customerName || '')}`, `📞 ${esc(order.phone || '')}`, `✉️ ${esc(order.email || '')}`);
    if (order.isCompany) lines.push(`🏢 ${esc(order.companyName)} · ЄДРПОУ ${esc(order.edrpou)}`);
  }
  const items: any[] = order.items || [];
  if (items.length) {
    lines.push('', '<b>Кошик:</b>');
    for (const item of items.slice(0, 30)) {
      const details = [...(item.mods || []), ...(item.addons || []).map((a: any) => a.name)].filter(Boolean).join('; ');
      lines.push(`• ${esc(item.name)} × ${item.qty} — ${uah(item.unit * item.qty)}${details ? `\n  <i>${esc(details).slice(0, 400)}</i>` : ''}`);
    }
    if (items.length > 30) lines.push(`… ще ${items.length - 30} позицій`);
    lines.push(`<b>Сума товарів: ${uah(order.totalMinor)}</b>`);
  }
  if (order.delivery) lines.push('', `🚚 ${esc(deliveryText(order.delivery))}`);
  if (order.paymentMethod) lines.push(`💳 ${esc(PAYMENT[order.paymentMethod] || order.paymentMethod)}`);
  if (order.comment) lines.push(`💬 ${esc(order.comment).slice(0, 1000)}`);
  if (extra) lines.push('', extra);
  const admin = process.env.PUBLIC_URL && order.documentId
    ? `${process.env.PUBLIC_URL.replace(/\/$/, '')}/admin/content-manager/collection-types/api::order.order/${order.documentId}` : '';
  if (admin) lines.push('', `<a href="${esc(admin)}">Відкрити в адмінці</a>`);
  return lines.join('\n').slice(0, 4000);
}

/** Buttons under a message: confirm (for a card hold: capture) and cancel (for a card hold: release the money). */
export function confirmButton(order: any) {
  const card = order.paymentMethod === 'card';
  return {inline_keyboard: [
    [{text: card ? `✔️ Підтвердити і списати ${uah(order.totalMinor)}` : '✔️ Підтвердити замовлення', callback_data: `confirm:${order.number}`}],
    [{text: card ? '✖️ Скасувати і повернути кошти' : '✖️ Скасувати замовлення', callback_data: `cancel:${order.number}`}],
  ]};
}
/** Second step of cancel, so a slip of the finger does not cancel a paid order. */
const askCancel = (number: string) => ({inline_keyboard: [[
  {text: '🚫 Так, скасувати', callback_data: `cancelyes:${number}`}, {text: '↩️ Ні', callback_data: `cancelno:${number}`},
]]});
export function canConfirm(order: any) {
  return order.orderStatus === 'awaiting_confirmation' &&
    (order.paymentMethod !== 'card' || ['held', 'test'].includes(order.paymentStatus));
}

/** Sends the stage message; never throws (a Telegram outage must not break checkout). */
export async function notify(strapi: any, order: any, stage: string, extra = '') {
  if (!enabled() || !order) return;
  try {
    await api('sendMessage', {chat_id: process.env.TELEGRAM_CHAT_ID, text: orderText(order, stage, extra), parse_mode: 'HTML',
      disable_web_page_preview: true, ...(canConfirm(order) ? {reply_markup: confirmButton(order)} : {})});
  } catch (error) {
    strapi.log.warn(`Telegram notification failed (${stage} ${order.number}): ${(error as Error).message}`);
  }
}

export type Handlers = { confirm: (number: string, who: string) => Promise<unknown>; cancel: (number: string, who: string) => Promise<unknown> };

/**
 * Long polling for button presses: confirm → handlers.confirm; cancel → asks "Так / Ні" in place; cancelyes →
 * handlers.cancel; cancelno → puts the buttons back. Results come as stage messages; errors are replied in the chat.
 * Returns a stop function.
 */
export function startPolling(strapi: any, handlers: Handlers) {
  if (!enabled()) return () => {};
  let running = true, offset = 0;
  const busy = new Set<string>();
  const answer = (query: any, text: string) => api('answerCallbackQuery', {callback_query_id: query.id, text}).catch(() => {});
  const setButtons = (query: any, markup: object) => api('editMessageReplyMarkup', {chat_id: query.message.chat.id,
    message_id: query.message.message_id, reply_markup: markup}).catch(() => {});
  const handle = async (query: any) => {
    const chat = String(query.message?.chat?.id ?? '');
    const [action, number] = String(query.data || '').split(':');
    const managers = String(process.env.TELEGRAM_MANAGER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
    const allowed = !managers.length || managers.includes(String(query.from?.id));
    if (chat !== String(process.env.TELEGRAM_CHAT_ID) || !number || !allowed ||
        !['confirm', 'cancel', 'cancelyes', 'cancelno'].includes(action)) return answer(query, 'Недоступно');
    if (action === 'cancel') { await answer(query, 'Підтвердіть скасування'); return setButtons(query, askCancel(number)); }
    if (action === 'cancelno') {
      await answer(query, 'Скасування відмінено');
      const order = await strapi.db.query('api::order.order').findOne({where: {number}});
      return setButtons(query, order && canConfirm(order) ? confirmButton(order) : {inline_keyboard: []});
    }
    if (busy.has(number)) return answer(query, 'Вже обробляється…');
    busy.add(number);
    const who = [query.from?.first_name, query.from?.last_name].filter(Boolean).join(' ') || query.from?.username || String(query.from?.id);
    try {
      await answer(query, action === 'confirm' ? 'Підтверджую…' : 'Скасовую…');
      await (action === 'confirm' ? handlers.confirm : handlers.cancel)(number, who);
      await setButtons(query, {inline_keyboard: []});   // the result arrives as a new stage message
    } catch (error) {
      await api('sendMessage', {chat_id: chat, reply_to_message_id: query.message.message_id, parse_mode: 'HTML',
        text: `⚠️ Не вдалося ${action === 'confirm' ? 'підтвердити' : 'скасувати'} ${esc(number)}: ${esc((error as Error).message)}`}).catch(() => {});
    } finally { busy.delete(number); }
  };
  const loop = async () => {
    // getUpdates does not work while a webhook is set on the bot; do not remove someone else's webhook silently.
    const hook = await api('getWebhookInfo', {}).catch(() => null);
    if (hook?.url) {
      strapi.log.warn('Telegram: the bot has a webhook set, buttons are not polled. Remove it (deleteWebhook) to use the buttons.');
      return;
    }
    while (running) {
      try {
        const updates: any[] = await api('getUpdates', {offset, timeout: 25, allowed_updates: ['callback_query']}, 35000);
        for (const update of updates) {
          offset = update.update_id + 1;
          if (update.callback_query) await handle(update.callback_query);
        }
      } catch (error) {
        if (!running) break;
        strapi.log.warn(`Telegram polling: ${(error as Error).message}`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  };
  void loop();
  return () => { running = false; };
}
