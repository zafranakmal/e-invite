import Image from 'next/image';
import styles from './SiteFooter.module.css';
import footerLogo from '@/assets/el-footer-logo.webp';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoCol}>
        <Image src={footerLogo} alt="Anis & Zafran" className={styles.logo} sizes="56px" />
      </div>

      <div className={styles.creditCol}>
        <p className={styles.credit}>
          Handcrafted with <span className={styles.heart}>❤️</span> by Zafran &amp; Anis. <br></br>Built on Next.js, PostgreSQL and lots of coffee
        </p>
      </div>
    </footer>
  );
}
