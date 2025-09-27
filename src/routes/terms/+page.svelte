<!-- src/routes/terms/+page.svelte -->
<script lang="ts">
  import { lang } from '$lib/i18n';

  // Contenido traducido. Si falta un idioma, cae a ES.
  const CONTENT: Record<string, string> = {
    es: `
      <h1>Condiciones del servicio</h1>
      <p><strong>Skyarmenia</strong> (Barcelona, España). Estas condiciones regulan el uso de nuestra web.</p>

      <h2>1. Naturaleza del servicio</h2>
      <p>Skyarmenia es un <strong>buscador/agregador</strong> de vuelos. La selección final y la <strong>compra se realizan en sitios de terceros</strong>. Skyarmenia <strong>no forma parte del contrato de transporte</strong>, ni garantiza precios, disponibilidad o cambios de última hora publicados por terceros.</p>

      <h2>2. Cuenta y acceso</h2>
      <p>Puedes crear una cuenta para guardar preferencias básicas (p. ej., nombre y email). Debes mantener tus credenciales en privado.</p>

      <h2>3. Precios y disponibilidad</h2>
      <p>Los precios/horarios mostrados son informativos y pueden variar en la web del proveedor. El proveedor es quien confirma la reserva.</p>

      <h2>4. Enlaces y compras de terceros</h2>
      <p>Al seguir enlaces externos, aceptas sus términos y políticas. Lee siempre las condiciones del proveedor antes de comprar.</p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>En la medida permitida por la ley, Skyarmenia no responde por pérdidas derivadas de retrasos, cancelaciones, cambios de tarifa o cualquier incidencia propia del proveedor.</p>

      <h2>6. Protección de datos</h2>
      <p>Tratamos tus datos conforme al <strong>RGPD (UE)</strong>. Consulta la <a href="/privacy">Política de privacidad</a> para saber qué datos tratamos y tus derechos.</p>

      <h2>7. Contacto</h2>
      <p>Para dudas legales: <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a>.</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Última actualización: ${new Date().toISOString().slice(0,10)}</p>
    `,
    en: `
      <h1>Terms of Service</h1>
      <p><strong>Skyarmenia</strong> (Barcelona, Spain). These terms govern the use of our website.</p>

      <h2>1. Nature of the service</h2>
      <p>Skyarmenia is a <strong>flight search/aggregator</strong>. The final selection and <strong>purchase take place on third-party websites</strong>. Skyarmenia <strong>is not a party to the transport contract</strong> and does not guarantee prices, availability, or last-minute changes from third parties.</p>

      <h2>2. Account & access</h2>
      <p>You may create an account to save basic preferences (e.g., name and email). Keep your credentials private.</p>

      <h2>3. Prices & availability</h2>
      <p>Displayed prices/schedules are indicative and may change on the provider’s site. The provider confirms the booking.</p>

      <h2>4. Third-party links & purchases</h2>
      <p>By following external links, you accept each provider’s terms and policies. Always review them before purchasing.</p>

      <h2>5. Liability</h2>
      <p>To the extent permitted by law, Skyarmenia is not liable for losses arising from delays, cancellations, fare changes, or any provider-side incident.</p>

      <h2>6. Data protection</h2>
      <p>We process your data under the <strong>EU GDPR</strong>. See our <a href="/privacy">Privacy Policy</a> for details and your rights.</p>

      <h2>7. Contact</h2>
      <p>Legal inquiries: <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a>.</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Last updated: ${new Date().toISOString().slice(0,10)}</p>
    `,
    ru: `
      <h1>Условия использования</h1>
      <p><strong>Skyarmenia</strong> (Барселона, Испания). Эти условия регулируют использование нашего сайта.</p>

      <h2>1. Характер сервиса</h2>
      <p>Skyarmenia — это <strong>поисковик/агрегатор</strong> авиабилетов. Окончательный выбор и <strong>покупка происходят на сайтах третьих лиц</strong>. Skyarmenia <strong>не является стороной договора перевозки</strong> и не гарантирует цены, наличие мест или изменения со стороны третьих лиц.</p>

      <h2>2. Аккаунт и доступ</h2>
      <p>Вы можете создать аккаунт для сохранения базовых предпочтений (имя и e-mail). Храните свои учетные данные в тайне.</p>

      <h2>3. Цены и наличие</h2>
      <p>Отображаемые цены/расписание носят информационный характер и могут отличаться на сайте поставщика. Подтверждение бронирования делает поставщик.</p>

      <h2>4. Сторонние ссылки и покупки</h2>
      <p>Переходя по внешним ссылкам, вы принимаете условия и политики соответствующих поставщиков. Всегда знакомьтесь с ними перед покупкой.</p>

      <h2>5. Ответственность</h2>
      <p>В пределах, разрешенных законом, Skyarmenia не несет ответственности за убытки вследствие задержек, отмен, изменения тарифов или иных инцидентов на стороне поставщика.</p>

      <h2>6. Защита данных</h2>
      <p>Мы обрабатываем ваши данные в соответствии с <strong>GDPR ЕС</strong>. См. нашу <a href="/privacy">Политику конфиденциальности</a>.</p>

      <h2>7. Контакты</h2>
      <p>Юридические вопросы: <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a>.</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Дата обновления: ${new Date().toISOString().slice(0,10)}</p>
    `,
    hy: `
      <h1>Սպասարկման պայմաններ</h1>
      <p><strong>Skyarmenia</strong> (Բարսելոնա, Իսպանիա). Այս պայմանները կարգավորում են կայքի օգտագործումը։</p>

      <h2>1. Սերվիսի բնույթը</h2>
      <p>Skyarmenia-ն <strong>թռիչքների որոնման/ագրեգատոր</strong> է։ Վերջնական ընտրությունն ու <strong>գնումը կատարվում են երրորդ կողմի կայքերում</strong>։ Skyarmenia-ը <strong>փոխադրման պայմանագրի կողմ չէ</strong> և չի երաշխավորում գները, հասանելիությունը կամ մատակարարների փոփոխությունները։</p>

      <h2>2. Գրանցում և մուտք</h2>
      <p>Կարող եք ստեղծել հաշիվ՝ պահպանելու հիմնական նախասիրությունները (անուն, էլ. հասցե)։ Պահպանեք մուտքագրման տվյալները գաղտնի։</p>

      <h2>3. Գներ և հասանելիություն</h2>
      <p>Ցուցադրվող գները/ժամանակացույցը տեղեկատվական են և կարող են տարբեր լինել մատակարարի կայքում։ Ապահովումը կատարում է մատակարարը։</p>

      <h2>4. Կողմնակի հղումներ և գնումներ</h2>
      <p>Արտաքին հղումներով անցնելիս ընդունում եք համապատասխան մատակարարների պայմաններն ու քաղաքականությունները։ Միշտ վերանայեք դրանք գնմումից առաջ։</p>

      <h2>5. Պատասխանատվություն</h2>
      <p>Օրենքով թույլատրելի շրջանակներում Skyarmenia-ը պատասխանատու չէ ուշացումների, չեղարկումների, սակագների փոփոխությունների կամ մատակարարի կողմից առաջացած այլ միջադեպերի համար։</p>

      <h2>6. Տվյալների պաշտպանություն</h2>
      <p>Մենք մշակում ենք ձեր տվյալները <strong>ԵՄ ԳԴՊ</strong> համաձայն։ Մանրամասները՝ մեր <a href="/privacy">Գաղտնիության քաղաքականությունում</a>։</p>

      <h2>7. Կապ</h2>
      <p>Իրավական հարցեր՝ <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a>։</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Թարմացվել է՝ ${new Date().toISOString().slice(0,10)}</p>
    `
  };
</script>

<div class="legal-page">
  <div class="container">
    <article class="legal-body">
      {@html CONTENT[$lang] ?? CONTENT.es}
    </article>
  </div>
</div>

<style>
  .legal-page { padding: 24px 0 40px; }
  .legal-body { max-width: 860px; margin: 0 auto; line-height: 1.6; color: #111; }
  .legal-body :global(h1) { font-size: 1.8rem; margin: 0 0 12px; }
  .legal-body :global(h2) { font-size: 1.2rem; margin: 18px 0 8px; }
  .legal-body :global(a) { color: var(--accent); text-decoration: underline; }
</style>
