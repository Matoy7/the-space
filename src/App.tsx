const assetPathPrefix = `${import.meta.env.BASE_URL}assets`
const imgImage1 = `${assetPathPrefix}/77585.png`
const img = `${assetPathPrefix}/2af54.png`
const img1 = `${assetPathPrefix}/089e8.png`
const img2 = `${assetPathPrefix}/71e6d.png`
const img3 = `${assetPathPrefix}/19244.png`
const img4 = `${assetPathPrefix}/80ed4.png`
const img5 = `${assetPathPrefix}/6d380.png`
const imgBackgroundShadow = `${assetPathPrefix}/f1bd4.png`
const img6 = `${assetPathPrefix}/45898.png`
const img7 = `${assetPathPrefix}/2a252.png`
const img8 = `${assetPathPrefix}/bcf2e.png`
const img9 = `${assetPathPrefix}/54a2d.png`
const imgSvg = `${assetPathPrefix}/0b1a6.svg`
const imgSvg1 = `${assetPathPrefix}/e5005.svg`
const imgSvg2 = `${assetPathPrefix}/f0f9e.svg`
const imgSvg3 = `${assetPathPrefix}/19723.svg`
const imgSvg4 = `${assetPathPrefix}/d441d.svg`
const imgSvg5 = `${assetPathPrefix}/122c4.svg`
const imgSvg6 = `${assetPathPrefix}/2cfd2.svg`
const imgSvg7 = `${assetPathPrefix}/46c7a.svg`
const imgSvg8 = `${assetPathPrefix}/e2081.svg`
const imgSvg9 = `${assetPathPrefix}/67871.svg`
const imgSvg10 = `${assetPathPrefix}/2f15d.svg`
const imgSvg11 = `${assetPathPrefix}/fa840.svg`
const imgSvg12 = `${assetPathPrefix}/7fa7c.svg`

const categories = [
  { name: "וולנס", image: img, left: -82 },
  { name: "קהילה", image: img1, left: -8 },
  { name: "ריטריטים", image: img2, left: 66 },
  { name: "סדנאות", image: img3, left: 140 },
  { name: "מדיטציה", image: img4, left: 214 },
  { name: "יוגה", image: img5, left: 288, active: true },
]

const eventCards = [
  {
    title: "ריטריט יוגה בגליל",
    location: "גליל עליון",
    date: "16-16 בנובמבר",
    image: img6,
    left: -182,
  },
  {
    title: "ויפאסנה במדבר",
    location: "מדבר יהודה",
    date: "2-4 בנובמבר",
    image: img7,
    left: 4,
  },
  {
    title: "מדיטציית צלילים",
    location: "מרכז אננדה, תל אביב",
    date: "19 באפריל • 19:30",
    image: img8,
    left: 190,
  },
]

function Icon({ src, size }: { src: string; size: number }) {
  return (
    <img
      alt=""
      className="block shrink-0"
      height={size}
      src={src}
      width={size}
    />
  )
}

function CategoryStrip() {
  return (
    <nav
      aria-label="קטגוריות"
      dir="rtl"
      className="relative h-[90px] w-[346px] shrink-0 overflow-x-auto"
    >
      {categories.map((category) => (
        <button
          aria-current={category.active ? "page" : undefined}
          className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center border-0 bg-transparent p-0"
          key={category.name}
          style={{ left: category.left }}
          type="button"
        >
          <span
            className={`flex size-[58px] items-center justify-center overflow-hidden rounded-full p-[2px] ${
              category.active ? "shadow-[0_0_0_1px_rgba(140,68,45,0.4)]" : ""
            }`}
          >
            <span className="size-full overflow-hidden rounded-full">
              <img
                alt=""
                className="h-full w-full object-cover"
                src={category.image}
                style={{ transform: "scale(1.8351)" }}
              />
            </span>
          </span>
          <span
            className={`relative mt-[6px] pb-[2px] text-center text-[12px] leading-[16px] text-[#221e1b] ${
              category.active
                ? "font-['Assistant:Bold'] font-bold after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-[16px] after:-translate-x-1/2 after:rounded-full after:bg-[#221e1b]"
                : "font-['Assistant:Regular'] font-medium opacity-85"
            }`}
          >
            {category.name}
          </span>
        </button>
      ))}
    </nav>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <header className="flex h-[28px] w-full items-center justify-between">
      <button
        className="mt-[5px] flex items-center gap-[2px] border-0 bg-transparent p-0 font-['Assistant:Regular'] text-[12px] font-medium leading-[16px] text-[#766f66]"
        type="button"
      >
        <Icon size={14} src={imgSvg7} />
        הצג הכל
      </button>
      <h2 className="font-['Assistant:Bold'] text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#221e1b]">
        {title}
      </h2>
    </header>
  )
}

