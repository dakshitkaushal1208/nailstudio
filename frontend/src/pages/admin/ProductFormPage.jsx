import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Section, Switch, Thumb } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { ErrorState, Loading } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { uid } from '../../services/mock/db';
import { slugify, variantLabel } from '../../utils/format';

const BLANK = {
  name: '',
  slug: '',
  category: '',
  price: '',
  description: '',
  detailsText: '',
  images: [''],
  active: true,
};

const parseValues = (text) => [...new Set(text.split(',').map((v) => v.trim()).filter(Boolean))];

const combos = (options) =>
  options.reduce((acc, opt) => acc.flatMap((c) => opt.values.map((v) => ({ ...c, [opt.name]: v }))), [{}]);

// Rebuild the variant list for a set of options, keeping stock for any
// combination that still exists.
function reconcile(rows, previous) {
  const options = rows.map((r) => ({ name: r.name.trim(), values: parseValues(r.values) })).filter((o) => o.name && o.values.length);
  if (!options.length) return { options, variants: [] };
  const key = (o) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));
  const old = new Map(previous.map((v) => [key(v.options), v]));
  const variants = combos(options).map((c) => old.get(key(c)) || { id: uid('v'), options: c, stock: 0, sku: '', active: true });
  return { options, variants };
}

export default function ProductFormPage() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  usePageMeta(editing ? 'Edit product' : 'New product');

  const { data: loaded, loading, error, retry } = useAsync(() => (editing ? adminService.getProduct(id) : Promise.resolve(null)), [id]);
  const { data: categories } = useAsync(() => adminService.getGalleryCategories(), []);

  const [form, setForm] = useState(BLANK);
  const [rows, setRows] = useState([{ name: 'Size', values: 'XS, S, M, L' }]);
  const [variants, setVariants] = useState(() => reconcile([{ name: 'Size', values: 'XS, S, M, L' }], []).variants);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!loaded) return;
    setForm({
      ...loaded,
      price: String(loaded.price),
      detailsText: (loaded.details || []).join('\n'),
      images: loaded.images?.length ? loaded.images : [''],
    });
    setRows(loaded.options.map((o) => ({ name: o.name, values: o.values.join(', ') })));
    setVariants(loaded.variants);
    setSlugTouched(true);
  }, [loaded]);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value, ...(key === 'name' && !slugTouched ? { slug: slugify(value) } : {}) }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const changeRows = (next) => {
    setRows(next);
    setVariants((prev) => reconcile(next, prev).variants);
  };
  const setImage = (i, value) => setForm((f) => ({ ...f, images: f.images.map((u, j) => (j === i ? value : u)) }));
  const moveImage = (i, dir) =>
    setForm((f) => {
      const next = [...f.images];
      const j = i + dir;
      if (j < 0 || j >= next.length) return f;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, images: next };
    });
  const setVariant = (vid, patch) => setVariants((list) => list.map((v) => (v.id === vid ? { ...v, ...patch } : v)));

  const options = useMemo(() => reconcile(rows, variants).options, [rows, variants]);
  const totalStock = variants.filter((v) => v.active).reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    const local = {};
    if (!options.length) local.options = 'Add at least one option, such as Size, with its values.';
    if (new Set(rows.map((r) => r.name.trim().toLowerCase()).filter(Boolean)).size !== rows.filter((r) => r.name.trim()).length) {
      local.options = 'Each option needs a different name.';
    }
    if (!form.category.trim()) local.category = 'Choose or type a category.';
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const { detailsText, ...rest } = form;
      await adminService.saveProduct({
        ...rest,
        category: form.category.trim(),
        details: detailsText.split('\n'),
        options,
        variants,
      });
      toast(editing ? 'Product saved.' : 'Product added.');
      navigate('/admin/products');
    } catch (err) {
      setFormError(err.message);
      setErrors(err.fieldErrors || {});
      setBusy(false);
    }
  };

  if (loading) return <Loading block label="Loading the product" />;
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (editing && !loaded) return <ErrorState error={new Error('That product could not be found.')} title="Product not found" />;

  return (
    <AdminPage
      title={editing ? `Edit ${loaded?.name || 'product'}` : 'New product'}
      intro="Changes appear in the shop as soon as the product is saved and active."
      back={
        <Link to="/admin/products" className="backlink">
          <ArrowLeft size={15} aria-hidden /> All products
        </Link>
      }
    >
      <form onSubmit={submit} noValidate className="pform">
        <Section title="Basics">
          <div className="form-grid">
            <Input wrapperClass="span-2" label="Name" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Web address" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug')(e); }} error={errors.slug} hint={`/shop/${form.slug || 'product-name'}`} />
            <Input label="Category" list="cat-list" value={form.category} onChange={set('category')} error={errors.category} />
            <datalist id="cat-list">{(categories || []).map((c) => <option key={c} value={c} />)}</datalist>
            <Input label="Price (₹)" type="number" min="0" step="1" inputMode="numeric" value={form.price} onChange={set('price')} error={errors.price} />
            <div className="pform__active">
              <Switch checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} label={form.active ? 'Active: visible in the shop' : 'Hidden from the shop'} />
            </div>
            <Textarea wrapperClass="span-2" label="Description" rows={4} value={form.description} onChange={set('description')} />
            <Textarea wrapperClass="span-2" label="Details" optional rows={3} value={form.detailsText} onChange={set('detailsText')} hint="One point per line, e.g. “Ten nails per set”." />
          </div>
        </Section>

        <Section title="Images" action={<span className="muted">{form.images.filter(Boolean).length} added</span>}>
          <p className="muted" style={{ marginTop: 0 }}>Paste an image address. The first image is the main one. Direct uploads arrive when the API is connected.</p>
          {errors.images && <p className="field__error" role="alert">{errors.images}</p>}
          <ul className="imglist">
            {form.images.map((url, i) => (
              <li key={i}>
                <Thumb src={url} />
                <Input aria-label={`Image ${i + 1} address`} placeholder="https://… or /images/…" value={url} onChange={(e) => setImage(i, e.target.value)} wrapperClass="imglist__input" />
                <div className="imglist__tools">
                  <button type="button" className="icon-btn" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} up`}><ArrowUp size={16} aria-hidden /></button>
                  <button type="button" className="icon-btn" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label={`Move image ${i + 1} down`}><ArrowDown size={16} aria-hidden /></button>
                  <button type="button" className="icon-btn" onClick={() => setForm((f) => ({ ...f, images: f.images.length > 1 ? f.images.filter((_, j) => j !== i) : [''] }))} aria-label={`Remove image ${i + 1}`}><Trash2 size={16} aria-hidden /></button>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" onClick={() => setForm((f) => ({ ...f, images: [...f.images, ''] }))}>
            <Plus size={14} aria-hidden /> Add image
          </Button>
        </Section>

        <Section title="Options" action={<span className="muted">{variants.length} variants</span>}>
          <p className="muted" style={{ marginTop: 0 }}>Each product chooses its own options, such as Size, Shape or Length. List the values separated by commas; a variant is created for every combination.</p>
          {errors.options && <p className="field__error" role="alert">{errors.options}</p>}
          <ul className="optlist">
            {rows.map((r, i) => (
              <li key={i}>
                <Input aria-label={`Option ${i + 1} name`} placeholder="Option, e.g. Shape" value={r.name} onChange={(e) => changeRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <Input aria-label={`Option ${i + 1} values`} placeholder="Values, e.g. Almond, Coffin" value={r.values} onChange={(e) => changeRows(rows.map((x, j) => (j === i ? { ...x, values: e.target.value } : x)))} />
                <button type="button" className="icon-btn" aria-label={`Remove option ${i + 1}`} onClick={() => changeRows(rows.filter((_, j) => j !== i))}><Trash2 size={16} aria-hidden /></button>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" onClick={() => changeRows([...rows, { name: '', values: '' }])}>
            <Plus size={14} aria-hidden /> Add option
          </Button>
        </Section>

        <Section title="Stock by variant" action={<span className="muted">{totalStock} in stock</span>}>
          {variants.length === 0 ? (
            <p className="muted">Add an option above to create variants.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>SKU</th>
                    <th style={{ width: 130 }}>Stock</th>
                    <th>Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className={v.active ? '' : 'is-off'}>
                      <td className="t-strong">{variantLabel(v.options)}</td>
                      <td>
                        <input className="input input--compact" aria-label={`SKU for ${variantLabel(v.options)}`} value={v.sku || ''} onChange={(e) => setVariant(v.id, { sku: e.target.value })} />
                      </td>
                      <td>
                        <input className="input input--compact num" type="number" min="0" step="1" inputMode="numeric" aria-label={`Stock for ${variantLabel(v.options)}`} value={v.stock} onChange={(e) => setVariant(v.id, { stock: e.target.value })} />
                      </td>
                      <td>
                        <Switch checked={v.active} onChange={(a) => setVariant(v.id, { active: a })} label={v.active ? 'On sale' : 'Off'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {formError && <p className="notice notice--bad" role="alert"><span>{formError}</span></p>}
        <div className="btn-row pform__save">
          <Button type="submit" size="lg" loading={busy}>{editing ? 'Save product' : 'Add product'}</Button>
          <Button as={Link} to="/admin/products" variant="ghost">Cancel</Button>
        </div>
      </form>
    </AdminPage>
  );
}
