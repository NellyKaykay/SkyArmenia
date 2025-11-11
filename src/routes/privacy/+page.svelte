<svelte:head>
  <title>Política de Privacidad - SkyArmenia | Vuelos Barcelona-Yerevan</title>
  <meta name="description" content="Política de privacidad de SkyArmenia. Cómo protegemos tus datos personales en las reservas de vuelos Barcelona-Yerevan. GDPR compliant.">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Política de Privacidad - SkyArmenia">
  <meta property="og:description" content="Política de privacidad de SkyArmenia - Protección de datos en vuelos Barcelona-Yerevan.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://skyarmenia.com/privacy">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://skyarmenia.com/privacy">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Política de Privacidad",
      "description": "Política de privacidad y protección de datos de SkyArmenia",
      "publisher": {
        "@type": "Organization",
        "name": "SkyArmenia"
      }
    }
  </script>
</svelte:head>

<!-- Política de Privacidad Profesional - SkyArmenia -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { lang } from '$lib/i18n';

  // Tipos y constantes
  interface PolicyContent {
    title: string;
    content: string;
    lastUpdated: string;
  }

  type SupportedLanguage = 'es' | 'en' | 'ru' | 'hy';

  const TODAY = new Date().toISOString().slice(0, 10);
  const COMPANY_EMAIL = 'info@skyarmenia.com';

  // Estado de la aplicación
  let isLoading = true;
  let currentLang: SupportedLanguage = 'es';

  // Contenido de políticas por idioma
  const PRIVACY_POLICIES: Record<SupportedLanguage, PolicyContent> = {
    es: {
      title: 'Política de Privacidad',
      lastUpdated: 'Última actualización',
      content: `
        <section class="policy-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Barcelona, España) informa sobre el tratamiento de datos personales 
            conforme al <strong>Reglamento General de Protección de Datos (RGPD)</strong>.
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Responsable del Tratamiento</h2>
          <p>
            <strong>SkyArmenia</strong><br>
            Barcelona, España<br>
            Contacto: <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a>
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Datos que Tratamos</h2>
          <ul class="data-list">
            <li><strong>Datos de cuenta:</strong> Nombre completo y dirección de correo electrónico para la creación de cuenta e inicio de sesión.</li>
            <li><strong>Datos técnicos:</strong> Información automática necesaria para la seguridad y funcionamiento del servicio (direcciones IP, identificadores de sesión, datos de navegador).</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Finalidades del Tratamiento</h2>
          <ul class="purpose-list">
            <li>Proporcionar acceso a su cuenta y funcionalidades del sitio web</li>
            <li>Garantizar la seguridad del servicio y prevención del fraude</li>
            <li>Realizar mantenimiento técnico y mejoras del sistema</li>
            <li>Enviar comunicaciones esenciales relacionadas con su cuenta</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>4. Base Jurídica</h2>
          <ul class="legal-basis-list">
            <li><strong>Ejecución de contrato:</strong> Proporcionar el servicio solicitado (registro e inicio de sesión)</li>
            <li><strong>Interés legítimo:</strong> Seguridad del sistema y mantenimiento técnico</li>
            <li><strong>Consentimiento:</strong> Para funciones opcionales cuando sea requerido</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Período de Conservación</h2>
          <p>
            Conservamos sus datos personales mientras su cuenta permanezca activa. 
            Tras el cierre de la cuenta, mantendremos la información durante el tiempo 
            necesario para cumplir con obligaciones legales o para la defensa frente a posibles reclamaciones.
          </p>
        </section>

        <section class="policy-section">
          <h2>6. Cesiones y Encargados de Tratamiento</h2>
          <p>
            No vendemos ni comercializamos sus datos personales. Para el alojamiento y operación 
            del servicio, colaboramos con proveedores tecnológicos que actúan como encargados de 
            tratamiento bajo estrictos contratos de protección de datos y medidas de seguridad adecuadas.
          </p>
          <p class="note">
            Para mantener la flexibilidad operativa, no listamos nombres específicos en este documento. 
            Si requiere información sobre nuestros proveedores actuales, puede solicitarla por correo electrónico.
          </p>
        </section>

        <section class="policy-section">
          <h2>7. Transferencias Internacionales</h2>
          <p>
            Si algún proveedor de servicios procesa datos fuera del Espacio Económico Europeo (EEE), 
            exigimos garantías adecuadas de protección, incluyendo cláusulas contractuales tipo 
            aprobadas por la Comisión Europea.
          </p>
        </section>

        <section class="policy-section">
          <h2>8. Cookies y Tecnologías Similares</h2>
          <p>
            Utilizamos diferentes tipos de cookies para mejorar su experiencia en nuestro sitio web:
          </p>
          <ul class="cookie-types-list">
            <li><strong>Cookies necesarias:</strong> Esenciales para el funcionamiento básico del sitio (autenticación, preferencias de idioma). Estas cookies no se pueden desactivar.</li>
            <li><strong>Cookies funcionales:</strong> Mejoran la funcionalidad del sitio recordando sus preferencias y configuraciones.</li>
            <li><strong>Cookies de análisis:</strong> Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web mediante la recopilación y presentación de información de forma anónima.</li>
            <li><strong>Cookies de marketing:</strong> Se utilizan para mostrar anuncios más relevantes para usted y sus intereses.</li>
          </ul>
          <p>
            Puede gestionar sus preferencias de cookies en cualquier momento a través del banner de cookies que aparece en su primera visita o contactando con nosotros.
          </p>
          <p>
            Para más información detallada, consulte nuestra 
            <a href="#cookies" class="policy-link">sección de cookies completa</a> más abajo.
          </p>
        </section>

        <section class="policy-section">
          <h2>9. Sus Derechos</h2>
          <p>Conforme al RGPD, usted tiene derecho a:</p>
          <ul class="rights-list">
            <li><strong>Acceso:</strong> Solicitar información sobre el tratamiento de sus datos</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
            <li><strong>Supresión:</strong> Eliminar sus datos personales</li>
            <li><strong>Oposición:</strong> Oponerse al tratamiento en determinadas circunstancias</li>
            <li><strong>Limitación:</strong> Restringir el procesamiento de sus datos</li>
            <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
          </ul>
          <p>
            Para ejercer estos derechos, escriba a 
            <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a> 
            incluyendo una prueba razonable de su identidad.
          </p>
        </section>

        <section class="policy-section">
          <h2>10. Protección de Menores</h2>
          <p>
            Nuestro servicio no está dirigido a menores de 16 años. No recopilamos 
            conscientemente información personal de menores de esta edad.
          </p>
        </section>

        <section class="policy-section">
          <h2>11. Modificaciones</h2>
          <p>
            Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras 
            prácticas, mejoras del servicio o nuevos requisitos legales. La fecha de la última 
            actualización se indicará claramente al final de este documento.
          </p>
        </section>

        <section class="policy-section" id="cookies">
          <h2>12. Política Detallada de Cookies</h2>
          
          <h3>¿Qué son las cookies?</h3>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. 
            Nos permiten reconocerle y recordar sus preferencias para mejorar su experiencia de navegación.
          </p>

          <h3>Tipos de cookies que utilizamos:</h3>
          
          <div class="cookie-category">
            <h4>🔐 Cookies Estrictamente Necesarias</h4>
            <p><strong>Base legal:</strong> Interés legítimo</p>
            <p><strong>Finalidad:</strong> Estas cookies son esenciales para que el sitio web funcione correctamente.</p>
            <ul class="cookie-details-list">
              <li><strong>Autenticación:</strong> Recordar si ha iniciado sesión</li>
              <li><strong>Seguridad:</strong> Proteger contra ataques y verificar la autenticidad</li>
              <li><strong>Preferencias básicas:</strong> Idioma seleccionado</li>
            </ul>
            <p><em>No puede desactivar estas cookies ya que el sitio no funcionaría correctamente sin ellas.</em></p>
          </div>

          <div class="cookie-category">
            <h4>⚙️ Cookies Funcionales</h4>
            <p><strong>Base legal:</strong> Consentimiento</p>
            <p><strong>Finalidad:</strong> Mejorar la funcionalidad y personalización del sitio.</p>
            <ul class="cookie-details-list">
              <li><strong>Personalización:</strong> Recordar sus configuraciones y preferencias</li>
              <li><strong>Funciones avanzadas:</strong> Habilitar características mejoradas del sitio</li>
              <li><strong>Experiencia de usuario:</strong> Adaptar el contenido a sus necesidades</li>
            </ul>
          </div>

          <div class="cookie-category">
            <h4>📊 Cookies de Análisis</h4>
            <p><strong>Base legal:</strong> Consentimiento</p>
            <p><strong>Finalidad:</strong> Ayudarnos a entender cómo los visitantes interactúan con nuestro sitio web.</p>
            <ul class="cookie-details-list">
              <li><strong>Google Analytics:</strong> Estadísticas de uso del sitio (anonimizadas)</li>
              <li><strong>Rendimiento:</strong> Identificar áreas de mejora del sitio</li>
              <li><strong>Comportamiento:</strong> Entender patrones de navegación</li>
            </ul>
            <p><em>Todos los datos se recopilan de forma anónima y agregada.</em></p>
          </div>

          <div class="cookie-category">
            <h4>🎯 Cookies de Marketing</h4>
            <p><strong>Base legal:</strong> Consentimiento</p>
            <p><strong>Finalidad:</strong> Mostrar anuncios relevantes y medir la efectividad de nuestras campañas.</p>
            <ul class="cookie-details-list">
              <li><strong>Remarketing:</strong> Mostrar anuncios relevantes en otros sitios</li>
              <li><strong>Segmentación:</strong> Personalizar la publicidad según sus intereses</li>
              <li><strong>Conversiones:</strong> Medir la efectividad de nuestros anuncios</li>
            </ul>
          </div>

          <h3>Cómo gestionar las cookies</h3>
          <p>
            Puede controlar y gestionar las cookies de varias maneras:
          </p>
          <ul class="management-list">
            <li><strong>Banner de cookies:</strong> Utilice nuestro banner para personalizar sus preferencias</li>
            <li><strong>Configuración del navegador:</strong> La mayoría de navegadores le permiten gestionar cookies en su configuración</li>
            <li><strong>Herramientas de terceros:</strong> Puede usar extensiones de navegador para bloquear cookies</li>
            <li><strong>Contacto directo:</strong> Escriba a ${COMPANY_EMAIL} para solicitudes específicas</li>
          </ul>

          <h3>Cookies de terceros</h3>
          <p>
            Algunos proveedores de servicios pueden establecer cookies en nuestro sitio:
          </p>
          <ul class="third-party-list">
            <li><strong>Google Analytics:</strong> Para análisis de sitio web (cuando esté habilitado)</li>
            <li><strong>Google Fonts:</strong> Para cargar fuentes del sitio web</li>
            <li><strong>Leaflet/OpenStreetMap:</strong> Para la funcionalidad de mapas</li>
          </ul>

          <h3>Retirada del consentimiento</h3>
          <p>
            Puede retirar su consentimiento para cookies no esenciales en cualquier momento:
          </p>
          <ul class="withdrawal-list">
            <li>Eliminando las cookies de su navegador</li>
            <li>Cambiando la configuración de su navegador</li>
            <li>Contactando con nosotros en ${COMPANY_EMAIL}</li>
          </ul>
          <p><em>La retirada del consentimiento no afectará a la legalidad del procesamiento anterior.</em></p>

          <div class="cookie-update">
            <p><strong>Última actualización de la política de cookies:</strong> ${TODAY}</p>
          </div>
        </section>
      `
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: TODAY,
      content: `
        <section class="policy-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Barcelona, Spain) processes personal data in accordance with the 
            <strong>General Data Protection Regulation (GDPR)</strong>.
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Data Controller</h2>
          <p>
            <strong>SkyArmenia</strong><br>
            Barcelona, Spain<br>
            Contact: <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a>
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Data We Process</h2>
          <ul class="data-list">
            <li><strong>Account data:</strong> Full name and email address for account creation and login.</li>
            <li><strong>Technical data:</strong> Automatically recorded information necessary for security and service operation (IP addresses, session identifiers, browser data).</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Processing Purposes</h2>
          <ul class="purpose-list">
            <li>Provide access to your account and website functionalities</li>
            <li>Ensure service security and fraud prevention</li>
            <li>Perform technical maintenance and system improvements</li>
            <li>Send essential communications related to your account</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>4. Legal Basis</h2>
          <ul class="legal-basis-list">
            <li><strong>Contract performance:</strong> Provide the requested service (registration and login)</li>
            <li><strong>Legitimate interest:</strong> System security and technical maintenance</li>
            <li><strong>Consent:</strong> For optional functions when required</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Retention Period</h2>
          <p>
            We retain your personal data while your account remains active. 
            After account closure, we maintain information for the time necessary 
            to comply with legal obligations or to defend against potential claims.
          </p>
        </section>

        <section class="policy-section">
          <h2>6. Data Transfers and Processors</h2>
          <p>
            We do not sell or commercialize your personal data. For service hosting and operation, 
            we collaborate with technology providers who act as data processors under strict 
            data protection contracts and adequate security measures.
          </p>
          <p class="note">
            To maintain operational flexibility, we do not list specific names in this document. 
            If you require information about our current providers, you may request it by email.
          </p>
        </section>

        <section class="policy-section">
          <h2>7. International Transfers</h2>
          <p>
            If any service provider processes data outside the European Economic Area (EEA), 
            we require adequate protection safeguards, including standard contractual clauses 
            approved by the European Commission.
          </p>
        </section>

        <section class="policy-section">
          <h2>8. Cookies and Similar Technologies</h2>
          <p>
            We use only technical cookies necessary for service operation 
            (user authentication, language preferences). We do not use analytics 
            or marketing cookies by default.
          </p>
          <p>
            For more information, see our 
            <a href="/cookies" target="_blank" rel="noopener noreferrer" class="policy-link">Cookie Policy</a>.
          </p>
        </section>

        <section class="policy-section">
          <h2>9. Your Rights</h2>
          <p>Under the GDPR, you have the right to:</p>
          <ul class="rights-list">
            <li><strong>Access:</strong> Request information about the processing of your data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Delete your personal data</li>
            <li><strong>Objection:</strong> Object to processing under certain circumstances</li>
            <li><strong>Restriction:</strong> Restrict the processing of your data</li>
            <li><strong>Portability:</strong> Receive your data in a structured format</li>
          </ul>
          <p>
            To exercise these rights, write to 
            <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a> 
            including reasonable proof of your identity.
          </p>
        </section>

        <section class="policy-section">
          <h2>10. Protection of Minors</h2>
          <p>
            Our service is not directed at minors under 16 years of age. We do not 
            knowingly collect personal information from minors under this age.
          </p>
        </section>

        <section class="policy-section">
          <h2>11. Modifications</h2>
          <p>
            We may update this Privacy Policy to reflect changes in our practices, 
            service improvements, or new legal requirements. The date of the last 
            update will be clearly indicated at the end of this document.
          </p>
        </section>
      `
    },
    ru: {
      title: 'Политика конфиденциальности',
      lastUpdated: TODAY,
      content: `
        <section class="policy-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Барселона, Испания) обрабатывает персональные данные 
            в соответствии с <strong>Общим регламентом по защите данных (GDPR)</strong>.
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Контролер данных</h2>
          <p>
            <strong>SkyArmenia</strong><br>
            Барселона, Испания<br>
            Контакт: <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a>
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Обрабатываемые данные</h2>
          <ul class="data-list">
            <li><strong>Данные аккаунта:</strong> Полное имя и адрес электронной почты для создания аккаунта и входа.</li>
            <li><strong>Технические данные:</strong> Автоматически записываемая информация, необходимая для безопасности и работы сервиса (IP-адреса, идентификаторы сессий, данные браузера).</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Цели обработки</h2>
          <ul class="purpose-list">
            <li>Предоставление доступа к вашему аккаунту и функциональности веб-сайта</li>
            <li>Обеспечение безопасности сервиса и предотвращение мошенничества</li>
            <li>Выполнение технического обслуживания и улучшений системы</li>
            <li>Отправка важных сообщений, связанных с вашим аккаунтом</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>4. Правовые основания</h2>
          <ul class="legal-basis-list">
            <li><strong>Исполнение договора:</strong> Предоставление запрашиваемой услуги (регистрация и вход)</li>
            <li><strong>Законный интерес:</strong> Безопасность системы и техническое обслуживание</li>
            <li><strong>Согласие:</strong> Для дополнительных функций при необходимости</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Период хранения</h2>
          <p>
            Мы храним ваши персональные данные, пока ваш аккаунт остается активным. 
            После закрытия аккаунта мы сохраняем информацию в течение времени, 
            необходимого для соблюдения правовых обязательств или защиты от потенциальных претензий.
          </p>
        </section>

        <section class="policy-section">
          <h2>6. Передача данных и обработчики</h2>
          <p>
            Мы не продаем и не коммерциализируем ваши персональные данные. Для хостинга и работы сервиса 
            мы сотрудничаем с технологическими провайдерами, которые действуют как обработчики данных 
            под строгими договорами о защите данных и адекватными мерами безопасности.
          </p>
          <p class="note">
            Для сохранения операционной гибкости мы не указываем конкретные названия в данном документе. 
            Если вам требуется информация о наших текущих провайдерах, вы можете запросить её по электронной почте.
          </p>
        </section>

        <section class="policy-section">
          <h2>7. Международные передачи</h2>
          <p>
            Если какой-либо поставщик услуг обрабатывает данные за пределами Европейского экономического пространства (ЕЭП), 
            мы требуем адекватных защитных гарантий, включая стандартные договорные оговорки, 
            одобренные Европейской комиссией.
          </p>
        </section>

        <section class="policy-section">
          <h2>8. Файлы cookie и аналогичные технологии</h2>
          <p>
            Мы используем только технические файлы cookie, необходимые для работы сервиса 
            (аутентификация пользователей, языковые предпочтения). Мы не используем файлы cookie 
            для аналитики или маркетинга по умолчанию.
          </p>
          <p>
            Для получения дополнительной информации см. нашу 
            <a href="/cookies" target="_blank" rel="noopener noreferrer" class="policy-link">Политику в отношении файлов cookie</a>.
          </p>
        </section>

        <section class="policy-section">
          <h2>9. Ваши права</h2>
          <p>В соответствии с GDPR у вас есть право на:</p>
          <ul class="rights-list">
            <li><strong>Доступ:</strong> Запрос информации об обработке ваших данных</li>
            <li><strong>Исправление:</strong> Исправление неточных или неполных данных</li>
            <li><strong>Удаление:</strong> Удаление ваших персональных данных</li>
            <li><strong>Возражение:</strong> Возражение против обработки в определенных обстоятельствах</li>
            <li><strong>Ограничение:</strong> Ограничение обработки ваших данных</li>
            <li><strong>Переносимость:</strong> Получение ваших данных в структурированном формате</li>
          </ul>
          <p>
            Для осуществления этих прав напишите на 
            <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a>, 
            приложив разумное подтверждение вашей личности.
          </p>
        </section>

        <section class="policy-section">
          <h2>10. Защита несовершеннолетних</h2>
          <p>
            Наш сервис не предназначен для несовершеннолетних младше 16 лет. Мы не собираем 
            сознательно персональную информацию от несовершеннолетних младше данного возраста.
          </p>
        </section>

        <section class="policy-section">
          <h2>11. Изменения</h2>
          <p>
            Мы можем обновлять данную Политику конфиденциальности, чтобы отразить изменения в наших 
            практиках, улучшения сервиса или новые правовые требования. Дата последнего обновления 
            будет четко указана в конце данного документа.
          </p>
        </section>
      `
    },
    hy: {
      title: 'Գաղտնիության քաղաքականություն',
      lastUpdated: TODAY,
      content: `
        <section class="policy-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Բարսելոնա, Իսպանիա) մշակում է անհատական տվյալները 
            համաձայն <strong>Տվյալների պաշտպանության ընդհանուր կանոնակարգի (GDPR)</strong>:
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Տվյալների վերահսկող</h2>
          <p>
            <strong>SkyArmenia</strong><br>
            Բարսելոնա, Իսպանիա<br>
            Կապ՝ <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a>
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Մշակվող տվյալներ</h2>
          <ul class="data-list">
            <li><strong>Հաշվի տվյալներ:</strong> Ամբողջ անունը և էլեկտրոնային փոստի հասցեն հաշվի ստեղծման և մուտքի համար:</li>
            <li><strong>Տեխնիկական տվյալներ:</strong> Ավտոմատ գրանցվող տեղեկություններ, որոնք անհրաժեշտ են ծառայության անվտանգության և աշխատանքի համար (IP հասցեներ, սեսիայի նույնականացուցիչներ, բրաուզերի տվյալներ):</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Մշակման նպատակները</h2>
          <ul class="purpose-list">
            <li>Ապահովել մուտք ձեր հաշիվ և կայքի գործառույթներին</li>
            <li>Ապահովել ծառայության անվտանգությունը և կանխել խարդախությունը</li>
            <li>Կատարել տեխնիկական սպասարկում և համակարգի բարելավում</li>
            <li>Ուղարկել կարևոր հաղորդագրություններ ձեր հաշվի վերաբերյալ</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>4. Իրավական հիմքերը</h2>
          <ul class="legal-basis-list">
            <li><strong>Պայմանագրի կատարում:</strong> Ապահովել հարցվող ծառայությունը (գրանցում և մուտք)</li>
            <li><strong>Օրինական շահ:</strong> Համակարգի անվտանգություն և տեխնիկական սպասարկում</li>
            <li><strong>Համաձայնություն:</strong> Լրացուցիչ գործառույթների համար, երբ անհրաժեշտ է</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Պահպանման ժամկետը</h2>
          <p>
            Մենք պահպանում ենք ձեր անհատական տվյալները, քանի դեռ ձեր հաշիվը մնում է ակտիվ: 
            Հաշվի փակումից հետո մենք պահում ենք տեղեկությունները այն ժամկետում, 
            որը անհրաժեշտ է իրավական պարտավորությունների կատարման կամ հնարավոր հայցերի դեմ պաշտպանության համար:
          </p>
        </section>

        <section class="policy-section">
          <h2>6. Տվյալների փոխանցում և մշակողներ</h2>
          <p>
            Մենք չենք վաճառում կամ կոմերցայնացնում ձեր անհատական տվյալները: Ծառայության հոստինգի և գործարկման համար 
            մենք համագործակցում ենք տեխնոլոգիական մատակարարների հետ, որոնք գործում են որպես տվյալների մշակողներ՝ 
            սահմանված տվյալների պաշտպանության պայմանագրերի և բավարար անվտանգության միջոցների ներքո:
          </p>
          <p class="note">
            Գործառնական ճկունությունը պահպանելու համար մենք չենք նշում կոնկրետ անունները այս փաստաթղթում: 
            Եթե ձեզ անհրաժեշտ է տեղեկություն մեր ներկայիս մատակարարների մասին, կարող եք դա հարցնել էլեկտրոնային փոստով:
          </p>
        </section>

        <section class="policy-section">
          <h2>7. Միջազգային փոխանցումներ</h2>
          <p>
            Եթե ծառայությունների որևէ մատակարար մշակում է տվյալները Եվրոպական տնտեսական տարածքից (ԵՏՏ) դուրս, 
            մենք պահանջում ենք անհրաժեշտ պաշտպանական երաշխիքներ, ներառյալ ստանդարտ պայմանագրային դրույթները, 
            որոնք հաստատված են Եվրոպական հանձնաժողովի կողմից:
          </p>
        </section>

        <section class="policy-section">
          <h2>8. Cookie-ներ և նմանատիպ տեխնոլոգիաներ</h2>
          <p>
            Մենք օգտագործում ենք միայն տեխնիկական cookie-ներ, որոնք անհրաժեշտ են ծառայության գործարկման համար 
            (օգտատերերի նույնականացում, լեզվի նախապատվություններ): Մենք չենք օգտագործում վերլուծական 
            կամ մարքեթինգային cookie-ներ լռելյայն:
          </p>
          <p>
            Լրացուցիչ տեղեկությունների համար տես մեր 
            <a href="/cookies" target="_blank" rel="noopener noreferrer" class="policy-link">Cookie-ների քաղաքականությունը</a>:
          </p>
        </section>

        <section class="policy-section">
          <h2>9. Ձեր իրավունքները</h2>
          <p>GDPR-ի համաձայն դուք իրավունք ունեք՝</p>
          <ul class="rights-list">
            <li><strong>Մուտք գործել:</strong> Հարցնել ձեր տվյալների մշակման մասին տեղեկություն</li>
            <li><strong>Ուղղել:</strong> Ճշգրտել սխալ կամ անամբողջ տվյալները</li>
            <li><strong>Ջնջել:</strong> Ջնջել ձեր անհատական տվյալները</li>
            <li><strong>Առարկել:</strong> Առարկել մշակմանը որոշակի հանգամանքներում</li>
            <li><strong>Սահմանափակել:</strong> Սահմանափակել ձեր տվյալների մշակումը</li>
            <li><strong>Տեղափոխել:</strong> Ստանալ ձեր տվյալները կառուցվածքված ֆորմատով</li>
          </ul>
          <p>
            Այս իրավունքները իրականացնելու համար գրեք 
            <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a> հասցեին՝ 
            ներառելով ձեր ինքնության բավարար ապացույց:
          </p>
        </section>

        <section class="policy-section">
          <h2>10. Անչափահասների պաշտպանություն</h2>
          <p>
            Մեր ծառայությունը նախատեսված չէ 16 տարեկանից ցածր անչափահասների համար: Մենք գիտակցաբար չենք հավաքում 
            անձնական տեղեկություններ այդ տարիքից ցածր անչափահասներից:
          </p>
        </section>

        <section class="policy-section">
          <h2>11. Փոփոխություններ</h2>
          <p>
            Մենք կարող ենք թարմացնել այս Գաղտնիության քաղաքականությունը՝ արտացոլելու մեր գործելակերպի փոփոխությունները, 
            ծառայության բարելավումները կամ նոր իրավական պահանջները: Վերջին թարմացման ամսաթիվը 
            հստակ նշված կլինի այս փաստաթղթի վերջում:
          </p>
        </section>
      `
    }
  };

  // Get current policy content
  $: currentPolicy = PRIVACY_POLICIES[$lang as SupportedLanguage] || PRIVACY_POLICIES.es;
