import { Car } from 'lucide-react';
import styles from './AppBackground.module.css';

export function AppBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <Car size={110} className={styles.decorCar} style={{ top: '12%', left: '6%', transform: 'scaleX(-1)' }} />
      <Car size={80} className={styles.decorCar} style={{ top: '65%', right: '8%' }} />
      <div className={styles.roadStripe} />
      <div className={styles.roadLine} />
    </div>
  );
}