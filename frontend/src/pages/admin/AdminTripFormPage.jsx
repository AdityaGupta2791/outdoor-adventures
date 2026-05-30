import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Save, ExternalLink } from 'lucide-react'
import Button from '../../components/Button'
import {
  useAdminTrip,
  useAdminCategories,
  useAdminCreateTrip,
  useAdminUpdateTrip,
  useAdminCreateDeparture,
  useAdminUpdateDeparture,
  useAdminDeleteDeparture,
} from '../../features/admin/admin.hooks'
import { formatINR, formatDateRange } from '../../lib/format'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const schema = z.object({
  slug: z.string().trim().min(3).max(120).regex(slugRegex, 'Lowercase letters, numbers, hyphens'),
  title: z.string().trim().min(3).max(200),
  shortDescription: z.string().trim().min(10).max(280),
  description: z.string().trim().min(20),
  categoryId: z.string().min(1, 'Pick a category'),
  difficulty: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING']),
  durationDays: z.coerce.number().int().positive().max(30),
  location: z.string().trim().min(2).max(120),
  basePriceInRupees: z.coerce.number().int().nonnegative(),
  coverImage: z.string().url('Must be a valid URL'),
  images: z.array(z.object({ value: z.string().url() })).default([]),
  itinerary: z
    .array(
      z.object({
        day: z.coerce.number().int().positive(),
        title: z.string().trim().min(1, 'Required'),
        description: z.string().trim().default(''),
      }),
    )
    .min(1, 'Add at least one day'),
  inclusions: z.array(z.object({ value: z.string().trim().min(1) })).default([]),
  exclusions: z.array(z.object({ value: z.string().trim().min(1) })).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const emptyDefaults = {
  slug: '',
  title: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  difficulty: 'MODERATE',
  durationDays: 5,
  location: '',
  basePriceInRupees: 0,
  coverImage: '',
  images: [],
  itinerary: [{ day: 1, title: '', description: '' }],
  inclusions: [],
  exclusions: [],
  status: 'DRAFT',
}

function AdminTripFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()

  const { data: categories } = useAdminCategories()
  const { data: trip, isLoading: loadingTrip } = useAdminTrip(isEdit ? id : null)
  const createMut = useAdminCreateTrip()
  const updateMut = useAdminUpdateTrip()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: emptyDefaults })

  const itinerary = useFieldArray({ control, name: 'itinerary' })
  const images = useFieldArray({ control, name: 'images' })
  const inclusions = useFieldArray({ control, name: 'inclusions' })
  const exclusions = useFieldArray({ control, name: 'exclusions' })

  const [serverError, setServerError] = useState(null)
  const titleVal = watch('title')
  const slugVal = watch('slug')

  // Auto-slug from title on create
  useEffect(() => {
    if (!isEdit && titleVal && !slugVal) {
      setValue('slug', slugify(titleVal))
    }
  }, [titleVal, slugVal, isEdit, setValue])

  // Populate form on edit when trip loads
  useEffect(() => {
    if (isEdit && trip) {
      reset({
        slug: trip.slug,
        title: trip.title,
        shortDescription: trip.shortDescription,
        description: trip.description,
        categoryId: trip.categoryId,
        difficulty: trip.difficulty,
        durationDays: trip.durationDays,
        location: trip.location,
        basePriceInRupees: Math.round(trip.basePriceInPaise / 100),
        coverImage: trip.coverImage,
        images: (trip.images ?? []).map((value) => ({ value })),
        itinerary: trip.itinerary ?? [{ day: 1, title: '', description: '' }],
        inclusions: (trip.inclusions ?? []).map((value) => ({ value })),
        exclusions: (trip.exclusions ?? []).map((value) => ({ value })),
        status: trip.status,
      })
    }
  }, [trip, isEdit, reset])

  const onSubmit = async (values) => {
    setServerError(null)
    const payload = {
      slug: values.slug,
      title: values.title,
      shortDescription: values.shortDescription,
      description: values.description,
      categoryId: values.categoryId,
      difficulty: values.difficulty,
      durationDays: values.durationDays,
      location: values.location,
      basePriceInPaise: values.basePriceInRupees * 100,
      coverImage: values.coverImage,
      images: values.images.map((i) => i.value),
      itinerary: values.itinerary,
      inclusions: values.inclusions.map((i) => i.value),
      exclusions: values.exclusions.map((i) => i.value),
      status: values.status,
    }
    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id, data: payload })
      } else {
        const created = await createMut.mutateAsync(payload)
        navigate(`/admin/trips/${created.id}`, { replace: true })
        return
      }
    } catch (err) {
      setServerError(err?.response?.data?.error?.message || 'Failed to save trip.')
    }
  }

  if (isEdit && loadingTrip) return <FormSkeleton />

  const busy = createMut.isPending || updateMut.isPending

  return (
    <div>
      <Link
        to="/admin/trips"
        className="inline-flex items-center gap-1 mb-4 text-sm text-brand-muted hover:text-brand-text"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to trips
      </Link>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brand-text">
            {isEdit ? 'Edit trip' : 'New trip'}
          </h1>
          {isEdit && trip && (
            <Link
              to={`/trips/${trip.slug}`}
              target="_blank"
              className="mt-1 inline-flex items-center gap-1 text-sm text-brand-accent hover:underline"
            >
              View public page
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card title="Basics">
          <Grid>
            <Field label="Title" error={errors.title?.message} span={2}>
              <input {...register('title')} className={inputCls(errors.title)} />
            </Field>
            <Field label="Slug" error={errors.slug?.message} hint="Used in the URL">
              <input {...register('slug')} className={inputCls(errors.slug)} />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <select {...register('status')} className={inputCls(errors.status)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <Field label="Category" error={errors.categoryId?.message}>
              <select {...register('categoryId')} className={inputCls(errors.categoryId)}>
                <option value="">Select…</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty" error={errors.difficulty?.message}>
              <select {...register('difficulty')} className={inputCls(errors.difficulty)}>
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="DIFFICULT">Difficult</option>
                <option value="CHALLENGING">Challenging</option>
              </select>
            </Field>
            <Field label="Duration (days)" error={errors.durationDays?.message}>
              <input
                type="text"
                inputMode="numeric"
                {...register('durationDays')}
                className={inputCls(errors.durationDays)}
              />
            </Field>
            <Field label="Location" error={errors.location?.message}>
              <input {...register('location')} className={inputCls(errors.location)} />
            </Field>
            <Field label="Base price (₹)" error={errors.basePriceInRupees?.message}>
              <input
                type="text"
                inputMode="numeric"
                {...register('basePriceInRupees')}
                className={inputCls(errors.basePriceInRupees)}
              />
            </Field>
          </Grid>
          <Field
            label="Short description"
            error={errors.shortDescription?.message}
            hint="Used on cards (≤ 280 chars)"
          >
            <input
              {...register('shortDescription')}
              className={inputCls(errors.shortDescription)}
            />
          </Field>
          <Field label="Full description" error={errors.description?.message}>
            <textarea
              rows={5}
              {...register('description')}
              className={`${inputCls(errors.description)} resize-y`}
            />
          </Field>
        </Card>

        <Card title="Images">
          <Field label="Cover image URL" error={errors.coverImage?.message}>
            <input {...register('coverImage')} className={inputCls(errors.coverImage)} />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-brand-text">Gallery image URLs</label>
              <button
                type="button"
                onClick={() => images.append({ value: '' })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add image
              </button>
            </div>
            <div className="space-y-2">
              {images.fields.length === 0 && (
                <p className="text-xs text-brand-muted">No gallery images yet.</p>
              )}
              {images.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <input
                    {...register(`images.${i}.value`)}
                    className={inputCls(errors.images?.[i]?.value)}
                  />
                  <IconButton onClick={() => images.remove(i)} title="Remove" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Itinerary"
          action={
            <button
              type="button"
              onClick={() =>
                itinerary.append({
                  day: itinerary.fields.length + 1,
                  title: '',
                  description: '',
                })
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add day
            </button>
          }
        >
          <div className="space-y-3">
            {itinerary.fields.map((f, i) => (
              <div
                key={f.id}
                className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-brand-cream/40 ring-1 ring-black/5"
              >
                <div className="col-span-2 sm:col-span-1">
                  <Controller
                    control={control}
                    name={`itinerary.${i}.day`}
                    render={({ field }) => (
                      <input
                        type="text"
                        inputMode="numeric"
                        {...field}
                        className={inputCls(errors.itinerary?.[i]?.day) + ' text-center'}
                      />
                    )}
                  />
                </div>
                <div className="col-span-10 sm:col-span-4">
                  <input
                    placeholder="Day title"
                    {...register(`itinerary.${i}.title`)}
                    className={inputCls(errors.itinerary?.[i]?.title)}
                  />
                </div>
                <div className="col-span-11 sm:col-span-6">
                  <input
                    placeholder="Description (optional)"
                    {...register(`itinerary.${i}.description`)}
                    className={inputCls()}
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <IconButton onClick={() => itinerary.remove(i)} title="Remove" />
                </div>
              </div>
            ))}
            {errors.itinerary?.message && (
              <p className="text-xs text-red-600">{errors.itinerary.message}</p>
            )}
          </div>
        </Card>

        <Card title="What's included / not included">
          <Grid>
            <ListField
              label="Inclusions"
              fields={inclusions.fields}
              onAdd={() => inclusions.append({ value: '' })}
              onRemove={(i) => inclusions.remove(i)}
              register={(i) => register(`inclusions.${i}.value`)}
            />
            <ListField
              label="Exclusions"
              fields={exclusions.fields}
              onAdd={() => exclusions.append({ value: '' })}
              onRemove={(i) => exclusions.remove(i)}
              register={(i) => register(`exclusions.${i}.value`)}
            />
          </Grid>
        </Card>

        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => navigate('/admin/trips')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={busy}>
            <Save className="w-4 h-4" />
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create trip'}
          </Button>
        </div>
      </form>

      {isEdit && trip && <DeparturesManager tripId={trip.id} departures={trip.departures} />}
    </div>
  )
}

function DeparturesManager({ tripId, departures }) {
  const create = useAdminCreateDeparture()
  const update = useAdminUpdateDeparture()
  const remove = useAdminDeleteDeparture()
  const [form, setForm] = useState({ startDate: '', endDate: '', priceInRupees: '', totalSeats: '' })
  const [error, setError] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.startDate || !form.endDate || !form.priceInRupees || !form.totalSeats) {
      setError('Fill all departure fields')
      return
    }
    try {
      await create.mutateAsync({
        tripId,
        data: {
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          priceInPaise: Number(form.priceInRupees) * 100,
          totalSeats: Number(form.totalSeats),
        },
      })
      setForm({ startDate: '', endDate: '', priceInRupees: '', totalSeats: '' })
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to add departure')
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this departure?')) {
      remove.mutate(id, {
        onError: (err) =>
          setError(err?.response?.data?.error?.message || 'Failed to delete departure'),
      })
    }
  }

  const toggleStatus = (d) => {
    const next = d.status === 'CANCELLED' ? 'OPEN' : 'CANCELLED'
    update.mutate({ id: d.id, data: { status: next } })
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-brand-text mb-3">Departures</h2>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm">
        <form onSubmit={handleCreate} className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-2 border-b border-black/5">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className={inputCls()}
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className={inputCls()}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Price (₹)"
            value={form.priceInRupees}
            onChange={(e) => setForm({ ...form, priceInRupees: e.target.value })}
            className={inputCls()}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Total seats"
            value={form.totalSeats}
            onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
            className={inputCls()}
          />
          <Button type="submit" variant="primary" size="md" disabled={create.isPending}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </form>
        {error && (
          <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-200">
            {error}
          </div>
        )}
        <div className="divide-y divide-black/5">
          {departures.length === 0 ? (
            <div className="p-6 text-center text-sm text-brand-muted">No departures yet.</div>
          ) : (
            departures.map((d) => (
              <div key={d.id} className="px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
                <div className="flex-1 min-w-[12rem]">
                  <div className="font-semibold text-brand-text">
                    {formatDateRange(d.startDate, d.endDate)}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {d.availableSeats} of {d.totalSeats} seats · {formatINR(d.priceInPaise)}
                  </div>
                </div>
                <span
                  className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    d.status === 'OPEN'
                      ? 'bg-green-100 text-green-800'
                      : d.status === 'FULL'
                        ? 'bg-yellow-100 text-yellow-800'
                        : d.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {d.status}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStatus(d)}
                  className="text-xs font-semibold text-brand-accent hover:underline"
                >
                  {d.status === 'CANCELLED' ? 'Reopen' : 'Cancel'}
                </button>
                <IconButton onClick={() => handleDelete(d.id)} title="Delete" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function Card({ title, action, children }) {
  return (
    <section className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5 sm:p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold text-brand-text">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

function Field({ label, hint, error, children, span }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-brand-text mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function ListField({ label, fields, onAdd, onRemove, register }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-brand-text">{label}</label>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {fields.length === 0 && <p className="text-xs text-brand-muted">None yet.</p>}
        {fields.map((f, i) => (
          <div key={f.id} className="flex gap-2">
            <input {...register(i)} className={inputCls()} />
            <IconButton onClick={() => onRemove(i)} title="Remove" />
          </div>
        ))}
      </div>
    </div>
  )
}

function IconButton({ onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors"
      title={title}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

function inputCls(error) {
  return `w-full px-3 py-2 rounded-lg bg-white border ${
    error ? 'border-red-400' : 'border-gray-300'
  } focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors`
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default AdminTripFormPage
