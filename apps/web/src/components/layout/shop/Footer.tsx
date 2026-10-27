export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="content-container px-4 lg:px-[var(--desktop-page-gutter)]">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            <img src="/nova-pidloha.png" alt="" />
            <b>
              НОВА ПІДЛОГА <em>ТА ДВЕРІ</em>
            </b>
          </div>
          <p>
            Широкий асортимент сертифікованого підлогового покриття та
            міжкімнатних дверей в наявності та під замовлення у Черкасах.
          </p>
        </div>
        <div className="footer-links">
          <b>ПРОДУКЦІЯ</b>
          <span>Міжкімнатні двері</span>
          <span>Вхідні двері</span>
          <span>Фурнітура</span>
          <span>Ламінат</span>
          <span>Вініл</span>
        </div>
        <div className="footer-links">
          <b>КОНТАКТИ</b>
          <span>☎ +38 (097) 123-45-67</span>
          <span>⌖ м. Черкаси, вул. Смілянська, 120</span>
          <span>f &nbsp; ◎ &nbsp; ◯</span>
        </div>
      </div>
      <div className="copyright">
        © 2025 Нова підлога та Двері. Всі права захищені.
      </div>
      </div>
    </footer>
  );
}