function EventCard({
  date,
  image,
  left,
  location,
  title,
}: typeof eventCards[number]) {
  return (
    <article
      className="absolute bottom-[4px] top-0 flex w-[172px] flex-col overflow-hidden rounded-[16px] bg-[#ede7df] shadow-[0_4px_20px_-2px_rgba(45,38,30,0.07)]"
      dir="rtl"
      style={{ left }}
    >
      <div className="relative h-[115px] shrink-0 overflow-hidden">
        <img alt="" className="h-full w-full object-cover" src={image} />
        <button
          aria-label="הוסף למועדפים"
          className="absolute left-[10px] top-[10px] flex size-[28px] items-center justify-center rounded-full border-0 bg-black/20 p-0 backdrop-blur-[2px]"
          type="button"
        >
          <Icon size={16} src={imgSvg8} />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between p-[12px] text-right">
        <div>
          <h3 className="font-['Assistant:Bold'] text-[13px] font-bold leading-[17.88px] text-[#221e1b]">
            {title}
          </h3>
          <p className="font-['Assistant:Regular'] text-[11px] font-normal leading-[16.5px] text-[#766f66]">
            {location}
          </p>
        </div>
        <div className="flex items-center justify-end gap-[6px] border-t border-[#dfd6ca] pt-[9px] font-['Assistant:Regular'] text-[10px] font-medium leading-[15px] text-[rgba(34,30,27,0.8)]">
          <span>{date}</span>
          <Icon size={14} src={imgSvg9} />
        </div>
      </div>
    </article>
  )
}