</script>

<div class="legal-page">
  <div class="container">
    <header class="policy-header">
      <h1 class="policy-title">{currentPolicy.title}</h1>
      <p class="last-updated">
        {#if $lang === 'es'}
          Última actualización: {currentPolicy.lastUpdated}
        {:else if $lang === 'en'}
          Last updated: {currentPolicy.lastUpdated}
        {:else if $lang === 'ru'}
          Последнее обновление: {currentPolicy.lastUpdated}
        {:else if $lang === 'hy'}
          Վերջին թարմացումը՝ {currentPolicy.lastUpdated}
        {/if}
      </p>
    </header>

    <article class="policy-content">
      {@html currentPolicy.content}
    </article>
  </div>
</div>

<style>
  .legal-page {
    min-height: 100vh;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
  }

  .policy-header {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    text-align: center;
    border: 1px solid rgba(226, 232, 240, 0.8);
  }

  .policy-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 0.75rem;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }

  .last-updated {
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0;
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-radius: 8px;
    display: inline-block;
    border: 1px solid #e2e8f0;
  }

  .policy-content {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(226, 232, 240, 0.8);
    line-height: 1.7;
    color: #334155;
  }

  /* Global styles for policy content */
  .policy-content :global(.policy-intro) {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-left: 4px solid #3b82f6;
  }

  .policy-content :global(.company-info) {
    font-size: 1.1rem;
    margin: 0;
    color: #475569;
    font-weight: 500;
    line-height: 1.6;
  }

  .policy-content :global(.policy-section) {
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .policy-content :global(.policy-section:last-child) {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .policy-content :global(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
    position: relative;
  }

  .policy-content :global(h2::before) {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 1px;
  }

  .policy-content :global(p) {
    margin: 0 0 1rem;
    color: #475569;
    font-size: 1rem;
    line-height: 1.7;
  }

  .policy-content :global(.note) {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
    font-size: 0.95rem;
    color: #92400e;
  }

  /* List styles */
  .policy-content :global(.data-list),
  .policy-content :global(.purpose-list),
  .policy-content :global(.legal-basis-list),
  .policy-content :global(.rights-list) {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  .policy-content :global(.data-list li),
  .policy-content :global(.purpose-list li),
  .policy-content :global(.legal-basis-list li),
  .policy-content :global(.rights-list li) {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    margin: 0.75rem 0;
    border-left: 4px solid #e2e8f0;
    transition: all 0.2s ease;
    position: relative;
  }

  .policy-content :global(.data-list li:hover),
  .policy-content :global(.purpose-list li:hover),
  .policy-content :global(.legal-basis-list li:hover),
  .policy-content :global(.rights-list li:hover) {
    background: #f1f5f9;
    border-left-color: #3b82f6;
    transform: translateX(4px);
  }

  .policy-content :global(.data-list li strong),
  .policy-content :global(.legal-basis-list li strong),
  .policy-content :global(.rights-list li strong) {
    color: #1e293b;
    font-weight: 600;
  }

  /* Cookie-specific styles */
  .policy-content :global(.cookie-types-list),
  .policy-content :global(.cookie-details-list),
  .policy-content :global(.management-list),
  .policy-content :global(.third-party-list),
  .policy-content :global(.withdrawal-list) {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  .policy-content :global(.cookie-types-list li),
  .policy-content :global(.management-list li),
  .policy-content :global(.third-party-list li),
  .policy-content :global(.withdrawal-list li) {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    margin: 0.75rem 0;
    border-left: 4px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .policy-content :global(.cookie-details-list li) {
    background: #fefefe;
    border-radius: 6px;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-left: 3px solid #f1f5f9;
    font-size: 0.95rem;
  }

  .policy-content :global(.cookie-category) {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    border: 1px solid #e2e8f0;
  }

  .policy-content :global(.cookie-category h4) {
    color: #1e293b;
    margin: 0 0 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .policy-content :global(.cookie-update) {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 1rem;
    margin: 2rem 0 0;
    text-align: center;
  }

  .policy-content :global(.cookie-update p) {
    margin: 0;
    color: #0369a1;
    font-weight: 500;
  }

  /* Link styles */
  .policy-content :global(.email-link),
  .policy-content :global(.policy-link) {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .policy-content :global(.email-link:hover),
  .policy-content :global(.policy-link:hover) {
    color: #1d4ed8;
    border-bottom-color: #1d4ed8;
  }

  /* Responsive design */
  /* Large tablets and small desktops */
  @media (max-width: 1024px) {
    .container {
      max-width: 100%;
      padding: 0 1rem;
    }

    .policy-header,
    .policy-content {
      margin: 0 1rem 1.5rem;
    }
  }

  /* Tablets */
  @media (max-width: 768px) {
    .legal-page {
      padding: 1.5rem 0.75rem;
    }

    .container {
      padding: 0 0.5rem;
    }

    .policy-header,
    .policy-content {
      padding: 1.75rem;
      border-radius: 12px;
      margin: 0 0.5rem 1.25rem;
    }

    .policy-title {
      font-size: 2.2rem;
      line-height: 1.15;
    }

    .policy-content :global(h2) {
      font-size: 1.35rem;
    }

    .policy-content :global(.policy-intro) {
      padding: 1.25rem;
    }

    .policy-content :global(.data-list li),
    .policy-content :global(.purpose-list li),
    .policy-content :global(.legal-basis-list li),
    .policy-content :global(.rights-list li) {
      padding: 0.875rem;
      margin: 0.625rem 0;
    }
  }

  /* Large phones */
  @media (max-width: 640px) {
    .legal-page {
      padding: 1rem 0.5rem;
    }

    .policy-header,
    .policy-content {
      padding: 1.5rem;
      margin: 0 0.25rem 1rem;
      border-radius: 10px;
    }

    .policy-title {
      font-size: 2rem;
    }

    .last-updated {
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
    }

    .policy-content :global(h2) {
      font-size: 1.25rem;
      padding-bottom: 0.4rem;
    }

    .policy-content :global(.policy-section) {
      margin-bottom: 2rem;
      padding-bottom: 1.25rem;
    }
  }

  /* Standard phones */
  @media (max-width: 480px) {
    .legal-page {
      padding: 0.75rem 0.375rem;
    }

    .policy-header,
    .policy-content {
      padding: 1.25rem;
      margin: 0 0.125rem 0.875rem;
      border-radius: 8px;
    }

    .policy-title {
      font-size: 1.75rem;
      margin-bottom: 0.625rem;
    }

    .last-updated {
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
    }

    .policy-content :global(h2) {
      font-size: 1.2rem;
    }

    .policy-content :global(.policy-intro) {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .policy-content :global(.company-info) {
      font-size: 1rem;
    }

    .policy-content :global(.data-list li),
    .policy-content :global(.purpose-list li),
    .policy-content :global(.legal-basis-list li),
    .policy-content :global(.rights-list li) {
      padding: 0.75rem;
      margin: 0.5rem 0;
      font-size: 0.95rem;
    }

    .policy-content :global(.note) {
      padding: 0.875rem;
      font-size: 0.9rem;
    }

    .policy-content :global(p) {
      font-size: 0.95rem;
    }
  }

  /* Small phones */
  @media (max-width: 375px) {
    .legal-page {
      padding: 0.5rem 0.25rem;
    }

    .policy-header,
    .policy-content {
      padding: 1rem;
      margin: 0 0 0.75rem;
    }

    .policy-title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .last-updated {
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
    }

    .policy-content :global(h2) {
      font-size: 1.1rem;
    }

    .policy-content :global(.policy-intro) {
      padding: 0.875rem;
    }

    .policy-content :global(.policy-section) {
      margin-bottom: 1.75rem;
      padding-bottom: 1rem;
    }

    .policy-content :global(.data-list li),
    .policy-content :global(.purpose-list li),
    .policy-content :global(.legal-basis-list li),
    .policy-content :global(.rights-list li) {
      padding: 0.625rem;
      font-size: 0.9rem;
    }
  }

  /* Accessibility and reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .policy-content :global(.data-list li),
    .policy-content :global(.purpose-list li),
    .policy-content :global(.legal-basis-list li),
    .policy-content :global(.rights-list li) {
      transition: none;
    }

    .policy-content :global(.data-list li:hover),
    .policy-content :global(.purpose-list li:hover),
    .policy-content :global(.legal-basis-list li:hover),
    .policy-content :global(.rights-list li:hover) {
      transform: none;
    }
  }

  /* Print styles */
  @media print {
    .legal-page {
      background: white;
      padding: 0;
    }

    .policy-header,
    .policy-content {
      box-shadow: none;
      border: none;
    }

    .policy-content :global(.data-list li),
    .policy-content :global(.purpose-list li),
    .policy-content :global(.legal-basis-list li),
    .policy-content :global(.rights-list li) {
      background: white;
      border: 1px solid #e2e8f0;
    }
  }
</style>
