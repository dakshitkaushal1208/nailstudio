import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Quantity } from '../ui/Quantity';
import { SmartImage } from '../ui/SmartImage';
import { VariantPicker, initialSelection } from './VariantPicker';
import { findVariant } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';

// "Add to cart" from a product card: choose the options without leaving the page.
export function QuickAdd({ product, onClose }) {
  const { add } = useCart();
  const toast = useToast();
  const [selection, setSelection] = useState(() => initialSelection(product));
  const [qty, setQty] = useState(1);
  const variant = findVariant(product, selection);
  const available = variant && variant.stock > 0;

  useEffect(() => setQty(1), [variant?.id]);

  const submit = () => {
    const res = add(product, variant, qty);
    toast(res.message, { tone: res.ok ? 'ok' : 'bad' });
    if (res.ok) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={product.name}
      footer={
        <>
          <Button as={Link} to={`/shop/${product.slug}`} variant="ghost" onClick={onClose}>
            Full details
          </Button>
          <Button onClick={submit} disabled={!available}>
            Add to cart
          </Button>
        </>
      }
    >
      <div className="quick">
        <SmartImage src={product.images[0]} alt={product.name} className="quick__img" />
        <div className="quick__body">
          <p className="quick__price num">{formatPrice(product.price)}</p>
          <VariantPicker product={product} selection={selection} onChange={setSelection} />
          <div className="field">
            <span className="field__label">Quantity</span>
            <Quantity value={qty} onChange={setQty} max={available ? variant.stock : 1} disabled={!available} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
