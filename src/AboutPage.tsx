import { useEffect } from "react"

const photo = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`

/* Layout follows the approved reference: centred title + subtitle, a two-column collage (one tall photo on the
   left, two stacked on the right, 4px gaps, subtle 8px corners) and a centred paragraph. */
export default function AboutPage() {
  useEffect(() => {
    const previous = document.title
    document.title = "אודות המרחב · המרחב"
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <main className="px-4 pt-6 pb-12 text-center">
      <h1 className="text-page-title font-bold text-ink">אודות המרחב</h1>
      <p className="text-body text-ink/80">מקום אחד לכל מה שטוב לגוף, לנפש ולחיים מאוזנים יותר.</p>

      {/* dir="ltr": the large photo sits on the left, as in the reference (an RTL grid would mirror it). */}
      <div className="mt-3 grid aspect-[441/257] grid-cols-[222fr_214fr] grid-rows-2 gap-1" dir="ltr">
        <img
          alt="אישה יושבת מול הים בשקיעה"
          className="row-span-2 size-full rounded-lg object-cover"
          src={photo("about-nature.jpg")}
        />
        <img alt="מזרן יוגה מגולגל" className="size-full rounded-lg object-cover" src={photo("about-mat.jpg")} />
        <img alt="ענף זית באור השקיעה" className="size-full rounded-lg object-cover" src={photo("about-olive.jpg")} />
      </div>

      <p className="mt-3 text-meta leading-[1.7] text-ink">
        המרחב הוא בית דיגיטלי לאנשים שמחפשים השראה, תרגול וחיבור דרך סדנאות, שיעורים, ריטריטים ואירועי וולנס בישראל.
        אנחנו מאמינים בכוח של חוויות משמעותיות ליצור שינוי אמיתי, ולכן ריכזנו עבורכם מגוון פעילויות במקום אחד – כך
        שיהיה קל ונעים למצוא את מה שמתאים לכם.
      </p>
    </main>
  )
}
