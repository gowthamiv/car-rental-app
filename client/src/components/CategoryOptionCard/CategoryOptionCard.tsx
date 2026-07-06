import { Car, CarFront, Bus, Truck, AlertCircle } from 'lucide-react';
import type { PricingOption } from '../../types/reservation.types';
import { getCategoryConfig } from '../../constants/category.config';
import styles from './CategoryOptionCard.module.css';
import { formatCurrency } from '../../utils/format';

const ICONS = { car: Car, 'car-front': CarFront, bus: Bus, truck: Truck };

interface CategoryOptionCardProps {
  option: PricingOption;
  days: number;
  isBestValue: boolean;
  onSelect: (option: PricingOption) => void;
}

export function CategoryOptionCard({ option, days, isBestValue, onSelect }: CategoryOptionCardProps) {
  const config = getCategoryConfig(option.category);
  const Icon = ICONS[config.iconName];
  const isUnavailable = option.availableCount <= 0;

  return (
    <div
      className={`${styles.card} ${isBestValue ? styles.cardBestValue : ''} ${isUnavailable ? styles.cardUnavailable : ''}`}
    >
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm w-fit ${config.badgeClassName}`}>
        <Icon size={14} /> {config.displayName}
      </span>

      {isBestValue && !isUnavailable && (
        <span className="text-xs text-blue-600 font-medium mt-2">Best value</span>
      )}

      <p className={styles.price}>{formatCurrency(option.totalPrice)}</p>
      <p className={styles.priceDetail}>{days} day{days !== 1 ? 's' : ''}</p>

      <p className={styles.availability}>
        {isUnavailable ? (
          <span className="inline-flex items-center gap-1 text-red-500">
            <AlertCircle size={14} /> None available
          </span>
        ) : (
          `${option.availableCount} available`
        )}
      </p>

      <button
        className={styles.selectButton}
        disabled={isUnavailable}
        onClick={() => onSelect(option)}
      >
        {isUnavailable ? 'Unavailable' : 'Select'}
      </button>
    </div>
  );
}