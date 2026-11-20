import Link from "next/link";
import { categoryHref } from "@/lib/catalog/categories";
import { telHref, type SiteContacts } from "@/lib/site-contacts";

const PRODUCTS = [
  { label: "Міжкімнатні двері", slug: "mizhkimnatni" },
  { label: "Вхідні двері", slug: "dveri-vhidni" },
  { label: "Фурнітура", slug: "furnitura" },
  { label: "Ламінат", slug: "pidloha-laminat" },
  { label: "Вінілова підлога", slug: "pidloha-vinilova-pidloha" },
];

/** Contacts come from CMS Global (phone, email, showrooms); nothing is shown for empty fields. */
export default function Footer({ contacts }: { contacts?: SiteContacts }) {
  const addresses = (contacts?.shops ?? []).map(shop => shop.address).filter((address): address is string => Boolean(address));
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
            Ламінат, вінілова підлога, міжкімнатні та вхідні двері, фурнітура — у виставкових залах
            у Черкасах і з доставкою по Україні.
          </p>
        </div>
        <nav className="footer-links" aria-label="Продукція">
          <b>ПРОДУКЦІЯ</b>
          {PRODUCTS.map(item => <Link key={item.slug} href={categoryHref(item.slug)}>{item.label}</Link>)}
        </nav>
        <div className="footer-links">
          <b>КОНТАКТИ</b>
          {contacts?.phone && <a href={telHref(contacts.phone)}>☎ {contacts.phone}</a>}
          {contacts?.email && <a href={`mailto:${contacts.email}`}>✉ {contacts.email}</a>}
          {addresses.map(address => <span key={address}>⌖ {address}</span>)}
          <Link href="/#contacts">Магазини на мапі</Link>
          <Link href="/about">Про нас</Link>
        </div>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} Нова Підлога та Двері. Всі права захищені.
      </div>
      </div>
    </footer>
  );
}
