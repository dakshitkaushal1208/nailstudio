import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SmartImage } from '../components/ui/SmartImage';
import { Loading, ErrorState, SampleNote, EmptyState } from '../components/ui/States';
import { GalleryTile } from '../components/gallery/GalleryTile';
import { Lightbox } from '../components/gallery/Lightbox';
import { ProductCard } from '../components/products/ProductCard';
import { useAsync } from '../hooks/useAsync';
import { useReveal } from '../hooks/useReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { useStudio } from '../context/StudioContext';
import { galleryService } from '../services/galleryService';
import { studioService } from '../services/studioService';
import { productService } from '../services/productService';
import { assets } from '../data/assets';
import { formatDuration } from '../utils/date';
import { formatPrice } from '../utils/format';

function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ Hero */
function Hero() {
  const { settings } = useStudio();
  const title = settings?.copy?.heroTitle || 'Beautiful nails. Thoughtfully crafted.';
  const text = settings?.copy?.heroText || '';
  const [first, ...rest] = title.split(/(?<=\.)\s+/);

  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">Nail art · Press-on sets</p>
          <h1 className="display hero__title">
            {first}
            {rest.length > 0 && (
              <>
                <br />
                <em>{rest.join(' ')}</em>
              </>
            )}
          </h1>
          <p className="lede hero__text">{text}</p>
          <div className="btn-row hero__cta">
            <Button as={Link} to="/book" size="lg">
              Book an appointment
            </Button>
            <Button as={Link} to="/shop" variant="secondary" size="lg">
              Explore press-on nails
            </Button>
          </div>

          <ol className="ways">
            <li>
              <span className="ways__n">01</span>
              <div>
                <h2>In the studio</h2>
                <p>Choose a service, pick a time, and send a request. The studio confirms it.</p>
              </div>
              <Link to="/book" aria-label="Book an appointment" className="ways__go">
                <ArrowRight size={18} aria-hidden />
              </Link>
            </li>
            <li>
              <span className="ways__n">02</span>
              <div>
                <h2>At home</h2>
                <p>Ready-made press-on sets, chosen by size and shape, delivered to you.</p>
              </div>
              <Link to="/shop" aria-label="Shop press-on nails" className="ways__go">
                <ArrowRight size={18} aria-hidden />
              </Link>
            </li>
          </ol>
        </div>

        <div className="hero__art" aria-hidden={false}>
          <span className="hero__arch-line" aria-hidden />
          <div className="hero__arch">
            <SmartImage src={assets.hero} alt="Illustrated set of nails in French, chrome and rosette finishes" className="fit" />
          </div>
          <div className="hero__inset">
            <SmartImage src={assets.heroSecondary} alt="Illustrated gold chrome nails" className="fit" />
          </div>
          <p className="hero__vertical" aria-hidden>
            Hand-finished · Made to be worn
          </p>
        </div>
      </div>
      <div className="container">
        <SampleNote />
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Featured work */
function Featured() {
  const { data, loading, error, retry } = useAsync(() => galleryService.list(), []);
  const [open, setOpen] = useState(-1);
  const items = (data || []).slice(0, 4);

  return (
    <section className="section section--tight featured">
      <div className="container">
        <Reveal className="head-split">
          <div>
            <p className="eyebrow">Recent work</p>
            <h2 className="h-section">
              A little <em>inspiration.</em>
            </h2>
          </div>
          <Link to="/gallery" className="btn btn--link">
            See the full gallery
          </Link>
        </Reveal>

        {loading && <Loading block label="Loading the gallery" />}
        {error && <ErrorState error={error} onRetry={retry} />}
        {!loading && !error && items.length === 0 && <EmptyState title="The gallery is being curated">New work will appear here soon.</EmptyState>}
        {items.length > 0 && (
          <div className="featured__row">
            {items.map((item, i) => (
              <Reveal key={item.id} className={`featured__item featured__item--${i + 1}`}>
                <GalleryTile item={item} onOpen={() => setOpen(i)} ratio="4 / 5" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
      {open >= 0 && <Lightbox items={items} index={open} onClose={() => setOpen(-1)} onIndex={setOpen} />}
    </section>
  );
}

/* -------------------------------------------------------------- Services */
function Services() {
  const { data, loading, error, retry } = useAsync(() => studioService.listServices(), []);

  return (
    <section className="section services" id="services">
      <div className="container services__grid">
        <Reveal className="services__intro">
          <p className="eyebrow">Salon services</p>
          <h2 className="h-section">
            Every set begins with a <em>conversation.</em>
          </h2>
          <p className="lede">Tell us the shape, length and finish you have in mind. We will plan the rest together at your appointment.</p>
          <Button as={Link} to="/book" variant="secondary">
            Request an appointment
          </Button>
          <SampleNote>Sample services, durations and prices. The studio confirms its real menu.</SampleNote>
        </Reveal>

        <div className="services__list">
          {loading && <Loading block label="Loading services" />}
          {error && <ErrorState error={error} onRetry={retry} />}
          {data?.map((s, i) => (
            <Reveal as="article" className="svc" key={s.id}>
              <span className="svc__n num">{String(i + 1).padStart(2, '0')}</span>
              <SmartImage src={s.image} alt="" className="svc__img" />
              <div className="svc__body">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <p className="svc__meta num">
                  {[formatDuration(s.durationMin), s.price != null && formatPrice(s.price)].filter(Boolean).join('  ·  ')}
                </p>
              </div>
              <Link to={`/book?service=${s.id}`} className="btn btn--link svc__book">
                Book now
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Collection */
function Collection() {
  const { data, loading, error, retry } = useAsync(() => productService.list({ sort: 'newest' }), []);
  const items = (data || []).slice(0, 4);

  return (
    <section className="section section--rose collection">
      <div className="container">
        <Reveal className="head-split">
          <div>
            <p className="eyebrow">Press-on collection</p>
            <h2 className="h-section">
              Salon finish, <em>ready to wear.</em>
            </h2>
          </div>
          <Link to="/shop" className="btn btn--link">
            Shop the full collection
          </Link>
        </Reveal>
        {loading && <Loading block label="Loading the collection" />}
        {error && <ErrorState error={error} onRetry={retry} />}
        {items.length > 0 && (
          <div className="pgrid pgrid--4">
            {items.map((p) => (
              <Reveal key={p.id}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
        <SampleNote>Sample products, prices and stock for development.</SampleNote>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- About */
function About() {
  const { settings } = useStudio();
  const copy = settings?.copy;
  return (
    <section className="section about">
      <div className="container about__grid">
        <Reveal className="about__media">
          <div className="about__block" aria-hidden />
          <SmartImage src={assets.about} alt="Illustrated pair of chrome nails" className="about__img about__img--a" />
          <SmartImage src={assets.aboutSecondary} alt="Illustrated floral nails" className="about__img about__img--b" />
        </Reveal>
        <Reveal className="about__copy">
          <p className="eyebrow">About the studio</p>
          <h2 className="h-section">{copy?.aboutTitle || 'A quiet room, a careful hand.'}</h2>
          {(copy?.aboutParagraphs || []).map((p, i) => (
            <p key={i} className={i === 0 ? 'lede' : 'muted'}>
              {p}
            </p>
          ))}
          <div className="btn-row">
            <Button as={Link} to="/gallery" variant="secondary">
              See the work
            </Button>
            <Link to="/book" className="btn btn--link">
              Book a visit
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Gallery preview */
function GalleryPreview() {
  const { data: items, loading, error, retry } = useAsync(() => galleryService.list(), []);
  const { data: categories } = useAsync(() => galleryService.categories(), []);
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(-1);

  const shown = useMemo(() => (items || []).filter((g) => !category || g.category === category).slice(0, 6), [items, category]);

  return (
    <section className="section section--sand gpreview">
      <div className="container">
        <Reveal className="head-split">
          <div>
            <p className="eyebrow">The gallery</p>
            <h2 className="h-section">
              Finishes, <em>one by one.</em>
            </h2>
          </div>
          <Link to="/gallery" className="btn btn--link">
            Open the gallery <ArrowUpRight size={15} aria-hidden />
          </Link>
        </Reveal>

        <div className="tabs" role="group" aria-label="Filter by style">
          <button type="button" className="tab" aria-pressed={!category} onClick={() => setCategory('')}>
            All
          </button>
          {(categories || []).map((c) => (
            <button key={c} type="button" className="tab" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {loading && <Loading block label="Loading" />}
        {error && <ErrorState error={error} onRetry={retry} />}
        {!loading && !error && shown.length === 0 && <EmptyState title="Nothing in this style yet">Try another style, or see everything in the gallery.</EmptyState>}
        {shown.length > 0 && (
          <div className="mosaic">
            {shown.map((item, i) => (
              <GalleryTile key={item.id} item={item} onOpen={() => setOpen(i)} className={`mosaic__item mosaic__item--${i + 1}`} />
            ))}
          </div>
        )}
      </div>
      {open >= 0 && <Lightbox items={shown} index={open} onClose={() => setOpen(-1)} onIndex={setOpen} />}
    </section>
  );
}

/* -------------------------------------------------------------- Booking */
function BookingBand() {
  return (
    <section className="band">
      <svg className="band__arch" viewBox="0 0 400 520" aria-hidden preserveAspectRatio="xMaxYMid slice">
        <path d="M30 520V200a170 170 0 0 1 340 0v320" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M70 520V205a130 130 0 0 1 260 0v315" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".6" />
      </svg>
      <div className="container band__inner">
        <Reveal>
          <p className="eyebrow band__eyebrow">By appointment</p>
          <h2 className="band__title">
            Your next set, <em>unhurried.</em>
          </h2>
          <p className="band__text">Choose a service and a time that suits you. Your request goes to the studio, and you will see its status the moment it is approved.</p>
          <div className="btn-row">
            <Button as={Link} to="/book" variant="light" size="lg">
              Book an appointment
            </Button>
            <Button as={Link} to="/shop" variant="outline-light" size="lg">
              Or shop press-ons
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta('');
  return (
    <>
      <Hero />
      <Featured />
      <Services />
      <Collection />
      <About />
      <GalleryPreview />
      <BookingBand />
    </>
  );
}
