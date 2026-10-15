import { useEffect, useId, useState, type FormEvent } from "react"
import { pressable } from "./ui"

/** Where contact messages go. The form has no server: it opens the visitor's email app pre-filled to this address. */
export const CONTACT_EMAIL = "yotam.eliraz@gmail.com"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Closing section of the About page, linking to the contact page. */
export function ContactCta() {
  return (
    <section aria-labelledby="contact-cta-title" className="mt-10 border-t border-ink/10 pt-8 text-center">
      <h2 className="text-heading font-bold text-ink" id="contact-cta-title">
        יש משהו שנרצה לשמוע מכם
      </h2>
      <p className="mt-2 text-body text-ink/80">שאלה, רעיון לשיתוף פעולה או משהו שחשוב לכם לספר לנו? אנחנו כאן.</p>
      <a
        className={`mt-6 inline-flex h-12 items-center justify-center rounded-control bg-accent px-8 text-body font-semibold text-white active:bg-accent-pressed ${pressable}`}
        href="#/contact"
      >
        יצירת קשר
      </a>
    </section>
  )
}

type Fields = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

function validate(f: Fields): Errors {
  const errors: Errors = {}
  if (!f.name.trim()) errors.name = "נא למלא שם"
  if (!f.email.trim()) errors.email = "נא למלא כתובת אימייל"
  else if (!EMAIL_RE.test(f.email.trim())) errors.email = "כתובת האימייל לא תקינה"
  if (!f.message.trim()) errors.message = "נא לכתוב הודעה"
  return errors
}

export function mailtoUrl(f: Fields): string {
  const subject = `פנייה מאתר המרחב — ${f.name.trim()}`
  const body = `שם: ${f.name.trim()}\nאימייל: ${f.email.trim()}\n\n${f.message.trim()}`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const fieldClass =
  "mt-2 block w-full rounded-card border bg-surface px-4 text-body text-ink placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-accent"

export default function ContactPage() {
  const id = useId()
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = "יצירת קשר · המרחב"
    return () => {
      document.title = previous
    }
  }, [])

  const update = (key: keyof Fields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    const first = (Object.keys(found) as (keyof Fields)[])[0]
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }
    window.open(mailtoUrl(fields), "_self")
    setOpened(true)
  }

  const field = (key: keyof Fields) => ({
    id: `${id}-${key}`,
    value: fields[key],
    onChange: update(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
    className: `${fieldClass} ${errors[key] ? "border-accent" : "border-line"}`,
  })

  const error = (key: keyof Fields) =>
    errors[key] && (
      <p className="mt-1 text-meta text-accent" id={`${id}-${key}-error`}>
        {errors[key]}
      </p>
    )

  return (
    <main className="px-4 pt-6 pb-12">
      <div className="text-center">
        <h1 className="text-page-title font-bold text-ink">יצירת קשר</h1>
        <p className="mt-1 text-body text-ink/80">שאלה, רעיון לשיתוף פעולה או משהו שחשוב לכם לספר לנו? אנחנו כאן.</p>
      </div>

      <form className="mt-8 flex flex-col gap-6" noValidate onSubmit={submit}>
        <div>
          <label className="text-meta font-semibold text-ink" htmlFor={`${id}-name`}>
            שם
          </label>
          <input autoComplete="name" type="text" {...field("name")} className={`${field("name").className} h-12`} />
          {error("name")}
        </div>
        <div>
          <label className="text-meta font-semibold text-ink" htmlFor={`${id}-email`}>
            אימייל
          </label>
          <input
            autoComplete="email"
            dir="ltr"
            inputMode="email"
            type="email"
            {...field("email")}
            className={`${field("email").className} h-12 text-right`}
          />
          {error("email")}
        </div>
        <div>
          <label className="text-meta font-semibold text-ink" htmlFor={`${id}-message`}>
            הודעה
          </label>
          <textarea rows={5} {...field("message")} className={`${field("message").className} resize-y py-3`} />
          {error("message")}
        </div>

        <button
          className={`flex h-12 w-full items-center justify-center rounded-control bg-accent text-body font-semibold text-white active:bg-accent-pressed ${pressable}`}
          type="submit"
        >
          שליחה
        </button>
        <p className="-mt-2 text-center text-meta text-ink-muted" role="status">
          {opened
            ? "ההודעה נפתחה באפליקציית המייל שלכם — נשאר רק ללחוץ על שליחה שם."
            : "הלחיצה תפתח את אפליקציית המייל שלכם עם ההודעה מוכנה לשליחה."}
        </p>
      </form>

      <p className="mt-8 text-center text-meta text-ink-muted">
        או כתבו לנו ישירות:{" "}
        <a className="font-semibold text-accent underline-offset-4 active:underline" dir="ltr" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </main>
  )
}
