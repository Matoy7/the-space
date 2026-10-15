import { useEffect, useId, useState, type FormEvent } from "react"
import { pressable } from "./ui"

/** Where contact messages go. The form has no server: it opens the visitor's email app pre-filled to this address. */
export const CONTACT_EMAIL = "yotam.eliraz@gmail.com"

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

type Fields = { name: string; phone: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

/** Israeli mobile: 05X-XXXXXXX, with or without separators, or +972 / 972 instead of the leading 0. */
const digitsOnly = (v: string) => v.replace(/[\s\-().]/g, "")
export const isIsraeliMobile = (v: string) => /^(?:\+?972|0)5\d{8}$/.test(digitsOnly(v))

function validate(f: Fields): Errors {
  const errors: Errors = {}
  if (!f.name.trim()) errors.name = "נא למלא שם מלא"
  if (!f.phone.trim()) errors.phone = "נא למלא מספר נייד"
  else if (!isIsraeliMobile(f.phone)) errors.phone = "מספר הנייד לא תקין"
  if (!f.message.trim()) errors.message = "נא לכתוב הודעה"
  return errors
}

export function mailtoUrl(f: Fields): string {
  const subject = `פנייה מאתר המרחב — ${f.name.trim()}`
  const body = `שם: ${f.name.trim()}\nנייד: ${f.phone.trim()}\n\n${f.message.trim()}`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const contactPhoto = `${import.meta.env.BASE_URL}assets/contact-hero.jpg`

/* Layout follows the approved reference: photo with rounded corners, centred title + subtitle, placeholder-only
   fields (labels kept for screen readers) and a full-width olive send button. */
export default function ContactPage() {
  const id = useId()
  const [fields, setFields] = useState<Fields>({ name: "", phone: "", message: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = "צור קשר · המרחב"
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

  const control = (key: keyof Fields, extra: string) => ({
    id: `${id}-${key}`,
    value: fields[key],
    onChange: update(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
    className: `block w-full rounded-xl border bg-surface px-4 text-body text-ink placeholder:text-ink-muted/80 ${
      errors[key] ? "border-accent" : "border-line"
    } ${extra}`,
  })

  const error = (key: keyof Fields) =>
    errors[key] && (
      <p className="mt-1 text-meta text-accent" id={`${id}-${key}-error`}>
        {errors[key]}
      </p>
    )

  return (
    <main className="pt-2 pb-12">
      <div className="px-3">
        <img alt="" className="aspect-[450/252] w-full rounded-card object-cover" src={contactPhoto} />
      </div>

      <div className="mt-6 px-6 text-center">
        <h1 className="text-display-lg font-bold text-ink">צור קשר</h1>
        <p className="text-[17px] leading-6 text-ink/70">נשמח לשמוע מכם.</p>
      </div>

      <form className="mt-3 flex flex-col gap-3 px-6" noValidate onSubmit={submit}>
        <div>
          <label className="sr-only" htmlFor={`${id}-name`}>
            שם מלא
          </label>
          <input autoComplete="name" placeholder="שם מלא" type="text" {...control("name", "h-11")} />
          {error("name")}
        </div>
        <div>
          <label className="sr-only" htmlFor={`${id}-phone`}>
            נייד
          </label>
          {/* Phone inputs default to LTR in browsers; keep the Hebrew placeholder right-aligned like the other fields. */}
          <input autoComplete="tel" dir="rtl" inputMode="tel" placeholder="נייד" type="tel" {...control("phone", "h-11")} />
          {error("phone")}
        </div>
        <div>
          <label className="sr-only" htmlFor={`${id}-message`}>
            הודעה
          </label>
          <textarea placeholder="כתבו לנו כאן..." rows={3} {...control("message", "h-24 resize-y py-3")} />
          {error("message")}
        </div>

        <button
          className={`mt-1 flex h-12 w-full items-center justify-center rounded-control bg-olive text-body font-medium text-white active:bg-olive-pressed ${pressable}`}
          type="submit"
        >
          שליחת הודעה
        </button>
        <p className="text-center text-meta text-ink-muted" role="status">
          {opened
            ? "ההודעה נפתחה באפליקציית המייל שלכם — נשאר רק ללחוץ על שליחה שם."
            : "הלחיצה תפתח את אפליקציית המייל שלכם עם ההודעה מוכנה לשליחה."}
        </p>
      </form>

      <p className="mt-6 px-6 text-center text-meta text-ink-muted">
        או כתבו לנו ישירות:{" "}
        <a className="font-semibold text-accent underline-offset-4 active:underline" dir="ltr" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </main>
  )
}
