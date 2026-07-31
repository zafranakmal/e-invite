import Image from 'next/image';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoCol}>
        <Image src="/el-footer-logo.png" alt="Anis & Zafran" width={1000} height={1000} className={styles.logo} sizes="10vw" />
      </div>

      <div className={styles.creditCol}>
        <p className={styles.credit}>
          Handcrafted with <span className={styles.heart}>❤️</span> by Zafran &amp; Anis. Built on Next.js, PostgreSQL and lots of coffee
        </p>
      </div>
    </footer>
  );
}
