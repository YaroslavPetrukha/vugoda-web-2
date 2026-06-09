// src/content/articles/chek-list-pereveryty-zabudovnyka.tsx
import { Link } from 'react-router';
import type { ArticleMetadata } from '../../types';

export const metadata: ArticleMetadata = {
  slug: 'chek-list-pereveryty-zabudovnyka',
  title: 'Як перевірити забудовника перед купівлею: 8 пунктів',
  description:
    'Практичний чек-лист з 8 пунктів для перевірки забудовника в Україні. ЄДРПОУ, дозволи, договір, репутація — що перевіряти і де шукати.',
  excerpt:
    'Купівля квартири в новобудові — угода з юридичною особою, що ще не завершила свій продукт. Вісім пунктів, які займають від 1,5 до 2 годин, можуть зберегти роки судів і заморожений капітал.',
  publishedAt: '2026-05-26',
  category: 'guide',
  categoryLabel: 'Гід покупця',
  hero: '/og/approach-v2.png',
  heroAlt: 'Чек-лист перевірки забудовника перед купівлею квартири в Україні',
  author: 'Команда ВИГОДА',
  internalLinks: ['/pidkhid', '/partneram', '/portfolio/lakeview'],
  wordCount: 1260,
};

export default function ArticleBody() {
  return (
    <>
      <p className="text-lg text-text-secondary leading-relaxed mb-6">
        8 пунктів. Більшість займають від 10 до 30 хвилин кожен. Разом — 1,5–2
        години роботи. Коли ви платите зараз, а ключі отримуєте через рік-два,
        за цей час забудовник може збанкрутувати, затягнути будівництво або
        виявитися нелегітимним. Цей чек-лист дозволяє перевірити будь-якого
        забудовника до підписання договору і знизити ці ризики до прийнятного
        рівня.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        1. Юридична особа і ЄДРПОУ
      </h2>

      <p className="mb-6 leading-relaxed">
        Перше, що потрібно зробити: переконатися, що забудовник існує як
        юридична особа і його статус є активним. Для цього знайдіть ЄДРПОУ
        (восьмизначний код); він має бути вказаний на сайті або в будь-якому
        документі компанії. Далі перевірте запис у{' '}
        <a
          href="https://usr.minjust.gov.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Єдиному державному реєстрі юридичних осіб
        </a>{' '}
        або через агрегатор{' '}
        <a
          href="https://opendatabot.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          opendatabot.com
        </a>{' '}
        ; там видно статус (активний / в стані припинення), дату реєстрації та
        види економічної діяльності (КВЕД).
      </p>

      <p className="mb-6 leading-relaxed">
        Для будівництва первинного житла релевантні КВЕД 41.10 (організація
        будівництва будівель) та 41.20 (будівництво житлових і нежитлових
        будівель). Якщо в реєстрі переважають торгові або посередницькі КВЕДи,
        це привід для уточнень. Зверніть увагу на дату реєстрації: компанія
        молодша двох років без жодного завершеного об'єкта несе підвищений ризик.
        Також насторожують ФОП-схеми, де продаж веде фізична
        особа-підприємець, а не юридична особа-забудовник.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        2. Дозвільна документація
      </h2>

      <p className="mb-6 leading-relaxed">
        Законне будівництво в Україні починається з повного пакету дозволів.
        Ключові документи, які слід запитати або перевірити онлайн:
      </p>

      <ul className="list-disc list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Право на земельну ділянку
          </strong>{' '}
          — договір оренди або акт власності. Має бути зареєстроване у
          Державному реєстрі речових прав.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Містобудівні умови та обмеження (МУО)
          </strong>{' '}
          — видаються органом архітектури, фіксують поверховість, відступи,
          призначення.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Позитивний висновок експертизи проектної документації
          </strong>{' '}
          — для об'єктів СС2 і СС3 є обов'язковим.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Дозвіл на виконання будівельних робіт (ДВРБ)
          </strong>{' '}
          — видається Державною інспекцією архітектури та містобудування (ДІАМ)
          або місцевим органом для СС1.
        </li>
      </ul>

      <p className="mb-6 leading-relaxed">
        Перевірити наявність дозволу можна на{' '}
        <a
          href="https://e-construction.gov.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          порталі е-будівництво
        </a>{' '}
        або через{' '}
        <a
          href="https://diia.gov.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Дію
        </a>
        . Будівництво без ДВРБ є позаправовим, незалежно від красивого
        сайту і офісу продажів.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        3. Технологія будівництва і клас наслідків
      </h2>

      <p className="mb-6 leading-relaxed">
        Клас наслідків (СС) визначає рівень регуляторного контролю над об'єктом.
        СС1 — незначні наслідки (до 4 поверхів, до 100 осіб), СС2 — середні
        (більшість міських будинків 5–15 поверхів), СС3 — значні наслідки
        (висотки, торгові центри, великі ЖК). Для СС3 вимоги до проектування,
        експертизи і нагляду є найбільш жорсткими.
      </p>

      <p className="mb-6 leading-relaxed">
        Технологія будівництва впливає на строки, якість і довговічність.
        Монолітно-каркасна технологія дає гнучке планування і хорошу
        сейсмостійкість, але потребує більш тривалого будівельного циклу.
        Панельні будинки зводяться швидше, але мають обмежені планувальні
        рішення. Цегляна технологія дає добру тепло- і звукоізоляцію, але
        є найповільнішою і найдорожчою. Перевірте, яка технологія задекларована в
        проекті, і порівняйте її з тим, що фактично видно на майданчику.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        4. Фінансова модель і умови оплати
      </h2>

      <p className="mb-6 leading-relaxed">
        Стандартна ринкова модель для первинного ринку в Україні передбачає
        перший внесок у районі 30% та розстрочку на період будівництва з
        прив'язкою до графіку готовності. Це дозволяє покупцеві мінімізувати
        ризик, оскільки основні виплати настають при досягненні конкретних
        будівельних етапів.
      </p>

      <p className="mb-4 leading-relaxed">
        Червоні прапори у фінансових умовах:
      </p>

      <ul className="list-disc list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          <strong className="text-text-primary">Знижки -30–50% без обґрунтування</strong>{' '}
          — ознака або перегрітої базової ціни, або фінансових труднощів.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Схема «купуй зараз, плати потім без відсотків»</strong>{' '}
          — як правило, приховані витрати або перекладання ризику на покупця.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Вимога 100% передоплати на стадії котловану без гарантій</strong>{' '}
          — найвищий ризик: немає захищеного механізму повернення коштів.
        </li>
      </ul>

      <p className="mb-6 leading-relaxed">
        Надійний забудовник зацікавлений у поступовому грошовому потоці.
        Повна передоплата на ранній стадії в його інтересах, але не у ваших.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        5. Юридичний інструмент угоди
      </h2>

      <p className="mb-6 leading-relaxed">
        В Україні продаж квартир у незавершеному будівництві юридично
        оформлюється як продаж майнових прав, а не самої квартири: об'єкт
        нерухомості ще не введений в експлуатацію і не має кадастрового номера.
        Договір купівлі-продажу майнових прав є легітимним інструментом,
        однак його зміст є критичним.
      </p>

      <p className="mb-6 leading-relaxed">
        Менш поширені альтернативи: договір про участь у фонді фінансування
        будівництва (ФФБ) передбачає наявність ліцензованого управителя фонду;
        переуступка майнових прав від попереднього покупця є законною, але
        потребує перевірки всього ланцюга прав. Будь-який договір, який не є
        нотаріально посвідченим або не є одним з перелічених стандартних
        інструментів, є приводом звернутися до незалежного юриста перед
        підписанням.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        6. Гарантії і відповідальність у договорі
      </h2>

      <p className="mb-6 leading-relaxed">
        Текст договору є вашим єдиним юридичним захистом. Перед підписанням
        перевірте наявність таких елементів:
      </p>

      <ul className="list-disc list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          Точна адреса об'єкта, поверх, загальна і житлова площа, планування
          (або посилання на план).
        </li>
        <li className="leading-relaxed">
          Графік оплати з прив'язкою до будівельних етапів або конкретних дат —
          не розмиті формулювання на кшталт «за домовленістю».
        </li>
        <li className="leading-relaxed">
          Термін введення об'єкта в експлуатацію — конкретна дата, а не
          «орієнтовно».
        </li>
        <li className="leading-relaxed">
          Штрафні санкції за прострочення передачі квартири покупцеві.
        </li>
        <li className="leading-relaxed">
          Право покупця на дострокове розірвання договору і повернення коштів
          при порушенні умов забудовником.
        </li>
        <li className="leading-relaxed">
          Порядок прийому-передачі квартири та усунення дефектів.
        </li>
      </ul>

      <p className="mb-6 leading-relaxed">
        Відсутність будь-якого з цих пунктів або розмите формулювання щодо
        строків і санкцій є конкретним ризиком, а не формальністю.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        7. Хід будівництва і прозорість
      </h2>

      <p className="mb-6 leading-relaxed">
        Перевірити реальний стан будівництва можна кількома способами.
        Найнадійніший з них — особистий візит на майданчик. Активне будівництво видно
        одразу: присутність техніки, робочих, будівельних матеріалів. Якщо
        ворота зачинені без пояснень або охоронець не може назвати імені
        відповідального, це сигнал.
      </p>

      <p className="mb-6 leading-relaxed">
        Дистанційно: перевірте офіційний сайт і соціальні мережі забудовника.
        Чи є регулярні фотозвіти і відеоекскурсії, датовані поточним часом?
        Якщо останні матеріали датовані шістьма місяцями тому, а будинок
        «повинен здатися через рік», невідповідність потребує пояснення. Регулярна і датована документація
        будівельного процесу є ознакою організованого девелопменту.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        8. Репутація і портфоліо
      </h2>

      <p className="mb-6 leading-relaxed">
        Завершені об'єкти є найважливішим доказом спроможності. Знайдіть
        попередні проекти забудовника і перевірте: чи введені вони в
        експлуатацію, чи відповідають задекларованим строкам, що кажуть
        мешканці. Для пошуку відгуків використовуйте тематичні форуми, наприклад{' '}
        <a
          href="https://lun.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          lun.ua
        </a>{' '}
        (каталог новобудов з відгуками).
      </p>

      <p className="mb-6 leading-relaxed">
        Перевірте забудовника у{' '}
        <a
          href="https://reyestr.court.gov.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Єдиному реєстрі судових рішень
        </a>{' '}
        за назвою компанії або ЄДРПОУ. Наявність кількох спорів з покупцями або
        субпідрядниками є підставою для детального вивчення обставин. Також
        перевірте наявність виконавчих проваджень через{' '}
        <a
          href="https://erb.minjust.gov.ua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          реєстр виконавчих проваджень
        </a>
        , де видно незакриті боргові зобов'язання компанії.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        Як ці 8 пунктів застосовуються до ВИГОДА
      </h2>

      <p className="mb-6 leading-relaxed">
        Для прикладу застосуємо чек-лист до ПП «ДІК "Вигода +"»:
      </p>

      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          <strong className="text-text-primary">ЄДРПОУ 44876801</strong> —
          реєструється в Єдиному реєстрі, статус активний, КВЕД 41.20
          (будівництво житлових і нежитлових будівель). Компанія молода,
          портфель формується — це прямо зазначено на сторінці{' '}
          <Link to="/pidkhid" className="text-accent hover:underline">
            наш підхід
          </Link>
          .
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Дозволи</strong> — Lakeview має
          повний пакет дозвільної документації відповідно до вимог ДІАМ; деталі
          надаються за запитом.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Технологія</strong> —
          монолітно-каркасна конструкція, клас наслідків СС3 (значні наслідки),
          що передбачає обов'язкову незалежну експертизу проекту.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Фінансова модель</strong> — 30%
          перший внесок + розстрочка на період будівництва. Повна передоплата
          не практикується.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Угода</strong> — договір
          купівлі-продажу майнових прав, нотаріальне посвідчення.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Договір</strong> — умови
          включають конкретний термін введення в експлуатацію, графік оплати та
          відповідальність сторін.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Прозорість будівництва</strong>{' '}
          — щомісячна фотофіксація ходу робіт без редактури; доступно в
          соціальних мережах.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Портфоліо</strong> —{' '}
          <Link
            to="/portfolio/lakeview"
            className="text-accent hover:underline"
          >
            Lakeview
          </Link>{' '}
          є першим об'єктом. Документи для due diligence надаються за запитом
          через{' '}
          <Link to="/partneram" className="text-accent hover:underline">
            /partneram
          </Link>
          .
        </li>
      </ol>

      <p className="mb-6 leading-relaxed">
        Методологія у деталях описана на сторінці{' '}
        <Link to="/pidkhid" className="text-accent hover:underline">
          наш підхід
        </Link>
        : чотири фази від меморандуму до введення в експлуатацію, з переліком
        конкретних документів на кожному етапі.
      </p>

      <hr className="border-border my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        Підсумок
      </h2>

      <p className="mb-6 leading-relaxed">
        Перевірка забудовника за цим чек-листом займає від 1,5 до 2 годин.
        Вісім пунктів охоплюють ключові площини ризику: чи є компанія
        легітимною, чи будівництво ведеться законно, чи захищає вас договір,
        чи стійка фінансова схема угоди. Більшість перевірок виконується
        безкоштовно через державні реєстри онлайн.
      </p>

      <p className="mb-6 leading-relaxed">
        Цей чек-лист підходить для будь-якого забудовника, не лише для ВИГОДА.
        Якщо компанія відмовляється надати ЄДРПОУ, посилання на дозвіл у
        реєстрі або проект договору до підписання, це достатня відповідь на
        питання, чи варто далі витрачати час.
      </p>
    </>
  );
}
