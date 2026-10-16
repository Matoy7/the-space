import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { CONTACT_EMAIL, isIsraeliMobile } from "./ContactPage"
import { expertiseTags, type ExpertiseTag } from "./data"
import { ImagePlusIcon } from "./icons"
import { pressable } from "./ui"

const photo = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

type Fields = { name: string; phone: string; email: string; displayName: string; about: string; links: string }
type Errors = Partial<Record<keyof Fields | "photo", string>>

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/** One public link: a website / profile URL (scheme optional), an @handle, or an Israeli mobile for WhatsApp. */
function isLink(token: string): boolean {
  if (/^@[\w.]{2,30}$/.test(token) || isIsraeliMobile(token)) return true
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(token) ? token : `https://${token}`)
    return (url.protocol === "https:" || url.protocol === "http:") && /\.[a-z]{2,}$/i.test(url.hostname)
  } catch {
    return false
  }
}
const splitLinks = (v: string) => v.split(/[\s,]+/).filter(Boolean)

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = "נא למלא שם מלא"
  if (!f.phone.trim()) e.phone = "נא למלא מספר נייד"
  else if (!isIsraeliMobile(f.phone)) e.phone = "מספר הנייד לא תקין"
  if (!f.email.trim()) e.email = "נא למלא כתובת אימייל"
  else if (!isEmail(f.email)) e.email = "כתובת האימייל לא תקינה"
  if (splitLinks(f.links).some((t) => !isLink(t))) e.links = "נא להזין קישורים תקינים (אתר, ‎@אינסטגרם או מספר וואטסאפ)"
  return e
}

