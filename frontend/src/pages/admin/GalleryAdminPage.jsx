import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Tags,
  Trash2,
  X,
  Upload,
} from 'lucide-react';

import { AdminPage } from '../../components/layout/AdminLayout';
import { Switch } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Confirm } from '../../components/ui/Confirm';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { SmartImage } from '../../components/ui/SmartImage';
import { EmptyState, ErrorState, Loading } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';

const BLANK = {
  title: '',
  imageUrl: '',
  category: '',
  description: '',
  active: true,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function ItemForm({ item, categories, onClose, onSaved }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef('');
  const uploadedRef = useRef(null);

  const [form, setForm] = useState(
    item ? { ...item } : { ...BLANK, category: categories[0] || '' }
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const set = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setFormError('');
  };

  const chooseFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({
        ...current,
        imageUrl: 'Please select a valid image file.',
      }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((current) => ({
        ...current,
        imageUrl: 'Image must be 5 MB or smaller.',
      }));
      event.target.value = '';
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    setSelectedFile(file);
    setLocalPreview(previewUrl);

    // Clear the old image address when a new file is selected.
    setForm((current) => ({
      ...current,
      imageUrl: '',
    }));

    setErrors((current) => ({
      ...current,
      imageUrl: '',
    }));

    setFormError('');
  };

  const save = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!selectedFile && !form.imageUrl.trim()) {
      setErrors((current) => ({
        ...current,
        imageUrl: 'Choose an image or enter an image address.',
      }));
      return;
    }

    setBusy(true);

    try {
      // Upload first, then save the returned address with the entry. If the
      // save fails and the person retries, the file is not uploaded twice.
      let imageUrl = form.imageUrl.trim();
      if (selectedFile) {
        if (!uploadedRef.current || uploadedRef.current.file !== selectedFile) {
          uploadedRef.current = {
            file: selectedFile,
            url: await adminService.uploadGalleryImage(selectedFile),
          };
        }
        imageUrl = uploadedRef.current.url;
      }

      await adminService.saveGalleryItem({
        ...form,
        title: form.title.trim(),
        imageUrl,
      });

      toast(item ? 'Gallery entry updated.' : 'Added to the gallery.');
      onSaved();
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(err.message || 'Unable to save the gallery entry.');
    } finally {
      // Always release the button, whatever happened above.
      setBusy(false);
    }
  };

  const previewSource = localPreview || form.imageUrl.trim();

  return (
    <Modal
      open
      onClose={busy ? undefined : onClose}
      title={item ? 'Edit gallery entry' : 'Add to the gallery'}
      size="lg"
    >
      <form onSubmit={save} noValidate className="gform">
        <div className="gform__preview">
          {localPreview ? (
            <img
              src={localPreview}
              alt="Selected image preview"
              className="gform__img"
              style={{
                width: '100%',
                aspectRatio: '4 / 5',
                objectFit: 'cover',
              }}
            />
          ) : (
            <SmartImage
              src={previewSource}
              alt={form.title || 'Gallery image preview'}
              className="gform__img"
              ratio="4 / 5"
            />
          )}

          {!previewSource && (
            <p className="muted">Choose a photo to preview it.</p>
          )}

          {selectedFile && (
            <p className="muted" style={{ overflowWrap: 'anywhere' }}>
              {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={chooseFile}
            hidden
          />

          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            <Upload size={16} aria-hidden />
            {selectedFile ? 'Choose another image' : 'Choose image from files'}
          </Button>

          {selectedFile && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSelectedFile(null);
                setLocalPreview('');
                if (objectUrlRef.current) {
                  URL.revokeObjectURL(objectUrlRef.current);
                  objectUrlRef.current = '';
                }
              }}
              disabled={busy}
            >
              Remove selected image
            </Button>
          )}
        </div>

        <div className="stack">
          <Input
            label="Title"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />

          <Select
            label="Category"
            value={form.category}
            onChange={set('category')}
            error={errors.category}
            options={categories}
            placeholder="Choose a category"
          />

          <Textarea
            label="Caption"
            optional
            rows={3}
            value={form.description || ''}
            onChange={set('description')}
          />

          <Switch
            checked={form.active}
            onChange={(value) =>
              setForm((current) => ({ ...current, active: value }))
            }
            label={
              form.active
                ? 'Shown on the website'
                : 'Hidden from the website'
            }
          />

          {formError && (
            <p className="field__error" role="alert">
              {formError}
            </p>
          )}

          <div className="btn-row">
            <Button type="submit" loading={busy}>
              {item ? 'Save changes' : 'Add to gallery'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function Categories({ initial, onClose, onSaved }) {
  const toast = useToast();
  const [list, setList] = useState(initial);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const add = (event) => {
    event.preventDefault();
    const name = draft.trim();

    if (
      !name ||
      list.some((category) => category.toLowerCase() === name.toLowerCase())
    ) {
      return;
    }

    setList([...list, name]);
    setDraft('');
  };

  const save = async () => {
    setBusy(true);

    try {
      await adminService.saveGalleryCategories(list);
      toast('Categories saved.');
      onSaved();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Gallery categories"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy}>
            Save categories
          </Button>
        </>
      }
    >
      <p className="muted" style={{ marginTop: 0 }}>
        These become the filters on the public gallery. Entries in a removed
        category stay in the list but cannot be filtered.
      </p>

      <ul className="taglist">
        {list.map((category) => (
          <li key={category}>
            {category}
            <button
              type="button"
              onClick={() =>
                setList((current) =>
                  current.filter((value) => value !== category)
                )
              }
              aria-label={`Remove ${category}`}
            >
              <X size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="inline-add">
        <Input
          aria-label="New category"
          placeholder="New category"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>
    </Modal>
  );
}

export default function GalleryAdminPage() {
  usePageMeta('Gallery');
  const toast = useToast();

  const { data, loading, error, retry, reload, setData } = useAsync(
    () => adminService.listGallery(),
    []
  );
  const cats = useAsync(() => adminService.getGalleryCategories(), []);

  const [editing, setEditing] = useState(undefined);
  const [removing, setRemoving] = useState(null);
  const [managing, setManaging] = useState(false);
  const [filter, setFilter] = useState('');

  const items = data || [];

  const shown = useMemo(
    () => items.filter((item) => !filter || item.category === filter),
    [items, filter]
  );

  const move = async (item, direction) => {
    const list = [...items];
    const index = list.findIndex((entry) => entry.id === item.id);
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= list.length) return;

    [list[index], list[nextIndex]] = [list[nextIndex], list[index]];

    setData(list.map((entry, index) => ({ ...entry, order: index + 1 })));

    try {
      await adminService.reorderGallery(list.map((entry) => entry.id));
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      reload();
    }
  };

  const toggle = async (item) => {
    try {
      await adminService.saveGalleryItem({
        ...item,
        active: !item.active,
      });
      toast(
        item.active
          ? 'Hidden from the gallery.'
          : 'Now showing in the gallery.'
      );
      reload();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
    }
  };

  const remove = async () => {
    try {
      await adminService.removeGalleryItem(removing.id);
      toast('Removed from the gallery.');
      reload();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      throw err;
    }
  };

  const filtering = !!filter;

  return (
    <AdminPage
      title="Gallery"
      intro="Choose which finished work appears on the website, and in what order."
      actions={
        <>
          <Button variant="secondary" onClick={() => setManaging(true)}>
            <Tags size={16} aria-hidden />
            Categories
          </Button>
          <Button onClick={() => setEditing(null)}>
            <Plus size={16} aria-hidden />
            Add image
          </Button>
        </>
      }
    >
      <div className="toolbar">
        <Select
          label="Show"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          options={cats.data || []}
          placeholder="All categories"
          wrapperClass="toolbar__field"
        />

        {filtering && (
          <p className="muted toolbar__note">
            Reordering works on the full list. Clear the filter to move entries.
          </p>
        )}
      </div>

      {loading && !data && <Loading block label="Loading the gallery" />}
      {error && <ErrorState error={error} onRetry={retry} />}

      {data && shown.length === 0 && (
        <EmptyState title="No gallery entries">
          Add the first image to get started.
        </EmptyState>
      )}

      <ul className="agrid">
        {shown.map((item) => {
          const index = items.findIndex((entry) => entry.id === item.id);

          return (
            <li
              key={item.id}
              className={`acard ${item.active ? '' : 'is-off'}`}
            >
              <div className="acard__media">
                <SmartImage
                  src={item.imageUrl}
                  alt={item.title}
                  ratio="4 / 5"
                  className="acard__img"
                />
                <span className="acard__n num">{index + 1}</span>
                {!item.active && (
                  <span className="acard__hidden">Hidden</span>
                )}
              </div>

              <div className="acard__body">
                <strong>{item.title}</strong>
                <span className="muted">
                  {item.category}
                  {item.sample ? ' · sample' : ''}
                </span>
              </div>

              <div className="acard__tools">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => move(item, -1)}
                  disabled={filtering || index === 0}
                  aria-label={`Move ${item.title} earlier`}
                >
                  <ArrowUp size={16} aria-hidden />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => move(item, 1)}
                  disabled={filtering || index === items.length - 1}
                  aria-label={`Move ${item.title} later`}
                >
                  <ArrowDown size={16} aria-hidden />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setEditing(item)}
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil size={16} aria-hidden />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => toggle(item)}
                  aria-label={
                    item.active
                      ? `Hide ${item.title}`
                      : `Show ${item.title}`
                  }
                >
                  {item.active ? (
                    <EyeOff size={16} aria-hidden />
                  ) : (
                    <Eye size={16} aria-hidden />
                  )}
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setRemoving(item)}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {editing !== undefined && cats.data && (
        <ItemForm
          item={editing}
          categories={cats.data}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}

      {managing && cats.data && (
        <Categories
          initial={cats.data}
          onClose={() => setManaging(false)}
          onSaved={() => {
            setManaging(false);
            cats.reload();
          }}
        />
      )}

      <Confirm
        open={!!removing}
        title="Delete this gallery entry?"
        message={
          removing
            ? `“${removing.title}” will be removed from the gallery. This cannot be undone. To keep it but stop showing it, hide it instead.`
            : ''
        }
        confirmLabel="Delete entry"
        tone="danger"
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </AdminPage>
  );
}