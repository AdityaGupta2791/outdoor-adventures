import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import Button from '../components/Button'
import SectionHeader from '../components/SectionHeader'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const channels = [
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@outdooradventures.in',
    href: 'mailto:hello@outdooradventures.in',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
  },
  {
    icon: MapPin,
    title: 'Office',
    value: 'Rishikesh, Uttarakhand',
    href: null,
  },
]

function ContactPage() {
  useDocumentTitle('Contact')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Contact"
          title="Have a question? We'd love to hear from you."
          description="Whether you're planning your first trek or looking for a custom expedition, our team is here to help."
          align="center"
          size="lg"
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="space-y-4">
            {channels.map(({ icon: Icon, title, value, href }) => {
              const inner = (
                <div className="flex items-start gap-3 p-5 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                      {title}
                    </div>
                    <div className="mt-1 text-brand-text font-medium break-all">{value}</div>
                  </div>
                </div>
              )
              return href ? (
                <a key={title} href={href} className="block">
                  {inner}
                </a>
              ) : (
                <div key={title}>{inner}</div>
              )
            })}
          </aside>

          <form
            onSubmit={onSubmit}
            className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 ring-1 ring-black/5 shadow-sm space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Your name" value={form.name} onChange={update('name')} required />
              <Field
                label="Email address"
                type="email"
                value={form.email}
                onChange={update('email')}
                required
              />
            </div>
            <Field
              label="Subject"
              value={form.subject}
              onChange={update('subject')}
              required
            />
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={update('message')}
                rows={6}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors resize-none"
                placeholder="Tell us about the trip you're planning..."
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              <Send className="w-4 h-4" />
              Send message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-text mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
      />
    </div>
  )
}

export default ContactPage