/** The request as an email draft to the site — the site has no backend; this is how its contact form sends too. */
function mailtoUrl(f: Fields, tags: ExpertiseTag[], photoName: string | null): string {
  const lines = [
    "בקשת הצטרפות למרחב",
    "",
    `שם מלא: ${f.name.trim()}`,
    `טלפון נייד: ${f.phone.trim()}`,
    `אימייל: ${f.email.trim()}`,
    `שם לתצוגה: ${f.displayName.trim() || "—"}`,
    `תחומי התמחות: ${tags.join(", ") || "—"}`,
    `קצת עליי: ${f.about.trim() || "—"}`,
    `קישורים: ${splitLinks(f.links).join(" ") || "—"}`,
    `תמונת פרופיל: ${photoName ? `${photoName} (מצורפת למייל)` : "—"}`,
  ]
  const subject = `בקשת הצטרפות למרחב – ${f.name.trim()}`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`
}

function Step({
  number,
  title,
  subtitle,
  image,
  children,
}: {
  number: number
  title: string
  subtitle?: string
  /** Decorative side photo and the part of it to keep in the narrow column (CSS object-position). */
  image?: { src: string; focus: string }
  children: ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="flex overflow-hidden rounded-feature border border-line/60 bg-surface shadow-card"
    >
      <div className="min-w-0 flex-1 p-4">
        <header className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-olive-soft text-title font-bold text-olive-ink"
          >
            {number}
          </span>
          <div className="min-w-0">
            <h2 className="text-title font-bold text-ink" id={id}>
              <span className="sr-only">שלב {number}: </span>
              {title}
            </h2>
            {subtitle && <p className="text-meta text-ink-muted">{subtitle}</p>}
          </div>
        </header>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
      </div>
      {/* RTL: the decorative photo is the second flex item, so it sits on the left as in the reference. Shown from
          420px, where the form column stays wide enough for the step titles to sit on one line. */}
      {image && (
        <img
          alt=""
          className="hidden w-[30%] shrink-0 object-cover min-[420px]:block"
          src={image.src}
          style={{ objectPosition: image.focus }}
        />
      )}
    </section>
  )
}

/* "Join HaMerchav" ("#/join"): a request from an independent instructor to be listed in the directory. */
export default function JoinPage() {
  const id = useId()
  const [fields, setFields] = useState<Fields>({ name: "", phone: "", email: "", displayName: "", about: "", links: "" })
  const [tags, setTags] = useState<ExpertiseTag[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [opened, setOpened] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previous = document.title
    document.title = "מצטרפים למרחב · המרחב"
    return () => {
      document.title = previous
    }
  }, [])

  // Release the preview's object URL when it changes or the page closes.
  useEffect(() => () => void (photoUrl && URL.revokeObjectURL(photoUrl)), [photoUrl])

  const update = (key: keyof Fields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const toggleTag = (t: ExpertiseTag) =>
    setTags((current) => (current.includes(t) ? current.filter((x) => x !== t) : expertiseTags.filter((x) => x === t || current.includes(x))))

  const choosePhoto = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, photo: "נא לבחור קובץ תמונה" }))
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((er) => ({ ...er, photo: "התמונה גדולה מדי (עד 5MB)" }))
      return
    }
    setErrors((er) => ({ ...er, photo: undefined }))
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoUrl(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(fields)
    setErrors((er) => ({ ...found, photo: er.photo }))
    const first = (["name", "phone", "email", "links"] as const).find((k) => found[k])
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }
    window.open(mailtoUrl(fields, tags, photoFile?.name ?? null), "_self")
    setOpened(true)
  }

  const control = (key: keyof Fields, extra = "h-12") => ({
    id: `${id}-${key}`,
    value: fields[key],
    onChange: update(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
    className: `block w-full min-w-0 rounded-xl border bg-canvas/60 px-4 text-body text-ink placeholder:text-ink-muted/80 ${
      errors[key] ? "border-accent" : "border-line"
    } ${extra}`,
  })

  const label = (key: keyof Fields, text: string, required = false) => (
    <label className="mb-2 block text-meta font-semibold text-ink" htmlFor={`${id}-${key}`}>
      {text}
      {required && (
        <span aria-hidden="true" className="text-accent">
          {" "}
          *
        </span>
      )}
    </label>
  )

  const error = (key: keyof Errors) =>
    errors[key] && (
      <p className="mt-1 text-meta text-accent" id={`${id}-${key}-error`}>
        {errors[key]}
      </p>
    )

  return (
    <main className="pt-2 pb-12">
      <section className="relative mx-4 h-44 overflow-hidden rounded-feature bg-sand shadow-card">
        <img alt="" className="absolute inset-0 size-full object-cover" src={photo("retreat-galilee.jpg")} />
        {/* RTL: the text sits on the right, so the shade runs from the right edge. */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/65 via-black/30 to-transparent" />
        <div className="relative flex h-full max-w-[68%] flex-col justify-center px-5 text-white">
          <h1 className="text-display font-bold">מצטרפים למרחב</h1>
          <p className="mt-1 text-body text-white/90">
            הציגו את העשייה שלכם והגיעו לאנשים שמחפשים את החוויה שאתם מציעים.
          </p>
        </div>
      </section>

      <form className="mx-4 mt-4 flex flex-col gap-4" noValidate onSubmit={submit}>
        <Step number={1} subtitle="פרטי הקשר הבסיסיים שלכם" title="נעים להכיר">
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-3 min-[420px]:gap-3">
            <div className="min-w-0">
              {label("name", "שם מלא", true)}
              <input autoComplete="name" placeholder="איך קוראים לך?" required type="text" {...control("name")} />
              {error("name")}
            </div>
            <div className="min-w-0">
              {label("phone", "טלפון נייד", true)}
              {/* Phone inputs default to LTR; keep the field right-aligned like the others. */}
              <input autoComplete="tel" dir="rtl" inputMode="tel" placeholder="050-0000000" required type="tel" {...control("phone")} />
              {error("phone")}
            </div>
            <div className="min-w-0">
              {label("email", "כתובת אימייל", true)}
              <input autoComplete="email" dir="rtl" inputMode="email" placeholder="האימייל שלך" required type="email" {...control("email")} />
              {error("email")}
            </div>
          </div>
        </Step>

        <Step image={{ src: photo("about-mat.jpg"), focus: "22% 50%" }} number={2} subtitle="המידע שיוצג באינדקס המדריכים" title="הפרופיל המקצועי שלכם">
          <div>
            {label("displayName", "איך להציג אתכם?")}
            <input autoComplete="organization" placeholder="שם מקצועי או שם העסק" type="text" {...control("displayName")} />
          </div>

          <div>
            <p className="mb-2 text-meta font-semibold text-ink" id={`${id}-tags`}>
              תחומי התמחות
            </p>
            <div aria-labelledby={`${id}-tags`} className="flex flex-wrap gap-2" role="group">
              {expertiseTags.map((t) => {
                const on = tags.includes(t)
                return (
                  <button
                    aria-pressed={on}
                    className={`flex h-10 items-center rounded-control border px-4 text-meta font-medium whitespace-nowrap transition-colors ${
                      on ? "border-olive bg-olive text-white" : "border-line bg-canvas text-ink active:bg-sand"
                    }`}
                    key={t}
                    onClick={() => toggleTag(t)}
                    type="button"
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {label("about", "קצת עליכם")}
            <textarea
              maxLength={600}
              placeholder="ספרו על הניסיון, הגישה והפעילויות שלכם..."
              rows={3}
              {...control("about", "h-24 resize-y py-3")}
            />
          </div>

          <div>
            <p className="mb-2 text-meta font-semibold text-ink" id={`${id}-photo-label`}>
              תמונת פרופיל
            </p>
            <input
              accept="image/*"
              aria-describedby={errors.photo ? `${id}-photo-error` : undefined}
              aria-labelledby={`${id}-photo-label`}
              className="sr-only"
              id={`${id}-photo`}
              onChange={(e) => choosePhoto(e.target.files?.[0])}
              ref={fileRef}
              type="file"
            />
            {photoUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                <img alt="תצוגה מקדימה של תמונת הפרופיל" className="size-16 shrink-0 rounded-full object-cover" src={photoUrl} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-meta text-ink" dir="auto">
                    {photoFile?.name}
                  </span>
                  <div className="flex gap-4">
                    <label className="cursor-pointer text-meta font-semibold text-accent" htmlFor={`${id}-photo`}>
                      החלפה
                    </label>
                    <button className="text-meta font-semibold text-ink-muted" onClick={removePhoto} type="button">
                      הסרה
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-canvas/40 px-4 py-6 text-center active:bg-sand"
                htmlFor={`${id}-photo`}
              >
                <ImagePlusIcon className="text-olive" size={32} />
                <span className="mt-1 text-meta font-semibold text-olive-ink">העלאת תמונה</span>
                <span className="text-meta text-ink-muted">מומלץ לבחור תמונה ברורה שלכם</span>
              </label>
            )}
            {error("photo")}
          </div>
        </Step>

        <Step image={{ src: photo("contact-hero.jpg"), focus: "35% 50%" }} number={3} subtitle="פרטים שיעזרו לאנשים להכיר אתכם וליצור איתכם קשר" title="איך אפשר למצוא אתכם?">
          <div>
            {label("links", "קישורים")}
            <input dir="rtl" placeholder="אתר, אינסטגרם או וואטסאפ" type="text" {...control("links")} />
            {error("links")}
          </div>
          <button
            className={`flex h-12 w-full items-center justify-center rounded-control bg-olive text-body font-semibold text-white active:bg-olive-pressed ${pressable}`}
            type="submit"
          >
            שליחת בקשת הצטרפות
          </button>
          <p className="text-meta text-ink-muted" role="status">
            {opened
              ? `הבקשה נפתחה באפליקציית המייל שלכם — נשאר רק ללחוץ על שליחה שם.${photoFile ? " צרפו למייל את תמונת הפרופיל שבחרתם." : ""}`
              : "הלחיצה תפתח את אפליקציית המייל שלכם עם הבקשה מוכנה לשליחה."}
          </p>
        </Step>
      </form>
    </main>
  )
}
