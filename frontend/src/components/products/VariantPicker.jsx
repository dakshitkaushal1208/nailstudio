import { findVariant } from '../../services/productService';

// First combination that is in stock, falling back to the first combination.
export function initialSelection(product) {
  const v = product.variants.find((x) => x.active && x.stock > 0) || product.variants.find((x) => x.active) || product.variants[0];
  return v ? { ...v.options } : {};
}

// A value is marked "sold out" when no in-stock variant exists with it,
// given the shopper's other current choices. It stays selectable so the
// unavailable state can be explained rather than hidden.
function valueSoldOut(product, selection, optionName, value) {
  const trial = { ...selection, [optionName]: value };
  const v = findVariant(product, trial);
  return !v || v.stock < 1;
}

export function VariantPicker({ product, selection, onChange }) {
  const variant = findVariant(product, selection);

  return (
    <div className="variants">
      {product.options.map((opt) => (
        <fieldset key={opt.name} className="variants__group">
          <legend className="field__label">
            {opt.name}
            <span className="variants__chosen">{selection[opt.name]}</span>
          </legend>
          <div className="variants__chips">
            {opt.values.map((val) => {
              const selected = selection[opt.name] === val;
              const soldOut = valueSoldOut(product, selection, opt.name, val);
              return (
                <button
                  key={val}
                  type="button"
                  className={`chip ${soldOut ? 'is-soldout' : ''}`}
                  aria-pressed={selected}
                  title={soldOut ? 'Currently unavailable in this combination' : undefined}
                  onClick={() => onChange({ ...selection, [opt.name]: val })}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <p className={`variants__status ${!variant || variant.stock < 1 ? 'is-out' : variant.stock <= 3 ? 'is-low' : ''}`} role="status">
        {!variant || variant.stock < 1
          ? 'This combination is currently unavailable. Try another size or shape.'
          : variant.stock <= 3
            ? `Only ${variant.stock} left`
            : 'In stock'}
      </p>
    </div>
  );
}
