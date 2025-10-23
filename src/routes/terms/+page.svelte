<svelte:head>
  <title>Términos y Condiciones - SkyArmenia | Vuelos Barcelona-Yerevan</title>
  <meta name="description" content="Términos y condiciones de uso de SkyArmenia. Política de reservas, cancelaciones y condiciones legales para vuelos Barcelona-Yerevan.">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Términos y Condiciones - SkyArmenia">
  <meta property="og:description" content="Términos y condiciones de uso de SkyArmenia para reservas de vuelos Barcelona-Yerevan.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://skyarmenia.com/terms">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://skyarmenia.com/terms">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Términos y Condiciones",
      "description": "Términos y condiciones de uso de SkyArmenia",
      "publisher": {
        "@type": "Organization",
        "name": "SkyArmenia"
      }
    }
  </script>
</svelte:head>

<!-- Términos y Condiciones Profesionales - SkyArmenia -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { lang } from '$lib/i18n';

  // Tipos y constantes
  interface TermsContent {
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

  // Contenido de términos por idioma
  const TERMS_CONDITIONS: Record<SupportedLanguage, TermsContent> = {
    es: {
      title: 'Términos y Condiciones',
      lastUpdated: 'Última actualización',
      content: `
        <section class="terms-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Barcelona, España) establece los siguientes términos y condiciones 
            que regulan el uso de nuestros servicios de búsqueda y comparación de vuelos.
          </p>
        </section>

        <section class="terms-section">
          <h2>1. Naturaleza del Servicio</h2>
          <div class="service-description">
            <p>
              SkyArmenia es una plataforma de <strong>búsqueda y agregación de vuelos</strong> que permite 
              a los usuarios comparar ofertas de múltiples proveedores de servicios aéreos.
            </p>
            <div class="important-notice">
              <h3>Importante:</h3>
              <ul class="notice-list">
                <li>La selección final y <strong>compra se realizan directamente en sitios de terceros</strong></li>
                <li>SkyArmenia <strong>no forma parte del contrato de transporte aéreo</strong></li>
                <li>No garantizamos precios, disponibilidad o cambios de última hora publicados por proveedores</li>
                <li>Actuamos únicamente como intermediario tecnológico de búsqueda</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>2. Registro de Cuenta y Acceso</h2>
          <div class="account-terms">
            <p>
              Los usuarios pueden crear una cuenta para acceder a funcionalidades adicionales 
              y personalizar su experiencia de búsqueda.
            </p>
            <ul class="terms-list">
              <li><strong>Información requerida:</strong> Nombre completo y dirección de correo electrónico válida</li>
              <li><strong>Responsabilidad del usuario:</strong> Mantener credenciales seguras y actualizadas</li>
              <li><strong>Uso autorizado:</strong> Una cuenta por persona, uso personal y no comercial</li>
              <li><strong>Terminación:</strong> Podemos suspender cuentas por uso indebido o violación de términos</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>3. Precios y Disponibilidad</h2>
          <div class="pricing-terms">
            <p>
              La información de precios y disponibilidad mostrada en nuestra plataforma 
              está sujeta a las siguientes condiciones:
            </p>
            <ul class="terms-list">
              <li><strong>Carácter informativo:</strong> Los precios son referenciales y pueden cambiar</li>
              <li><strong>Actualización continua:</strong> Sincronizamos datos regularmente con proveedores</li>
              <li><strong>Confirmación final:</strong> El proveedor confirma precio y disponibilidad real</li>
              <li><strong>Variaciones posibles:</strong> Diferencias por tasas, impuestos o promociones</li>
            </ul>
            <div class="price-disclaimer">
              <p>
                <strong>Aviso:</strong> SkyArmenia no controla ni garantiza la exactitud de los precios 
                mostrados por terceros. Siempre verifique el precio final antes de completar su compra.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>4. Enlaces Externos y Compras de Terceros</h2>
          <div class="external-links">
            <p>
              Al utilizar nuestros enlaces hacia sitios web de terceros, usted acepta y comprende que:
            </p>
            <ul class="terms-list">
              <li>Será redirigido a plataformas externas independientes</li>
              <li>Debe aceptar los términos y condiciones específicos de cada proveedor</li>
              <li>SkyArmenia no controla las políticas de dichos sitios externos</li>
              <li>Es su responsabilidad revisar y comprender las condiciones de compra</li>
            </ul>
            <div class="recommendation">
              <p>
                <strong>Recomendación:</strong> Lea siempre detenidamente los términos del proveedor, 
                políticas de cancelación, equipaje y otros servicios antes de realizar su reserva.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>5. Limitación de Responsabilidad</h2>
          <div class="liability-terms">
            <p>
              En el marco legal aplicable, SkyArmenia limita su responsabilidad conforme a lo siguiente:
            </p>
            <ul class="liability-list">
              <li><strong>Exclusión de garantías:</strong> No garantizamos la exactitud completa de la información</li>
              <li><strong>Incidencias de terceros:</strong> No respondemos por retrasos, cancelaciones o cambios de proveedores</li>
              <li><strong>Pérdidas indirectas:</strong> No asumimos responsabilidad por daños consecuenciales</li>
              <li><strong>Límite máximo:</strong> Nuestra responsabilidad se limita al valor de nuestros servicios</li>
            </ul>
            <div class="legal-note">
              <p>
                Esta limitación se aplica en la máxima medida permitida por la legislación española 
                y europea, respetando siempre los derechos irrenunciables del consumidor.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>6. Protección de Datos Personales</h2>
          <div class="data-protection">
            <p>
              El tratamiento de sus datos personales se rige por el Reglamento General 
              de Protección de Datos (RGPD) y nuestra Política de Privacidad.
            </p>
            <ul class="terms-list">
              <li>Recopilamos únicamente datos necesarios para el servicio</li>
              <li>Aplicamos medidas de seguridad técnicas y organizativas</li>
              <li>Respetamos todos sus derechos bajo el RGPD</li>
              <li>No compartimos datos con terceros sin su consentimiento</li>
            </ul>
            <p>
              Para información detallada, consulte nuestra 
              <a href="/privacy" class="policy-link">Política de Privacidad</a>.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>7. Uso Aceptable y Prohibiciones</h2>
          <div class="acceptable-use">
            <p>Al utilizar SkyArmenia, usted se compromete a:</p>
            <ul class="terms-list">
              <li>Usar el servicio únicamente para fines legales y personales</li>
              <li>No intentar acceder a sistemas o datos no autorizados</li>
              <li>No utilizar métodos automatizados que sobrecarguen nuestros servidores</li>
              <li>No reproducir, distribuir o modificar nuestro contenido sin autorización</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>8. Propiedad Intelectual</h2>
          <div class="intellectual-property">
            <p>
              Todos los derechos de propiedad intelectual sobre la plataforma SkyArmenia, 
              incluyendo diseño, código, marca y contenido, pertenecen a SkyArmenia o sus licenciantes.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>9. Modificaciones de los Términos</h2>
          <div class="terms-updates">
            <p>
              Nos reservamos el derecho a actualizar estos términos y condiciones para reflejar 
              cambios en nuestros servicios, requisitos legales o mejoras operativas.
            </p>
            <p>
              Los cambios significativos serán notificados con antelación razonable 
              a través de nuestro sitio web o por correo electrónico.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>10. Jurisdicción y Ley Aplicable</h2>
          <div class="jurisdiction">
            <p>
              Estos términos se rigen por la legislación española. Cualquier disputa 
              será sometida a la jurisdicción de los tribunales de Barcelona, España.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>11. Contacto y Soporte</h2>
          <div class="contact-info">
            <p>
              Para consultas legales, dudas sobre estos términos o soporte técnico:
            </p>
            <p class="contact-details">
              <strong>Correo electrónico:</strong> 
              <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a><br>
              <strong>Dirección:</strong> Barcelona, España
            </p>
          </div>
        </section>
      `
    },
    en: {
      title: 'Terms and Conditions',
      lastUpdated: TODAY,
      content: `
        <section class="terms-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Barcelona, Spain) establishes the following terms and conditions 
            that govern the use of our flight search and comparison services.
          </p>
        </section>

        <section class="terms-section">
          <h2>1. Nature of Service</h2>
          <div class="service-description">
            <p>
              SkyArmenia is a <strong>flight search and aggregation platform</strong> that enables 
              users to compare offers from multiple airline service providers.
            </p>
            <div class="important-notice">
              <h3>Important:</h3>
              <ul class="notice-list">
                <li>Final selection and <strong>purchase are made directly on third-party websites</strong></li>
                <li>SkyArmenia <strong>is not a party to the air transport contract</strong></li>
                <li>We do not guarantee prices, availability, or last-minute changes published by providers</li>
                <li>We act solely as a technological search intermediary</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>2. Account Registration and Access</h2>
          <div class="account-terms">
            <p>
              Users may create an account to access additional functionalities 
              and customize their search experience.
            </p>
            <ul class="terms-list">
              <li><strong>Required information:</strong> Full name and valid email address</li>
              <li><strong>User responsibility:</strong> Maintain secure and updated credentials</li>
              <li><strong>Authorized use:</strong> One account per person, personal and non-commercial use</li>
              <li><strong>Termination:</strong> We may suspend accounts for misuse or terms violation</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>3. Pricing and Availability</h2>
          <div class="pricing-terms">
            <p>
              Pricing and availability information displayed on our platform 
              is subject to the following conditions:
            </p>
            <ul class="terms-list">
              <li><strong>Informational nature:</strong> Prices are indicative and may change</li>
              <li><strong>Continuous updates:</strong> We sync data regularly with providers</li>
              <li><strong>Final confirmation:</strong> Provider confirms actual price and availability</li>
              <li><strong>Possible variations:</strong> Differences due to taxes, fees, or promotions</li>
            </ul>
            <div class="price-disclaimer">
              <p>
                <strong>Notice:</strong> SkyArmenia does not control or guarantee the accuracy of prices 
                displayed by third parties. Always verify the final price before completing your purchase.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>4. External Links and Third-Party Purchases</h2>
          <div class="external-links">
            <p>
              By using our links to third-party websites, you accept and understand that:
            </p>
            <ul class="terms-list">
              <li>You will be redirected to independent external platforms</li>
              <li>You must accept the specific terms and conditions of each provider</li>
              <li>SkyArmenia does not control the policies of such external sites</li>
              <li>It is your responsibility to review and understand purchase conditions</li>
            </ul>
            <div class="recommendation">
              <p>
                <strong>Recommendation:</strong> Always carefully read the provider's terms, 
                cancellation policies, baggage rules, and other services before making your reservation.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>5. Limitation of Liability</h2>
          <div class="liability-terms">
            <p>
              Within the applicable legal framework, SkyArmenia limits its liability as follows:
            </p>
            <ul class="liability-list">
              <li><strong>Warranty exclusion:</strong> We do not guarantee complete accuracy of information</li>
              <li><strong>Third-party incidents:</strong> We are not liable for delays, cancellations, or provider changes</li>
              <li><strong>Indirect losses:</strong> We assume no responsibility for consequential damages</li>
              <li><strong>Maximum limit:</strong> Our liability is limited to the value of our services</li>
            </ul>
            <div class="legal-note">
              <p>
                This limitation applies to the maximum extent permitted by Spanish and European legislation, 
                always respecting inalienable consumer rights.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>6. Personal Data Protection</h2>
          <div class="data-protection">
            <p>
              The processing of your personal data is governed by the General Data 
              Protection Regulation (GDPR) and our Privacy Policy.
            </p>
            <ul class="terms-list">
              <li>We collect only data necessary for the service</li>
              <li>We apply technical and organizational security measures</li>
              <li>We respect all your rights under GDPR</li>
              <li>We do not share data with third parties without your consent</li>
            </ul>
            <p>
              For detailed information, see our 
              <a href="/privacy" class="policy-link">Privacy Policy</a>.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>7. Acceptable Use and Prohibitions</h2>
          <div class="acceptable-use">
            <p>By using SkyArmenia, you agree to:</p>
            <ul class="terms-list">
              <li>Use the service only for legal and personal purposes</li>
              <li>Not attempt to access unauthorized systems or data</li>
              <li>Not use automated methods that overload our servers</li>
              <li>Not reproduce, distribute, or modify our content without authorization</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>8. Intellectual Property</h2>
          <div class="intellectual-property">
            <p>
              All intellectual property rights over the SkyArmenia platform, 
              including design, code, trademark, and content, belong to SkyArmenia or its licensors.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>9. Terms Modifications</h2>
          <div class="terms-updates">
            <p>
              We reserve the right to update these terms and conditions to reflect 
              changes in our services, legal requirements, or operational improvements.
            </p>
            <p>
              Significant changes will be notified with reasonable advance notice 
              through our website or email.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>10. Jurisdiction and Applicable Law</h2>
          <div class="jurisdiction">
            <p>
              These terms are governed by Spanish law. Any dispute 
              will be submitted to the jurisdiction of Barcelona, Spain courts.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>11. Contact and Support</h2>
          <div class="contact-info">
            <p>
              For legal inquiries, questions about these terms, or technical support:
            </p>
            <p class="contact-details">
              <strong>Email:</strong> 
              <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a><br>
              <strong>Address:</strong> Barcelona, Spain
            </p>
          </div>
        </section>
      `
    },
    ru: {
      title: 'Условия использования',
      lastUpdated: TODAY,
      content: `
        <section class="terms-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Барселона, Испания) устанавливает следующие условия использования, 
            регулирующие использование наших услуг поиска и сравнения авиабилетов.
          </p>
        </section>

        <section class="terms-section">
          <h2>1. Характер сервиса</h2>
          <div class="service-description">
            <p>
              SkyArmenia — это <strong>платформа поиска и агрегации авиабилетов</strong>, которая позволяет 
              пользователям сравнивать предложения от нескольких поставщиков авиационных услуг.
            </p>
            <div class="important-notice">
              <h3>Важно:</h3>
              <ul class="notice-list">
                <li>Окончательный выбор и <strong>покупка осуществляются непосредственно на сайтах третьих лиц</strong></li>
                <li>SkyArmenia <strong>не является стороной договора авиаперевозки</strong></li>
                <li>Мы не гарантируем цены, наличие мест или изменения последнего момента, публикуемые поставщиками</li>
                <li>Мы действуем исключительно как технологический посредник поиска</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>2. Регистрация аккаунта и доступ</h2>
          <div class="account-terms">
            <p>
              Пользователи могут создать аккаунт для доступа к дополнительным функциям 
              и персонализации поискового опыта.
            </p>
            <ul class="terms-list">
              <li><strong>Необходимая информация:</strong> Полное имя и действительный адрес электронной почты</li>
              <li><strong>Ответственность пользователя:</strong> Поддерживать безопасные и актуальные учетные данные</li>
              <li><strong>Авторизованное использование:</strong> Один аккаунт на человека, личное и некоммерческое использование</li>
              <li><strong>Прекращение:</strong> Мы можем приостановить аккаунты за неправильное использование или нарушение условий</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>3. Цены и наличие мест</h2>
          <div class="pricing-terms">
            <p>
              Информация о ценах и наличии мест, отображаемая на нашей платформе, 
              подчиняется следующим условиям:
            </p>
            <ul class="terms-list">
              <li><strong>Информационный характер:</strong> Цены являются ориентировочными и могут изменяться</li>
              <li><strong>Непрерывные обновления:</strong> Мы регулярно синхронизируем данные с поставщиками</li>
              <li><strong>Окончательное подтверждение:</strong> Поставщик подтверждает фактическую цену и наличие мест</li>
              <li><strong>Возможные вариации:</strong> Различия из-за налогов, сборов или акций</li>
            </ul>
            <div class="price-disclaimer">
              <p>
                <strong>Уведомление:</strong> SkyArmenia не контролирует и не гарантирует точность цен, 
                отображаемых третьими лицами. Всегда проверяйте окончательную цену перед завершением покупки.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>4. Внешние ссылки и покупки у третьих лиц</h2>
          <div class="external-links">
            <p>
              Используя наши ссылки на сайты третьих лиц, вы принимаете и понимаете, что:
            </p>
            <ul class="terms-list">
              <li>Вы будете перенаправлены на независимые внешние платформы</li>
              <li>Вы должны принять конкретные условия каждого поставщика</li>
              <li>SkyArmenia не контролирует политики таких внешних сайтов</li>
              <li>Вы несете ответственность за изучение и понимание условий покупки</li>
            </ul>
            <div class="recommendation">
              <p>
                <strong>Рекомендация:</strong> Всегда внимательно читайте условия поставщика, 
                политики отмены, правила багажа и другие услуги перед бронированием.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>5. Ограничение ответственности</h2>
          <div class="liability-terms">
            <p>
              В рамках применимого правового регулирования SkyArmenia ограничивает свою ответственность следующим образом:
            </p>
            <ul class="liability-list">
              <li><strong>Исключение гарантий:</strong> Мы не гарантируем полную точность информации</li>
              <li><strong>Инциденты третьих лиц:</strong> Мы не несем ответственности за задержки, отмены или изменения поставщиков</li>
              <li><strong>Косвенные убытки:</strong> Мы не несем ответственности за косвенный ущерб</li>
              <li><strong>Максимальный лимит:</strong> Наша ответственность ограничена стоимостью наших услуг</li>
            </ul>
            <div class="legal-note">
              <p>
                Это ограничение применяется в максимальной степени, разрешенной испанским и европейским законодательством, 
                всегда соблюдая неотъемлемые права потребителей.
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>6. Защита персональных данных</h2>
          <div class="data-protection">
            <p>
              Обработка ваших персональных данных регулируется Общим регламентом 
              по защите данных (GDPR) и нашей Политикой конфиденциальности.
            </p>
            <ul class="terms-list">
              <li>Мы собираем только данные, необходимые для оказания услуги</li>
              <li>Мы применяем технические и организационные меры безопасности</li>
              <li>Мы соблюдаем все ваши права в соответствии с GDPR</li>
              <li>Мы не передаем данные третьим лицам без вашего согласия</li>
            </ul>
            <p>
              Для подробной информации см. нашу 
              <a href="/privacy" class="policy-link">Политику конфиденциальности</a>.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>7. Допустимое использование и запреты</h2>
          <div class="acceptable-use">
            <p>Используя SkyArmenia, вы соглашаетесь:</p>
            <ul class="terms-list">
              <li>Использовать сервис только в законных и личных целях</li>
              <li>Не пытаться получить доступ к неавторизованным системам или данным</li>
              <li>Не использовать автоматизированные методы, перегружающие наши серверы</li>
              <li>Не воспроизводить, распространять или изменять наш контент без разрешения</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>8. Интеллектуальная собственность</h2>
          <div class="intellectual-property">
            <p>
              Все права интеллектуальной собственности на платформу SkyArmenia, 
              включая дизайн, код, торговую марку и контент, принадлежат SkyArmenia или ее лицензиарам.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>9. Изменения условий</h2>
          <div class="terms-updates">
            <p>
              Мы оставляем за собой право обновлять эти условия для отражения 
              изменений в наших услугах, правовых требованиях или операционных улучшениях.
            </p>
            <p>
              Значительные изменения будут уведомлены с разумным предварительным уведомлением 
              через наш веб-сайт или по электронной почте.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>10. Юрисдикция и применимое право</h2>
          <div class="jurisdiction">
            <p>
              Эти условия регулируются испанским правом. Любой спор 
              будет передан в юрисдикцию судов Барселоны, Испания.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>11. Контакты и поддержка</h2>
          <div class="contact-info">
            <p>
              Для правовых запросов, вопросов об этих условиях или технической поддержки:
            </p>
            <p class="contact-details">
              <strong>Электронная почта:</strong> 
              <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a><br>
              <strong>Адрес:</strong> Барселона, Испания
            </p>
          </div>
        </section>
      `
    },
    hy: {
      title: 'Օգտագործման պայմաններ',
      lastUpdated: TODAY,
      content: `
        <section class="terms-intro">
          <p class="company-info">
            <strong>SkyArmenia</strong> (Բարսելոնա, Իսպանիա) սահմանում է հետևյալ օգտագործման պայմանները, 
            որոնք կարգավորում են մեր թռիչքների որոնման և համեմատման ծառայությունների օգտագործումը:
          </p>
        </section>

        <section class="terms-section">
          <h2>1. Ծառայության բնույթը</h2>
          <div class="service-description">
            <p>
              SkyArmenia-ն <strong>թռիչքների որոնման և ագրեգացիայի պլատֆորմ</strong> է, որը թույլ է տալիս 
              օգտատերերին համեմատել առաջարկություններ բազմաթիվ ավիածառայությունների մատակարարներից:
            </p>
            <div class="important-notice">
              <h3>Կարևոր:</h3>
              <ul class="notice-list">
                <li>Վերջնական ընտրությունը և <strong>գնումը կատարվում են անմիջապես երրորդ կողմի կայքերում</strong></li>
                <li>SkyArmenia-ն <strong>չէ ավիափոխադրման պայմանագրի կողմը</strong></li>
                <li>Մենք չենք երաշխավորում գները, հասանելիությունը կամ վերջին պահի փոփոխությունները, որոնք հրապարակվում են մատակարարների կողմից</li>
                <li>Մենք գործում ենք բացառապես որպես տեխնոլոգիական որոնման միջնորդ</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>2. Հաշվի գրանցում և մուտք</h2>
          <div class="account-terms">
            <p>
              Օգտատերերը կարող են ստեղծել հաշիվ՝ մուտք գործելու լրացուցիչ գործառույթներին 
              և անհատականացնելու իրենց որոնման փորձառությունը:
            </p>
            <ul class="terms-list">
              <li><strong>Պահանջվող տեղեկություններ:</strong> Ամբողջական անուն և վավեր էլ. փոստի հասցե</li>
              <li><strong>Օգտատիրոջ պատասխանատվություն:</strong> Պահպանել անվտանգ և թարմացված գրանցման տվյալներ</li>
              <li><strong>Թույլատրված օգտագործում:</strong> Մեկ հաշիվ մեկ անձի համար, անձնական և ոչ առևտրային օգտագործում</li>
              <li><strong>Դադարեցում:</strong> Մենք կարող ենք կասեցնել հաշիվները սխալ օգտագործման կամ պայմանների խախտման դեպքում</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>3. Գներ և հասանելիություն</h2>
          <div class="pricing-terms">
            <p>
              Մեր պլատֆորմում ցուցադրվող գների և հասանելիության տեղեկատվությունը 
              ենթարկվում է հետևյալ պայմաններին:
            </p>
            <ul class="terms-list">
              <li><strong>Տեղեկատվական բնույթ:</strong> Գները ցուցադրական են և կարող են փոփոխվել</li>
              <li><strong>Շարունակական թարմացումներ:</strong> Մենք կանոնավորապես սինխրոնիզացնում ենք տվյալները մատակարարների հետ</li>
              <li><strong>Վերջնական հաստատում:</strong> Մատակարարը հաստատում է փաստացի գինը և հասանելիությունը</li>
              <li><strong>Հնարավոր տարբերություններ:</strong> Տարբերություններ հարկերի, վճարների կամ ակցիաների պատճառով</li>
            </ul>
            <div class="price-disclaimer">
              <p>
                <strong>Ծանուցում:</strong> SkyArmenia-ն չի վերահսկում և չի երաշխավորում երրորդ կողմերի 
                ցուցադրած գների ճշտությունը: Միշտ ստուգեք վերջնական գինը ձեր գնումն ավարտելուց առաջ:
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>4. Արտաքին հղումներ և երրորդ կողմերի գնումներ</h2>
          <div class="external-links">
            <p>
              Օգտագործելով մեր հղումները երրորդ կողմերի կայքեր, դուք ընդունում և հասկանում եք, որ:
            </p>
            <ul class="terms-list">
              <li>Դուք կվերաուղղորդվեք անկախ արտաքին պլատֆորմներ</li>
              <li>Դուք պետք է ընդունեք յուրաքանչյուր մատակարարի կոնկրետ պայմանները</li>
              <li>SkyArmenia-ն չի վերահսկում նման արտաքին կայքերի քաղաքականությունները</li>
              <li>Դուք պատասխանատու եք գնման պայմանները գնահատելու և հասկանալու համար</li>
            </ul>
            <div class="recommendation">
              <p>
                <strong>Առաջարկություն:</strong> Միշտ ուշադիր կարդացեք մատակարարի պայմանները, 
                չեղարկման քաղաքականությունները, ավելցուկային բեռի կանոնները և այլ ծառայությունները ամրագրումից առաջ:
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>5. Պատասխանատվության սահմանափակում</h2>
          <div class="liability-terms">
            <p>
              Կիրառելի իրավական շրջանակում SkyArmenia-ն սահմանափակում է իր պատասխանատվությունը հետևյալ կերպ:
            </p>
            <ul class="liability-list">
              <li><strong>Երաշխիքների բացառում:</strong> Մենք չենք երաշխավորում տեղեկությունների ամբողջական ճշտությունը</li>
              <li><strong>Երրորդ կողմերի միջադեպեր:</strong> Մենք պատասխանատու չենք ուշացումների, չեղարկումների կամ մատակարարների փոփոխությունների համար</li>
              <li><strong>Անուղղակի կորուստներ:</strong> Մենք պատասխանատվություն չենք կրում հետևանքային վնասների համար</li>
              <li><strong>Առավելագույն սահմանաչափ:</strong> Մեր պատասխանատվությունը սահմանափակված է մեր ծառայությունների արժեքով</li>
            </ul>
            <div class="legal-note">
              <p>
                Այս սահմանափակումը կիրառվում է իսպանական և եվրոպական օրենսդրությամբ թույլատրված առավելագույն չափով՝ 
                միշտ հարգելով սպառողների անվիճելի իրավունքները:
              </p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2>6. Անձնական տվյալների պաշտպանություն</h2>
          <div class="data-protection">
            <p>
              Ձեր անձնական տվյալների մշակումը կարգավորվում է Տվյալների պաշտպանության ընդհանուր 
              կանոնակարգով (GDPR) և մեր Գաղտնիության քաղաքականությամբ:
            </p>
            <ul class="terms-list">
              <li>Մենք հավաքում ենք միայն ծառայության համար անհրաժեշտ տվյալներ</li>
              <li>Մենք կիրառում ենք տեխնիկական և կազմակերպական անվտանգության միջոցներ</li>
              <li>Մենք հարգում ենք ձեր բոլոր իրավունքները GDPR-ի համաձայն</li>
              <li>Մենք չենք կիսվում տվյալներով երրորդ կողմերի հետ առանց ձեր համաձայնության</li>
            </ul>
            <p>
              Մանրամասն տեղեկությունների համար տես մեր 
              <a href="/privacy" class="policy-link">Գաղտնիության քաղաքականությունը</a>:
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>7. Թույլատրելի օգտագործում և արգելքներ</h2>
          <div class="acceptable-use">
            <p>Օգտագործելով SkyArmenia-ն, դուք համաձայնվում եք՝</p>
            <ul class="terms-list">
              <li>Օգտագործել ծառայությունը միայն օրինական և անձնական նպատակներով</li>
              <li>Չփորձել մուտք գործել չթույլատրված համակարգեր կամ տվյալներ</li>
              <li>Չօգտագործել ավտոմատացված մեթոդներ, որոնք գերբեռնում են մեր սերվերները</li>
              <li>Չվերարտադրել, չտարածել կամ չփոփոխել մեր բովանդակությունը առանց թույլտվության</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2>8. Մտավոր սեփականություն</h2>
          <div class="intellectual-property">
            <p>
              SkyArmenia պլատֆորմի բոլոր մտավոր սեփականության իրավունքները, 
              ներառյալ դիզայնը, կոդը, ապրանքանիշը և բովանդակությունը, պատկանում են SkyArmenia-ին կամ նրա լիցենզատներին:
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>9. Պայմանների փոփոխություններ</h2>
          <div class="terms-updates">
            <p>
              Մենք պահպանում ենք թարմացնելու այս պայմանները՝ արտացոլելու 
              մեր ծառայությունների փոփոխությունները, իրավական պահանջները կամ գործառնական բարելավումները:
            </p>
            <p>
              Նշանակալի փոփոխությունները կծանուցվեն բավականաչափ նախապես 
              մեր կայքի կամ էլ. փոստի միջոցով:
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>10. Իրավասություն և կիրառելի օրենք</h2>
          <div class="jurisdiction">
            <p>
              Այս պայմանները կարգավորվում են իսպանական օրենքով: Ցանկացած վեճ 
              կներկայացվի Բարսելոնայի, Իսպանիայի դատարանների իրավասությանը:
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2>11. Կապ և աջակցություն</h2>
          <div class="contact-info">
            <p>
              Իրավական հարցումների, այս պայմանների մասին հարցերի կամ տեխնիկական աջակցության համար:
            </p>
            <p class="contact-details">
              <strong>Էլ. փոստ:</strong> 
              <a href="mailto:${COMPANY_EMAIL}" class="email-link">${COMPANY_EMAIL}</a><br>
              <strong>Հասցե:</strong> Բարսելոնա, Իսպանիա
            </p>
          </div>
        </section>
      `
    }
  };

  // Get current terms content
  $: currentTerms = TERMS_CONDITIONS[$lang as SupportedLanguage] || TERMS_CONDITIONS.es;
</script>

<div class="legal-page">
  <div class="container">
    <header class="terms-header">
      <h1 class="terms-title">{currentTerms.title}</h1>
      <p class="last-updated">
        {#if $lang === 'es'}
          Última actualización: {currentTerms.lastUpdated}
        {:else if $lang === 'en'}
          Last updated: {currentTerms.lastUpdated}
        {:else if $lang === 'ru'}
          Последнее обновление: {currentTerms.lastUpdated}
        {:else if $lang === 'hy'}
          Վերջին թարմացումը՝ {currentTerms.lastUpdated}
        {/if}
      </p>
    </header>

    <article class="terms-content">
      {@html currentTerms.content}
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

  .terms-header {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    text-align: center;
    border: 1px solid rgba(226, 232, 240, 0.8);
  }

  .terms-title {
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

  .terms-content {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(226, 232, 240, 0.8);
    line-height: 1.7;
    color: #334155;
  }

  /* Global styles for terms content */
  .terms-content :global(.terms-intro) {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-left: 4px solid #10b981;
  }

  .terms-content :global(.company-info) {
    font-size: 1.1rem;
    margin: 0;
    color: #475569;
    font-weight: 500;
    line-height: 1.6;
  }

  .terms-content :global(.terms-section) {
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .terms-content :global(.terms-section:last-child) {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .terms-content :global(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
    position: relative;
  }

  .terms-content :global(h2::before) {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 1px;
  }

  .terms-content :global(h3) {
    font-size: 1.2rem;
    font-weight: 600;
    color: #dc2626;
    margin: 0 0 0.75rem;
  }

  .terms-content :global(p) {
    margin: 0 0 1rem;
    color: #475569;
    font-size: 1rem;
    line-height: 1.7;
  }

  /* Special notices and disclaimers */
  .terms-content :global(.important-notice) {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 1.25rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
  }

  .terms-content :global(.price-disclaimer),
  .terms-content :global(.recommendation),
  .terms-content :global(.legal-note) {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
    font-size: 0.95rem;
    color: #92400e;
  }

  /* List styles */
  .terms-content :global(.terms-list),
  .terms-content :global(.notice-list),
  .terms-content :global(.liability-list) {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  .terms-content :global(.terms-list li),
  .terms-content :global(.notice-list li),
  .terms-content :global(.liability-list li) {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    margin: 0.75rem 0;
    border-left: 4px solid #e2e8f0;
    transition: all 0.2s ease;
    position: relative;
  }

  .terms-content :global(.notice-list li) {
    background: #fef2f2;
    border-left-color: #fca5a5;
  }

  .terms-content :global(.terms-list li:hover),
  .terms-content :global(.notice-list li:hover),
  .terms-content :global(.liability-list li:hover) {
    background: #f1f5f9;
    border-left-color: #10b981;
    transform: translateX(4px);
  }

  .terms-content :global(.notice-list li:hover) {
    background: #fee2e2;
    border-left-color: #ef4444;
  }

  .terms-content :global(.terms-list li strong),
  .terms-content :global(.notice-list li strong),
  .terms-content :global(.liability-list li strong) {
    color: #1e293b;
    font-weight: 600;
  }

  .terms-content :global(.contact-details) {
    background: #f0fdf4;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    border-left: 4px solid #10b981;
  }

  /* Link styles */
  .terms-content :global(.email-link),
  .terms-content :global(.policy-link) {
    color: #10b981;
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .terms-content :global(.email-link:hover),
  .terms-content :global(.policy-link:hover) {
    color: #059669;
    border-bottom-color: #059669;
  }

  /* Responsive design */
  /* Large tablets and small desktops */
  @media (max-width: 1024px) {
    .container {
      max-width: 100%;
      padding: 0 1rem;
    }

    .terms-header,
    .terms-content {
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

    .terms-header,
    .terms-content {
      padding: 1.75rem;
      border-radius: 12px;
      margin: 0 0.5rem 1.25rem;
    }

    .terms-title {
      font-size: 2.2rem;
      line-height: 1.15;
    }

    .terms-content :global(h2) {
      font-size: 1.35rem;
    }

    .terms-content :global(.terms-intro) {
      padding: 1.25rem;
    }

    .terms-content :global(.terms-list li),
    .terms-content :global(.notice-list li),
    .terms-content :global(.liability-list li) {
      padding: 0.875rem;
      margin: 0.625rem 0;
    }
  }

  /* Large phones */
  @media (max-width: 640px) {
    .legal-page {
      padding: 1rem 0.5rem;
    }

    .terms-header,
    .terms-content {
      padding: 1.5rem;
      margin: 0 0.25rem 1rem;
      border-radius: 10px;
    }

    .terms-title {
      font-size: 2rem;
    }

    .last-updated {
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
    }

    .terms-content :global(h2) {
      font-size: 1.25rem;
      padding-bottom: 0.4rem;
    }

    .terms-content :global(.terms-section) {
      margin-bottom: 2rem;
      padding-bottom: 1.25rem;
    }
  }

  /* Standard phones */
  @media (max-width: 480px) {
    .legal-page {
      padding: 0.75rem 0.375rem;
    }

    .terms-header,
    .terms-content {
      padding: 1.25rem;
      margin: 0 0.125rem 0.875rem;
      border-radius: 8px;
    }

    .terms-title {
      font-size: 1.75rem;
      margin-bottom: 0.625rem;
    }

    .last-updated {
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
    }

    .terms-content :global(h2) {
      font-size: 1.2rem;
    }

    .terms-content :global(.terms-intro) {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .terms-content :global(.company-info) {
      font-size: 1rem;
    }

    .terms-content :global(.terms-list li),
    .terms-content :global(.notice-list li),
    .terms-content :global(.liability-list li) {
      padding: 0.75rem;
      margin: 0.5rem 0;
      font-size: 0.95rem;
    }

    .terms-content :global(.important-notice),
    .terms-content :global(.price-disclaimer),
    .terms-content :global(.recommendation),
    .terms-content :global(.legal-note) {
      padding: 0.875rem;
      font-size: 0.9rem;
    }

    .terms-content :global(p) {
      font-size: 0.95rem;
    }
  }

  /* Small phones */
  @media (max-width: 375px) {
    .legal-page {
      padding: 0.5rem 0.25rem;
    }

    .terms-header,
    .terms-content {
      padding: 1rem;
      margin: 0 0 0.75rem;
    }

    .terms-title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .last-updated {
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
    }

    .terms-content :global(h2) {
      font-size: 1.1rem;
    }

    .terms-content :global(.terms-intro) {
      padding: 0.875rem;
    }

    .terms-content :global(.terms-section) {
      margin-bottom: 1.75rem;
      padding-bottom: 1rem;
    }

    .terms-content :global(.terms-list li),
    .terms-content :global(.notice-list li),
    .terms-content :global(.liability-list li) {
      padding: 0.625rem;
      font-size: 0.9rem;
    }
  }

  /* Accessibility and reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .terms-content :global(.terms-list li),
    .terms-content :global(.notice-list li),
    .terms-content :global(.liability-list li) {
      transition: none;
    }

    .terms-content :global(.terms-list li:hover),
    .terms-content :global(.notice-list li:hover),
    .terms-content :global(.liability-list li:hover) {
      transform: none;
    }
  }

  /* Print styles */
  @media print {
    .legal-page {
      background: white;
      padding: 0;
    }

    .terms-header,
    .terms-content {
      box-shadow: none;
      border: none;
    }

    .terms-content :global(.terms-list li),
    .terms-content :global(.notice-list li),
    .terms-content :global(.liability-list li) {
      background: white;
      border: 1px solid #e2e8f0;
    }
  }
</style>