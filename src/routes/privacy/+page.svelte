<!-- src/routes/privacy/+page.svelte -->
<script lang="ts">
  import { lang } from '$lib/i18n';

  const TODAY = new Date().toISOString().slice(0, 10);

  const CONTENT: Record<string, string> = {
    es: `
      <h1>Política de privacidad</h1>
      <p><strong>Skyarmenia</strong> (Barcelona, España) informa sobre el tratamiento de datos personales conforme al <strong>RGPD</strong>.</p>

      <h2>1. Responsable</h2>
      <p>Skyarmenia — Barcelona, España. Contacto: <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a></p>

      <h2>2. Datos que tratamos</h2>
      <ul>
        <li><strong>Cuenta:</strong> nombre y email (creación de cuenta e inicio de sesión).</li>
        <li><strong>Datos técnicos mínimos:</strong> pueden registrarse de forma automática datos necesarios para seguridad y funcionamiento (p.ej., direcciones IP, identificadores de sesión).</li>
      </ul>

      <h2>3. Finalidades</h2>
      <ul>
        <li>Proveer acceso a la cuenta y funcionalidades básicas del sitio.</li>
        <li>Seguridad, prevención del fraude y mantenimiento técnico.</li>
        <li>Comunicaciones esenciales relacionadas con tu cuenta.</li>
      </ul>

      <h2>4. Base jurídica</h2>
      <ul>
        <li><strong>Ejecución de contrato</strong> (proveer el servicio solicitado: registro/login).</li>
        <li><strong>Interés legítimo</strong> (seguridad y mantenimiento técnico).</li>
        <li><strong>Consentimiento</strong> cuando sea requerido para funciones opcionales.</li>
      </ul>

      <h2>5. Conservación</h2>
      <p>Mantenemos los datos mientras tu cuenta esté activa y, tras su cierre, el tiempo necesario para obligaciones legales o defensa frente a reclamaciones.</p>

      <h2>6. Cesiones y encargados</h2>
      <p>No vendemos tus datos. Para alojar y operar el servicio podemos apoyarnos en proveedores que actúan como <em>encargados de tratamiento</em>, con contratos de protección de datos y medidas adecuadas. No listamos nombres aquí para permitir cambios operativos sin modificar este texto; si lo requieres, puedes solicitarnos el listado actualizado.</p>

      <h2>7. Transferencias internacionales</h2>
      <p>Si algún proveedor procesa datos fuera del EEE, exigimos garantías adecuadas (p. ej., cláusulas contractuales tipo).</p>

      <h2>8. Cookies</h2>
      <p>Utilizamos cookies/técnicas necesarias para el funcionamiento (autenticación, preferencia de idioma). No empleamos cookies analíticas/marketing por defecto. Más información en la <a href="/cookies" target="_blank" rel="noopener noreferrer">Política de cookies</a>.</p>

      <h2>9. Tus derechos</h2>
      <p>Puedes ejercer acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a>. Incluye prueba razonable de identidad.</p>

      <h2>10. Menores</h2>
      <p>El servicio no está dirigido a menores de 16 años.</p>

      <h2>11. Cambios</h2>
      <p>Podemos actualizar esta política para reflejar mejoras o requisitos legales. Publicaremos la fecha de actualización.</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Última actualización: ${TODAY}</p>
    `,
    en: `
      <h1>Privacy Policy</h1>
      <p><strong>Skyarmenia</strong> (Barcelona, Spain) explains how we process personal data under the <strong>EU GDPR</strong>.</p>

      <h2>1. Controller</h2>
      <p>Skyarmenia — Barcelona, Spain. Contact: <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a></p>

      <h2>2. Data we process</h2>
      <ul>
        <li><strong>Account:</strong> name and email (account creation and login).</li>
        <li><strong>Minimal technical data:</strong> automatically recorded data needed for security and operation (e.g., IP addresses, session identifiers).</li>
      </ul>

      <h2>3. Purposes</h2>
      <ul>
        <li>Provide account access and basic site features.</li>
        <li>Security, fraud prevention and technical maintenance.</li>
        <li>Essential communications related to your account.</li>
      </ul>

      <h2>4. Legal bases</h2>
      <ul>
        <li><strong>Contract performance</strong> (providing the requested service: sign-up/login).</li>
        <li><strong>Legitimate interest</strong> (security and maintenance).</li>
        <li><strong>Consent</strong> where required for optional features.</li>
      </ul>

      <h2>5. Retention</h2>
      <p>We keep data while your account is active and, after closure, as needed to comply with legal obligations or defend claims.</p>

      <h2>6. Sharing & processors</h2>
      <p>We do not sell your data. We may rely on service providers acting as <em>processors</em> under data protection agreements and adequate safeguards. We do not list names here to allow operational changes without rewriting this notice; you may request an updated list at any time.</p>

      <h2>7. International transfers</h2>
      <p>If any provider processes data outside the EEA, we require appropriate safeguards (e.g., Standard Contractual Clauses).</p>

      <h2>8. Cookies</h2>
      <p>We use necessary/technical cookies (authentication, language). No analytics/marketing cookies by default. See our <a href="/cookies" target="_blank" rel="noopener noreferrer">Cookies Policy</a>.</p>

      <h2>9. Your rights</h2>
      <p>You may exercise access, rectification, erasure, objection, restriction and portability by emailing <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a>. Please include reasonable proof of identity.</p>

      <h2>10. Minors</h2>
      <p>The service is not directed to children under 16.</p>

      <h2>11. Changes</h2>
      <p>We may update this policy to reflect improvements or legal requirements. The update date will be posted.</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Last updated: ${TODAY}</p>
    `,
    ru: `
      <h1>Политика конфиденциальности</h1>
      <p><strong>Skyarmenia</strong> (Барселона, Испания) обрабатывает персональные данные в соответствии с <strong>GDPR ЕС</strong>.</p>

      <h2>1. Оператор</h2>
      <p>Skyarmenia — Барселона, Испания. Контакт: <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a></p>

      <h2>2. Обрабатываемые данные</h2>
      <ul>
        <li><strong>Аккаунт:</strong> имя и e-mail (создание аккаунта и вход).</li>
        <li><strong>Технические данные минимум:</strong> автоматически фиксируемые данные для безопасности и работы (IP-адреса, сессии).</li>
      </ul>

      <h2>3. Цели</h2>
      <ul>
        <li>Предоставление доступа к аккаунту и базовых функций сайта.</li>
        <li>Безопасность, предотвращение мошенничества и техподдержка.</li>
        <li>Важные сообщения по аккаунту.</li>
      </ul>

      <h2>4. Правовые основания</h2>
      <ul>
        <li><strong>Исполнение договора</strong> (регистрация/вход).</li>
        <li><strong>Законный интерес</strong> (безопасность и поддержка).</li>
        <li><strong>Согласие</strong> — для опциональных функций.</li>
      </ul>

      <h2>5. Хранение</h2>
      <p>Данные хранятся пока аккаунт активен и далее — столько, сколько необходимо для правовых обязанностей/защиты прав.</p>

      <h2>6. Передачи и обработчики</h2>
      <p>Мы не продаем данные. Для хостинга/работы сервиса можем привлекать провайдеров-обработчиков по договорам и с надлежащими гарантиями. Конкретные названия не приводим; по запросу предоставим актуальный перечень.</p>

      <h2>7. Международные передачи</h2>
      <p>Если обработка ведется вне ЕЭЗ, требуем адекватные гарантии (например, стандартные договорные положения).</p>

      <h2>8. Cookies</h2>
      <p>Используем необходимые технические cookie (аутентификация, язык). По умолчанию — без аналитики/маркетинга. Подробнее — <a href="/cookies" target="_blank" rel="noopener noreferrer">Политика cookie</a>.</p>

      <h2>9. Ваши права</h2>
      <p>Доступ, исправление, удаление, возражение, ограничение и переносимость — по адресу <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a> (пожалуйста, приложите доказательство личности).</p>

      <h2>10. Несовершеннолетние</h2>
      <p>Сервис не предназначен для лиц младше 16 лет.</p>

      <h2>11. Изменения</h2>
      <p>Мы можем обновлять политику; дата обновления будет указана ниже.</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Дата обновления: ${TODAY}</p>
    `,
    hy: `
      <h1>Գաղտնիության քաղաքականություն</h1>
      <p><strong>Skyarmenia</strong> (Բարսելոնա, Իսպանիա) մշակում է տվյալները համաձայն <strong>ԵՄ ԳԴՊ</strong>։</p>

      <h2>1. Պատասխանատու</h2>
      <p>Skyarmenia — Բարսելոնա, Իսպանիա։ Կապ՝ <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a></p>

      <h2>2. Մշակվող տվյալներ</h2>
      <ul>
        <li><strong>Հաշիվ:</strong> անուն և էլ-հասցե (գրանցում և մուտք):</li>
        <li><strong>Տեխնիկական նվազագույն տվյալներ:</strong> անվտանգության և աշխատանքի համար անհրաժեշտ (IP, սեսիա):</li>
      </ul>

      <h2>3. Նպատակներ</h2>
      <ul>
        <li>Մուտք հաշիվ և կայքի բազային գործառույթներ:</li>
        <li>Անվտանգություն, խարդախության կանխում, տեխնիկական սպասարկում:</li>
        <li>Խորհրդատվական հաղորդագրություններ հաշվի վերաբերյալ:</li>
      </ul>

      <h2>4. Իրավական հիմքեր</h2>
      <ul>
        <li><strong>Պայմանագրի կատարում</strong> (գրանցում/մուտք):</li>
        <li><strong>Օրինական հետաքրքրություն</strong> (անվտանգություն/սպասարկում):</li>
        <li><strong>Համաձայնություն</strong>՝ ընտրովի հնարավորությունների համար:</li>
      </ul>

      <h2>5. Պահպանում</h2>
      <p>Տվյալները պահվում են մինչ հաշվի ակտիվ լինելը և դրանից հետո՝ այնքան, որքան անհրաժեշտ է օրենքով սահմանված պարտավորությունների/պահանջների համար:</p>

      <h2>6. Փոխանցումներ և մշակողներ</h2>
      <p>Մենք չենք վաճառում տվյալները։ Սերվիսի գործարկման համար կարող են ներգրավվել ծառայություններ մատուցողներ՝ տվյալների պաշտպանության պայմանագրերով։ Անունների ցանկը չենք հրապարակում այստեղ. կարող եք հարցմամբ ստանալ արդիականացված տարբերակը:</p>

      <h2>7. Միջազգային փոխանցումներ</h2>
      <p>Երբ մշակումը կատարվում է ԵՏՏ-ից դուրս, ապահովում ենք համապատասխան երաշխիքներ (օր.՝ ստանդարտ պայմանագրային դրույթներ):</p>

      <h2>8. Cookie-ներ</h2>
      <p>Օգտագործվում են տեխնիկական անհրաժեշտ cookie-ներ (ավթենտիկացում, լեզու)։ Լռելյայն՝ առանց վերլուծական/մարքեթինգային cookie-ների։ Մանրամասները՝ <a href="/cookies" target="_blank" rel="noopener noreferrer">Cookie-ների քաղաքականությունում</a>։</p>

      <h2>9. Ձեր իրավունքները</h2>
      <p>Մուտք, շտկում, ջնջում, առարկություն, սահմանափակում և փոխանցելիություն — դիմեք <a href="mailto:info@skyarmenia.com">info@skyarmenia.com</a> հասցեով՝ տրամադրելով անձը հաստատող տվյալներ:</p>

      <h2>10. Անչափահասներ</h2>
      <p>Սերվիսը նախատեսված չէ 16 տարեկանից ցածր անձանց համար:</p>

      <h2>11. Փոփոխություններ</h2>
      <p>Քաղաքականությունը կարող է թարմացվել. թարմացման ամսաթիվը նշված է ներքևում։</p>

      <p style="margin-top:12px;font-size:.9rem;color:#666">Թարմացվել է՝ ${TODAY}</p>
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
  .legal-body h1 { font-size: 1.8rem; margin: 0 0 12px; }
  .legal-body h2 { font-size: 1.2rem; margin: 18px 0 8px; }
  .legal-body a { color: var(--accent); text-decoration: underline; }
</style>
