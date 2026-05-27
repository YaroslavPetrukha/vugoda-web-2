// src/content/articles/lakeview-progress-2026-04-05.tsx
import { Link } from 'react-router';
import type { ArticleMetadata } from '../../types';

export const metadata: ArticleMetadata = {
  slug: 'lakeview-progress-2026-04-05',
  title: 'Хід будівництва ЖК Lakeview: квітень–травень 2026',
  description:
    'Інверсійна покрівля першої секції, фасадні роботи та технічні умови на електропостачання — детальний звіт про будівництво ЖК Lakeview у Львові.',
  excerpt:
    'За квітень–травень 2026 року на майданчику ЖК Lakeview завершено три ключові етапи: технічні умови на електропостачання, фасадні роботи на першій секції та інверсійна покрівля.',
  publishedAt: '2026-05-13',
  category: 'construction-progress',
  categoryLabel: 'Хід будівництва',
  hero: '/og/lakeview.png',
  heroAlt: 'Фасадні роботи на першій секції ЖК Lakeview у Львові',
  author: 'Команда ВИГОДА',
  internalLinks: ['/portfolio/lakeview', '/pidkhid'],
  wordCount: 870,
};

export default function ArticleBody() {
  return (
    <>
      <p className="text-lg text-text-secondary leading-relaxed mb-6">
        За квітень–травень 2026 року на майданчику{' '}
        <Link to="/portfolio/lakeview" className="text-accent hover:underline">
          ЖК Lakeview
        </Link>{' '}
        завершено три ключові етапи: отримані та оплачені технічні умови на
        електропостачання, розпочато фасадні роботи на першій секції і
        виконується улаштування інверсійної покрівлі. Кожен із цих кроків —
        планова позиція в графіку будівництва, яка наближає здачу об'єкта у
        2027 році.
      </p>

      <hr className="border-bg-surface my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        Що відбувається на майданчику
      </h2>

      <h3 className="text-xl font-semibold text-text-primary mt-8 mb-3">
        Технічні умови на електропостачання — 17 квітня 2026
      </h3>

      <p className="mb-6 leading-relaxed">
        17 квітня отримані й оплачені технічні умови на підключення ЖК Lakeview
        до електромереж. Документи видані постачальником у встановленому порядку.
        Виконання технічних умов — обов'язковий і нескорочуваний етап: без нього
        неможливе підключення будинку до зовнішньої інфраструктури і, відповідно,
        введення в експлуатацію. Завершення цього кроку на поточній стадії
        будівництва відповідає графіку.
      </p>

      <h3 className="text-xl font-semibold text-text-primary mt-8 mb-3">
        Фасадні роботи першої секції — з 6 травня 2026
      </h3>

      <p className="mb-6 leading-relaxed">
        З 6 травня на першій секції ведеться монтаж фасадної системи відповідно
        до проєктної документації. У ЖК Lakeview застосовується{' '}
        <strong className="text-text-primary">монолітно-каркасна технологія</strong>:
        несучий каркас будинку зводиться із залізобетонних монолітних конструкцій,
        а заповнення стін виконується керамоблоками з утепленням мінеральною
        ватою. Така схема дає декілька практичних переваг:
      </p>

      <ul className="list-disc list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          <strong className="text-text-primary">Несуча здатність і жорсткість.</strong>{' '}
          Монолітний залізобетон не дає осадових деформацій, характерних для
          панельного або цегляного будівництва.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Вільне планування.</strong>{' '}
          Оскільки внутрішні перегородки не є несучими, власник може змінювати
          планування в межах квартири без погоджень конструктивних рішень.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Теплозбереження.</strong>{' '}
          Керамоблок + мінвата у фасадній системі забезпечують опір теплопередачі
          відповідно до вимог ДБН В.2.6-31 для кліматичної зони Львова.
        </li>
      </ul>

      <p className="mb-6 leading-relaxed">
        Фасадні роботи виконуються в штатному режимі згідно з графіком будівництва.
      </p>

      <h3 className="text-xl font-semibold text-text-primary mt-8 mb-3">
        Інверсійна покрівля першої секції — з 13 травня 2026
      </h3>

      <p className="mb-6 leading-relaxed">
        На першій секції виконуються роботи з улаштування{' '}
        <strong className="text-text-primary">інверсійної покрівлі</strong>. На
        відміну від традиційної схеми, в інверсійній конструкції теплоізоляція
        розміщується поверх гідроізоляційного шару, а не під ним. Це захищає
        мембрану від ультрафіолету, різких перепадів температур і механічних
        пошкоджень, що суттєво збільшує строк служби покрівлі — зазвичай до
        40–50 років за умови дотримання технології.
      </p>

      <h3 className="text-xl font-semibold text-text-primary mt-8 mb-3">
        Клас наслідків СС3
      </h3>

      <p className="mb-6 leading-relaxed">
        ЖК Lakeview будується за класом наслідків{' '}
        <strong className="text-text-primary">
          СС3 — найвищим рівнем відповідальності
        </strong>{' '}
        за українським законодавством (ДСТУ-Н Б В.1.2-16). Це означає
        обов'язковий авторський і технічний нагляд протягом усього будівництва,
        обов'язкову реєстрацію в{' '}
        <a
          href="https://e-construction.gov.ua"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          реєстрі е-будівництва
        </a>
        , а також вищий рівень вимог до матеріалів і виконання робіт порівняно
        з об'єктами СС1–СС2. Для покупця СС3 — це конкретний правовий інструмент
        контролю: усі відхилення від проєкту фіксуються і мають бути усунуті до
        введення в експлуатацію.
      </p>

      <hr className="border-bg-surface my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        Що далі
      </h2>

      <p className="mb-6 leading-relaxed">
        Наступні планові кроки в послідовності будівництва:
      </p>

      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Завершення покрівлі та фасаду першої секції
          </strong>{' '}
          — роботи тривають, завершення заплановане відповідно до графіку.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Старт фасадних робіт на наступних секціях
          </strong>{' '}
          — після завершення першої секції аналогічний цикл відтворюється на
          секціях 2–4.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Підключення до інженерних мереж
          </strong>{' '}
          — на підставі отриманих технічних умов виконавець готує проєкт
          зовнішнього підключення та узгоджує строки з постачальником.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Внутрішні інженерні системи
          </strong>{' '}
          — паралельно з фасадом прокладаються мережі електропостачання,
          водопостачання, каналізації та автономного опалення.
        </li>
      </ol>

      <p className="mb-6 leading-relaxed">
        Стежити за прогресом в режимі реального часу можна двома способами:
      </p>

      <ul className="list-disc list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          <strong className="text-text-primary">
            Instagram{' '}
            <a
              href="https://www.instagram.com/lakeviewlviv/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              @lakeviewlviv
            </a>
          </strong>{' '}
          — фото з майданчика виходять регулярно.
        </li>
        <li className="leading-relaxed">
          <strong className="text-text-primary">Помісячні фотозвіти</strong> на
          сторінці{' '}
          <Link to="/portfolio/lakeview" className="text-accent hover:underline">
            ЖК Lakeview
          </Link>{' '}
          — добірка з архівом починаючи з грудня 2025 року.
        </li>
      </ul>

      <hr className="border-bg-surface my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        Що це означає для покупця
      </h2>

      <p className="mb-6 leading-relaxed">
        Три завершені етапи квітня–травня — не окремі новини, а ланки однієї
        послідовності, яка веде до здачі об'єкта у <strong>2027 році</strong>.
        Отримання технічних умов на електрику усуває один із найчастіших ризиків
        затримки: відсутність узгодженого підключення до мереж. Фасадні роботи і
        покрівля закривають будівлю від вологи, що дозволяє паралельно вести
        внутрішні оздоблювальні роботи навіть у холодну пору.
      </p>

      <p className="mb-6 leading-relaxed">
        Клас СС3 означає, що відступ від проєктних параметрів — навіть незначний —
        потребує оформлення і не може бути прихований: усі виявлені відхилення
        відображаються в журналі авторського нагляду.
      </p>

      <p className="mb-6 leading-relaxed">
        Для тих, хто розглядає покупку, ключові параметри залишаються незмінними:
      </p>

      <ul className="list-disc list-inside mb-6 space-y-2">
        <li className="leading-relaxed">
          Площі квартир: <strong className="text-text-primary">44–183 м²</strong>{' '}
          (1, 2, 3-кімнатні)
        </li>
        <li className="leading-relaxed">
          Стартова ціна: <strong className="text-text-primary">від $1600 / м²</strong>
        </li>
        <li className="leading-relaxed">
          Умови оплати:{' '}
          <strong className="text-text-primary">30% перший внесок + розстрочка</strong>{' '}
          на період будівництва до 2027 року
        </li>
        <li className="leading-relaxed">
          Забудовник: ПП «ДІК "Вигода +"», ЄДРПОУ{' '}
          <strong className="text-text-primary">44876801</strong> — дані відкриті
          для перевірки в реєстрах
        </li>
      </ul>

      <hr className="border-bg-surface my-12" />

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mt-12 mb-4">
        Як ми звітуємо
      </h2>

      <p className="mb-6 leading-relaxed">
        ВИГОДА публікує помісячні фотозвіти з майданчика ЖК Lakeview — без відбору
        «гарних кадрів», зі стандартними ракурсами для можливості порівняння
        динаміки. Архів звітів починаючи з грудня 2025 доступний на сторінці{' '}
        <Link to="/portfolio/lakeview" className="text-accent hover:underline">
          ЖК Lakeview
        </Link>
        .
      </p>

      <p className="mb-6 leading-relaxed">
        Методологія фіксації і принципи, за якими ми ведемо будівництво, описані
        у розділі{' '}
        <Link to="/pidkhid" className="text-accent hover:underline">
          наш підхід
        </Link>
        .
      </p>

      <p className="mb-6 leading-relaxed">
        Якщо ви хочете побачити майданчик особисто — запишіться на огляд: менеджер
        узгодить зручний час і проведе вас по об'єкту. Контакти проєкту:{' '}
        <a href="tel:+380979900390" className="text-accent hover:underline">
          097 990 03 90
        </a>
        ,{' '}
        <a
          href="mailto:vygoda.sales@gmail.com"
          className="text-accent hover:underline"
        >
          vygoda.sales@gmail.com
        </a>
        , офіс продажу — вул. Володимира Великого, 4, каб. 406.
      </p>

      <hr className="border-bg-surface my-12" />

      <p className="text-sm text-text-secondary italic mt-12">
        <em>
          Усі дати і факти в цьому матеріалі відповідають актуальному стану
          будівництва на 13 травня 2026 року.
        </em>
      </p>
    </>
  );
}