function App() {
  return (
    <main className="flex size-full flex-col overflow-hidden border-[6px] border-solid border-[#202020] bg-[#f4efeb] p-[6px] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_25px_50px_-12px_rgba(0,0,0,0.25)]">
      <header className="z-[2] flex w-full shrink-0 items-center justify-between px-[20px] pb-[8px] pt-[12px]">
        <button
          className="flex items-center gap-[6px] rounded-full border-0 bg-[rgba(234,226,215,0.9)] px-[14px] py-[6px]"
          type="button"
        >
          <Icon size={14} src={imgSvg} />
          <span className="pt-[2px] font-['Assistant:SemiBold'] text-[12px] font-semibold leading-[16px] text-[#221e1b]">
            תל אביב
          </span>
          <Icon size={14} src={imgSvg1} />
        </button>
        <img
          alt="המרחב"
          className="h-[41px] w-[124px] object-cover"
          src={imgImage1}
        />
        <button
          aria-label="פתח תפריט"
          className="flex size-[40px] items-center justify-center rounded-full border-0 bg-[rgba(234,226,215,0.8)] p-0"
          type="button"
        >
          <Icon size={20} src={imgSvg2} />
        </button>
      </header>

      <div className="z-[1] min-h-0 w-full flex-1">
        <div className="flex size-full flex-col items-center gap-[20px] overflow-y-auto pb-[15.99px] pt-[8px]">
          <CategoryStrip />

          <section className="flex w-full shrink-0 flex-col gap-[10px] px-[16px]">
            <article className="relative flex min-h-[260px] w-full flex-col gap-[23px] overflow-hidden rounded-[28px] bg-[#292524] p-[20px] shadow-[0_4px_20px_-2px_rgba(45,38,30,0.07)]">
              <img
                alt=""
                className="pointer-events-none absolute left-[-18.95%] top-0 h-full w-[137.9%] max-w-none"
                src={imgBackgroundShadow}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.85)] via-[rgba(0,0,0,0.35)] to-[rgba(0,0,0,0.2)]" />
              <button
                aria-label="שמור למועדפים"
                className="absolute left-[20px] top-[20px] z-[1] flex size-[36px] items-center justify-center rounded-full border-0 bg-black/25 p-0 backdrop-blur-[6px]"
                type="button"
              >
                <Icon size={20} src={imgSvg3} />
              </button>
              <div
                className="relative mt-auto flex w-full flex-col items-end gap-[4px] text-right"
                dir="rtl"
              >
                <h1 className="font-['Assistant:Bold'] text-[24px] font-bold leading-[33px] tracking-[-0.6px] text-white">
                  יוגה מול הים
                </h1>
                <p className="font-['Assistant:Light'] text-[12px] font-light leading-[16px] text-white/90">
                  ריטריט סופשבוע בחוף גורדון, תל אביב
                </p>
                <div className="flex w-full flex-row-reverse items-center justify-between pt-[12px]">
                  <button
                    className="flex items-center gap-[4px] rounded-full border-0 bg-[#8c442d] px-[14px] py-[6px] font-['Assistant:SemiBold'] text-[12px] font-semibold leading-[16px] text-white"
                    type="button"
                  >
                    <Icon size={14} src={imgSvg4} />
                    לפרטים
                  </button>
                  <div className="flex flex-row-reverse items-center gap-[12px] font-['Assistant:Regular'] text-[11px] font-normal leading-[16.5px] text-white/95">
                    <span className="flex flex-row-reverse items-center gap-[6px]">
                      חוף גורדון, תל אביב
                      <Icon size={14} src={imgSvg5} />
                    </span>
                    <span className="flex flex-row-reverse items-center gap-[6px]">
                      17-17 באפריל
                      <Icon size={14} src={imgSvg6} />
                    </span>
                  </div>
                </div>
              </div>
            </article>
            <div className="flex w-full items-center justify-center gap-[6px]">
              <span className="h-[4px] w-[14px] rounded-full bg-[#e5dcd0]" />
              <span className="h-[4px] w-[14px] rounded-full bg-[#d8cec0]" />
              <span className="h-[4px] w-[24px] rounded-full bg-[#8c442d]" />
            </div>
          </section>

          <section className="flex w-full shrink-0 flex-col gap-[12px]">
            <div className="px-[20px]">
              <SectionHeader title="אירועים קרובים" />
            </div>
            <div className="relative h-[215.38px] w-full overflow-x-auto" dir="rtl">
              {eventCards.map((card) => (
                <EventCard {...card} key={card.title} />
              ))}
            </div>
          </section>

          <section className="flex w-full shrink-0 flex-col gap-[12px] px-[16px] pb-[16px]">
            <SectionHeader title="ריטריטים נבחרים" />
            <article
              className="flex min-h-[145px] w-full overflow-hidden rounded-[24px] bg-[#ece4d8] shadow-[0_4px_20px_-2px_rgba(45,38,30,0.07)]"
              dir="ltr"
            >
              <div className="min-w-0 flex-1">
                <img alt="" className="size-full object-cover" src={img9} />
              </div>
              <div
                className="flex min-w-0 flex-1 flex-col justify-between px-[14px] pb-[14.01px] pt-[14px] text-right"
                dir="rtl"
              >
                <div>
                  <h3 className="font-['Assistant:Bold'] text-[16px] font-bold leading-[20px] text-[#221e1b]">
                    חיבור לטבע
                  </h3>
                  <p className="mt-[3px] font-['Assistant:Regular'] text-[11px] font-normal leading-[15.13px] text-[#766f66]">
                    ריטריט יוגה וסדנאות בטבע
                  </p>
                  <div className="mt-[6.99px] flex flex-col gap-[4px] font-['Assistant:Regular'] text-[10px] font-normal leading-[15px] text-[rgba(34,30,27,0.8)]">
                    <span className="flex items-center gap-[6px]">
                      <Icon size={12} src={imgSvg10} />
                      גליל עליון
                    </span>
                    <span className="flex items-center gap-[6px]">
                      <Icon size={12} src={imgSvg11} />
                      25-23 במאי
                    </span>
                  </div>
                </div>
                <button
                  className="flex w-fit items-center gap-[4px] rounded-full border-0 bg-[#8c442d] px-[14px] py-[6px] font-['Assistant:SemiBold'] text-[12px] font-semibold leading-[16px] text-white"
                  type="button"
                >
                  <Icon size={12} src={imgSvg12} />
                  לפרטים
                </button>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
