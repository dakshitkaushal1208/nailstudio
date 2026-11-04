import { Link } from 'react-router-dom';
import { useStudio } from '../context/StudioContext';
import { usePageMeta } from '../hooks/usePageMeta';

const DOCS = {
  privacy: {
    title: 'Privacy policy',
    em: 'in plain words.',
    sections: [
      ['What we ask for', 'When you register, book or order, the studio asks for your name, email, phone number and, for deliveries, your address. These are used only to run your appointments and orders.'],
      ['Who sees it', 'The studio owner. Details are not sold, and they are shared with a courier only so your order can be delivered.'],
      ['Payments', 'This website does not take online payments. Payment is arranged directly between you and the studio.'],
      ['Your choices', 'You can ask the studio to correct or delete your details at any time by contacting them.'],
    ],
  },
  terms: {
    title: 'Terms of use',
    em: 'at a glance.',
    sections: [
      ['Appointments', 'An appointment request is not a confirmed booking until the studio approves it. Cancellation timing follows the booking policy shown when you request.'],
      ['Orders', 'An order request is confirmed by the studio, which then arranges payment and delivery with you. An order is not paid until the studio records your payment.'],
      ['Prices and stock', 'Prices and availability can change. The studio confirms the final amount, including delivery, before you pay.'],
      ['Returns', 'Return and replacement arrangements for press-on sets are set by the studio and will be stated here.'],
    ],
  },
};

export default function LegalPage({ kind }) {
  const doc = DOCS[kind];
  usePageMeta(doc.title);
  const { settings } = useStudio();
  const contact = settings?.contact || {};
  return (
    <div className="container legal">
      <header className="page-head">
        <p className="eyebrow">Studio policies</p>
        <h1 className="h-page">
          {doc.title} <em>{doc.em}</em>
        </h1>
        <p className="notice notice--plain">
          <span>Draft wording for development. The studio owner should review and replace it with their own policy, and take legal advice where needed, before launch.</span>
        </p>
      </header>
      {doc.sections.map(([h, p]) => (
        <section key={h}>
          <h2>{h}</h2>
          <p>{p}</p>
        </section>
      ))}
      <p className="muted">
        Questions? {contact.email || contact.phone ? `Contact the studio on ${[contact.phone, contact.email].filter(Boolean).join(' or ')}.` : 'Studio contact details will be added here.'} <Link to="/">Back to the studio</Link>
      </p>
    </div>
  );
}
