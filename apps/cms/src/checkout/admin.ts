// Seed a readable list/detail view once; keep later manager layout customizations.
export async function configureCheckoutAdmin(strapi: any) {
  const marker = strapi.store({type: 'plugin', name: 'content-manager', key: 'checkout-layout-v2'});
  if (await marker.get()) return;
  const service = strapi.plugin('content-manager').service('content-types');
  const definitions = [
    {uid: 'api::order.order', main: 'number', list: ['number','customerName','phone','checkoutStep','orderStatus','paymentStatus','paymentTestMode','totalAmount','updatedAt'],
      fields: ['number','orderStatus','checkoutStep','paymentStatus','paymentTestMode','totalAmount','currency','customerName','phone','email','isCompany','companyName','edrpou','deliveryMethod','delivery','itemsSummary','items','paymentMethod','paymentProvider','paymentAttempts','comment','managerNotes','submittedAt','confirmedAt','confirmedBy','lastActivityAt','history'],
      labels: {number:'Номер замовлення', customerName:'Клієнт', phone:'Телефон', email:'Email', checkoutStep:'Завершений крок', orderStatus:'Статус замовлення', paymentStatus:'Статус оплати', paymentTestMode:'Тестова оплата', totalAmount:'Сума товарів (грн)', currency:'Валюта', isCompany:'Юридична особа', companyName:'Назва компанії', edrpou:'ЄДРПОУ', deliveryMethod:'Спосіб доставки', delivery:'Дані доставки', itemsSummary:'Вміст кошика', items:'Позиції та ціни (копійки)', paymentMethod:'Спосіб оплати', paymentProvider:'Провайдер оплати', paymentAttempts:'Платіжні спроби', comment:'Коментар клієнта', managerNotes:'Нотатки менеджера', submittedAt:'Оформлено', confirmedAt:'Рішення менеджера (підтверджено / скасовано)', confirmedBy:'Менеджер', lastActivityAt:'Остання активність', history:'Історія'}},
    {uid: 'api::payment-attempt.payment-attempt', main: 'providerOrderId', list: ['providerOrderId','order','status','providerStatus','amount','testMode','holdReviewAt'],
      fields: ['providerOrderId','order','provider','action','status','providerStatus','amount','currency','testMode','paymentId','transactionId','publicKey','checkoutExpiresAt','heldAt','holdReviewAt','paidAt','reminderSentAt','lastCheckedAt','errorCode','events'],
      labels: {providerOrderId:'ID платежу в магазині', order:'Замовлення', provider:'Провайдер', action:'Операція', status:'Статус', providerStatus:'Статус LiqPay', amount:'Сума (грн)', currency:'Валюта', testMode:'Тестовий режим', paymentId:'ID платежу LiqPay', transactionId:'ID транзакції', publicKey:'Публічний ключ магазину', checkoutExpiresAt:'Посилання діє до', heldAt:'Кошти зарезервовано', holdReviewAt:'Перевірити резервування до', paidAt:'Сплачено', reminderSentAt:'Нагадування менеджеру', lastCheckedAt:'Остання звірка', errorCode:'Код помилки', events:'Історія платежу'}},
  ];
  for (const definition of definitions) {
    const model = strapi.contentTypes[definition.uid];
    const config = await service.findConfiguration(model);
    for (const [field, label] of Object.entries(definition.labels)) {
      if (!config.metadatas[field]) continue;
      config.metadatas[field].edit = {...config.metadatas[field].edit, label, editable: field === 'managerNotes'};
      config.metadatas[field].list = {...config.metadatas[field].list, label};
    }
    await service.updateConfiguration(model, {...config,
      settings: {...config.settings, mainField: definition.main, defaultSortBy: 'createdAt', defaultSortOrder: 'DESC'},
      layouts: {...config.layouts, list: definition.list, edit: definition.fields.map(name => [{name, size: 12}])},
    });
  }
  await marker.set({value: true});
}
