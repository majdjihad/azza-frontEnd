<script setup>
useHead({
  title: "تفاصيل الأعلان ",
});

const route = useRoute();
const cfg = useRuntimeConfig();
const apiBase = cfg.public?.API_BASE || ""; // ضع API_BASE في runtimeConfig.public عند الحاجة
const endpoint = computed(() =>
  apiBase
    ? `${apiBase}/listings/${route.params.id}`
    : `/api/listings/${route.params.id}`
);

// محاولة الجلب من الـ API
let pending = ref(true);
let loadError = ref(false);
let listing = reactive(mockListing(route.params.id));

try {
  const { data, error } = await useFetch(endpoint.value, {
    key: `listing-${route.params.id}`,
  });
  if (data.value && !error.value) {
    Object.assign(listing, data.value); // استبدال البيانات بالتي من API
  } else if (error.value) {
    loadError.value = true;
  }
} catch (e) {
  loadError.value = true;
} finally {
  pending.value = false;
}

const detailItems = computed(() => {
  const d = listing.details || {};
  return [
    { label: "المساحة", value: d.area || "-" },
    { label: "عدد الغرف", value: d.rooms || "-" },
    { label: "مفروشة", value: d.furnished || "-" },
    { label: "نوع البناء", value: d.buildType || "-" },
    { label: "الطابق", value: d.floor || "-" },
    { label: "التشطيب", value: d.finishing || "-" },
  ];
});
function humanDate(d) {
  if (!d) return "";
  try {
    const LOCALE = "ar-EG-u-nu-latn";
    const dt = new Date(d);

    const dateStr = new Intl.DateTimeFormat(LOCALE, {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(dt); // مثال: "الاثنين، 14 يوليو 2025"

    const timeRaw = new Intl.DateTimeFormat(LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dt); // مثال: "02:30 م"

    const time = timeRaw.replace(/\s([صم])$/, "$1");

    return `${dateStr} - ${time}`;
  } catch {
    return d;
  }
}

function mockListing(id) {
  return {
    id,
    title: "فلل سياحية عظيمة للبيع بسعرٍ مرضي",
    location: "غزة - فلسطين",
    publishedAt: "2025-06-30T14:30:00+02:00",
    price: 350000,
    currency: "شيكل",
    category: "عقارات",
    images: ["/media/bg-home/bg1.png", "/media/bg-home/bg2.png", "/media/bg-home/bg3.png"],
    description:
      "فرصة ذهبية للاستثمار أو السكن الراقي!فلل سياحية عظم للبيع بموقع استراتيجي مميز، تجمع بين التصميم الهندسي العصري والموقـــع الفريـــد، بأسعـــار مغريــة لا تُعوّض. تتميز الفلل بمساحات رحبة وتوزيع داخلي ذكـي يوفر أقصـــى درجــــات الراحـــة والخصوصـــية، مــــع إمكانية تخصيــص التشطيبات النهائية بالكامل بما يتناسب مع ذوقك واحتياجاتك. تقع هذه الفلل فــي منطقة هادئة وآمنة، قريبة من المنتجعات السياحية، والمرافق الحيوية مثل المدارس، المـــولات، والمراكــــز الطبية، ما يجعلها خيارًا مثاليًــا للعائلات أو حتى للمستثمريـــن الباحثين عن عائد مميز من الإيجارات السياحية.استغل الفرصة الآن، واختر وحدتك قبل ارتفاع الأسعار أو نفاد المتاح. فلل فاخرة، سعر منافس، وموقع لا يتكرر... لا تتردد، تواصل معنا الآن!استفد من عروضنا الخاصة لفترة محدودة واحصل على استشارات مجانية من خبراء العقارات.تمتع بإمكانية تقسيط ميسرة وخطط دفع مرنة تناسب جميع الميزانيات.زر موقع المشروع بنفسك لتكتشف روعة التصميم وجودة البناء عن قرب.",
    publisher: {
      name: "حسين العوضي",
      joinedAt: "2021-07-15",
      avatar: "/media/avatars/user.png",
      phone: "0592072249",
      whatsapp: "+970592072249",
      email: "husseinswalhy8@gmail.com",
    },
    details: {
      area: "250 م²",
      rooms: "6 غرف",
      furnished: "نعم",
      buildType: "أسمنت",
      floor: "الأرضي",
      finishing: "سوبر لوكس",
    },
  };
}
const ads = [
  {
    id: 1,
    category: "عقارات",
    title: "iPhone 14 Pro Max للبيع",
    description:
      "نص لعرض البيع وصيغ موجزة تشرح قرب من الخدمات بحي راقٍ، مناسب للعائلة.",
    price: "شيكل 5,000",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 6,
    views: 92,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 2,
    category: "عقارات",
    title: "سماعة بلوتوث لاسلكية أصلية",
    description:
      "نص بسيط عن المواصفات والجودة العالية مع عمر بطارية كبير جدًا وخدمة ممتازة.",
    price: "شيكل 300",
    time: "15 دقيقة",
    location: "خان يونس - فلسطين",
    comments: 4,
    views: 68,
    image: "/media/bg-home/bg4.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 3,
    category: "عقارات",
    title: "دراجة هوائية خفاش 26 بحالة ممتازة",
    description:
      "إطار ألومنيوم، سرعات متعددة، مكابح قرصية، مناسبة للطريق والجبال مع صيانة حديثة.",
    price: "شيكل 3,500",
    time: "15 دقيقة",
    location: "رفح - فلسطين",
    comments: 10,
    views: 120,
    image: "/media/bg-home/bg1.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 4,
    category: "عقارات",
    title: "فلت سياحية فخمة بسعر مغري",
    description:
      "مساحة واسعة، غرف نوم عديدة مع قرب من الخدمات العامة وموقع مميز للغاية.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 7,
    views: 140,
    image: "/media/bg-home/bg3.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 5,
    category: "عقارات",
    title: "فلت سياحية وسكنية بعرض مميز",
    description:
      "سعر منافس وموقع قريب من الخدمات بحي راقٍ مناسب للعائلة والرفاهية.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 5,
    views: 77,
    image: "/media/bg-home/bg2.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 6,
    category: "عقارات",
    title: "جهاز للاعتناء المنزلية بالأسرة",
    description:
      "منتج عملي أنيق مع ضمان وخدمة ما بعد البيع، مواصفات ممتازة ومستويات أمان عالية.",
    price: "شيكل 300",
    time: "15 دقيقة",
    location: "خان يونس - فلسطين",
    comments: 8,
    views: 91,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 7,
    category: "عقارات",
    title: "كاميرا احترافية بحالة ممتازة للبيع",
    description:
      "عدسة أساسية 50mm، تصوير بدقة عالية 4K، مثالية للهواة والمحترفين مع إكسسوارات.",
    price: "شيكل 3,500",
    time: "15 دقيقة",
    location: "رفح - فلسطين",
    comments: 9,
    views: 200,
    image: "/media/bg-home/bg9.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 8,
    category: "عقارات",
    title: "عطر فخم برائحة العود وثابت قوي",
    description:
      "ثبات عالٍ ولمسة فاخرة تناسب المناسبات، عبوة أصلية وتوصيل متاح داخل المدينة.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 2,
    views: 55,
    image: "/media/bg-home/bg2.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 9,
    category: "عقارات",
    title: "iPhone 14 Pro Max للبيع",
    description:
      "نص لعرض البيع وصيغ موجزة تشرح قرب من الخدمات بحي راقٍ، مناسب للعائلة.",
    price: "شيكل 5,000",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 6,
    views: 92,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 10,
    category: "عقارات",
    title: "سماعة بلوتوث لاسلكية أصلية",
    description:
      "نص بسيط عن المواصفات والجودة العالية مع عمر بطارية كبير جدًا وخدمة ممتازة.",
    price: "شيكل 300",
    time: "15 دقيقة",
    location: "خان يونس - فلسطين",
    comments: 4,
    views: 68,
    image: "/media/bg-home/bg4.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 11,
    category: "عقارات",
    title: "دراجة هوائية خفاش 26 بحالة ممتازة",
    description:
      "إطار ألومنيوم، سرعات متعددة، مكابح قرصية، مناسبة للطريق والجبال مع صيانة حديثة.",
    price: "شيكل 3,500",
    time: "15 دقيقة",
    location: "رفح - فلسطين",
    comments: 10,
    views: 120,
    image: "/media/bg-home/bg1.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 12,
    category: "عقارات",
    title: "فلت سياحية فخمة بسعر مغري",
    description:
      "مساحة واسعة، غرف نوم عديدة مع قرب من الخدمات العامة وموقع مميز للغاية.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 7,
    views: 140,
    image: "/media/bg-home/bg3.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 13,
    category: "عقارات",
    title: "فلت سياحية وسكنية بعرض مميز",
    description:
      "سعر منافس وموقع قريب من الخدمات بحي راقٍ مناسب للعائلة والرفاهية.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 5,
    views: 77,
    image: "/media/bg-home/bg2.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 14,
    category: "عقارات",
    title: "جهاز للاعتناء المنزلية بالأسرة",
    description:
      "منتج عملي أنيق مع ضمان وخدمة ما بعد البيع، مواصفات ممتازة ومستويات أمان عالية.",
    price: "شيكل 300",
    time: "15 دقيقة",
    location: "خان يونس - فلسطين",
    comments: 8,
    views: 91,
    image: "/media/bg-home/bg7.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 15,
    category: "عقارات",
    title: "كاميرا احترافية بحالة ممتازة للبيع",
    description:
      "عدسة أساسية 50mm، تصوير بدقة عالية 4K، مثالية للهواة والمحترفين مع إكسسوارات.",
    price: "شيكل 3,500",
    time: "15 دقيقة",
    location: "رفح - فلسطين",
    comments: 9,
    views: 200,
    image: "/media/bg-home/bg9.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
  {
    id: 16,
    category: "عقارات",
    title: "عطر فخم برائحة العود وثابت قوي",
    description:
      "ثبات عالٍ ولمسة فاخرة تناسب المناسبات، عبوة أصلية وتوصيل متاح داخل المدينة.",
    price: "شيكل ألاف 560",
    time: "15 دقيقة",
    location: "غزة - فلسطين",
    comments: 2,
    views: 55,
    image: "/media/bg-home/bg2.png",
    owner: { name: "ليث", avatar: "/media/avatars/user.png" },
  },
];
const chunkedAds = computed(() => {
  const size = 4;
  const chunks = [];
  for (let i = 0; i < ads.length; i += size)
    chunks.push(ads.slice(i, i + size));
  return chunks;
});
</script>


<template>
  <div class="container py-4 py-lg-5">
    <div class="d-flex align-items-center py-9">
      <h2 class="fs-3 m-0 fw-normal text-primary d-inline">الرئيسية</h2>
      <Icon
        name="mdi:chevron-left-circle-outline"
        class="fs-3 mx-3 text-secondary"
      />
      <h2 class="fs-3 m-0 fw-semibold text-muted">{{ listing.category }}</h2>
      <Icon
        name="mdi:chevron-left-circle-outline"
        class="fs-3 mx-3 text-secondary"
      />
      <h2 class="fs-3 m-0 fw-semibold text-muted">{{ listing.title }}</h2>
    </div>
    <div class="row g-4 flex-row-reverse">
      <main class="col-lg-9 order-1 order-lg-2">
        <div
          v-if="pending"
          class="alert alert-light border d-flex align-items-center gap-2"
        >
          <i class="bi bi-arrow-repeat"></i> جاري التحميل...
        </div>
        <div
          v-else-if="loadError"
          class="alert alert-warning d-flex align-items-center gap-2"
        >
          <i class="bi bi-exclamation-triangle"></i> تعذّر الجلب من الـ API، تم
          عرض بيانات تجريبية.
        </div>
        <div class="card shadow-sm p-9">
          <div
            class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-8"
          >
            <div>
              <h2 class="mb-1">{{ listing.title }}</h2>
              <div class="small text-muted">
                <div class="d-inline-flex align-items-center ms-5">
                  <Icon
                    class="fs-3 ms-1"
                    name="material-symbols:location-on-rounded"
                  />
                  <span class="fs-5">{{ listing.location }}</span>
                </div>
                <div class="d-inline-flex align-items-center ms-5">
                  <Icon
                    class="fs-3 ms-1"
                    name="material-symbols:alarm-on"
                  /><span class="fs-5">{{
                    humanDate(listing.publishedAt)
                  }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                class="btn btn-outline-secondary text-muted border d-flex align-items-center"
                title="مفضلة"
              >
                <Icon name="ic:baseline-favorite" class="fs-2" />
                <span class="fs-3 text-muted me-2">المفضلة</span>
              </button>
              <button
                class="btn btn-outline-secondary text-muted border d-flex align-items-center"
                title="مشاركة"
              >
                <Icon name="material-symbols:share" class="fs-3" />
                <span class="fs-3 text-muted me-2">المشاركة</span>
              </button>
            </div>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-8">
              <div class="gallery-main">
                <img
                  :src="listing.images[2] || listing.images[0]"
                  class="w-100 rounded-1"
                  alt=""
                />
              </div>
            </div>
            <div class="col-md-4 col-6">
              <div class="gallery-thumbs d-md-grid d-flex gap-3">
                <img
                  v-for="(img, i) in listing.images.slice(0, 2)"
                  :key="i"
                  :src="img"
                  class="w-100 rounded-1"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="my-4">
            <p class="mb-0 fs-4 small-note">{{ listing.description }}</p>
          </div>
          <div>
            <div class="ads-data">
              <div class="py-4">
                <h4 class="pb-1">تفاصيل إضافية</h4>
              </div>
              <div class="row g-3">
                <div
                  v-for="(item, idx) in detailItems"
                  :key="idx"
                  class="col-6 col-md-3"
                >
                  <div class="p-3 pe-0 text-end">
                    <div class="fs-4 fw-bold">{{ item.label }}</div>
                    <div class="fs-5 text-muted fw-semibold">
                      {{ item.value }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <aside class="col-lg-3 order-2 order-lg-1">
        <div class="card mb-3">
          <div class="card-body d-flex align-items-center">
            <Icon name="ic:round-local-offer" class="fs-1 text-muted ms-1" />
            <span class="fs-1 fw-bold text-primary">{{ listing.price }}</span>
            <span class="fs-9 text-primary fw-bold">{{
              listing.currency
            }}</span>
            <span class="fs-3 me-3 text-muted">(قابل للتفاوض)</span>
          </div>
        </div>
        <div class="card mb-3">
          <div class="card-body p-0">
            <h3 class="mb-3 border-bottom border-dark pb-3 pt-8 mx-4">
              بيانات الناشر
            </h3>
            <div class="mb-3 text-center" v-if="listing.publisher">
              <img
                :src="listing.publisher.avatar"
                class="rounded-circle border"
                width="100"
                height="100"
                :alt="listing.publisher.name"
              />
              <div>
                <h3 class="fw-bold mt-3">{{ listing.publisher.name }}</h3>
                <div class="small text-muted fs-4">
                  تاريخ الانضمام: {{ listing.publisher.joinedAt }}
                </div>
              </div>
            </div>

            <NuxtLink
              to="#"
              class="d-block text-primary fw-bold my-3 text-decoration-underline text-center fs-3 mb-2"
            >
              عرض جميع إعلاناته
            </NuxtLink>

            <div class="user-data gap-2 my-3 pb-3 px-3">
              <NuxtLink
                :to="`tel:${listing.publisher?.phone}`"
                class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
                v-if="listing.publisher?.phone"
              >
                <span class="p-6 bg-primary rounded">
                  <Icon
                    name="material-symbols:phone-in-talk-watchface-indicator"
                    class="text-white fs-1"
                  />
                </span>
                <div class="d-flex flex-column rounded">
                  <span class="text-muted text-end">تواصل عبر الجوال</span>
                  <span class="fw-semibold text-end fw-bold">{{
                    listing.publisher.phone
                  }}</span>
                </div>
              </NuxtLink>
              <NuxtLink
                :to="`https://wa.me/${listing.publisher?.whatsapp}`"
                class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
                v-if="listing.publisher?.whatsapp"
              >
                <span class="p-6 rounded" style="background-color: #4fad52">
                  <Icon name="bx:bxl-whatsapp" class="text-white fs-1" />
                </span>
                <div class="d-flex flex-column rounded">
                  <span class="text-muted text-end">تواصل عبر الواتساب</span>
                  <span class="fw-semibold text-end fw-bold">{{
                    listing.publisher.whatsapp
                  }}</span>
                </div>
              </NuxtLink>
              <NuxtLink
                :to="`mailto:${listing.publisher?.email}`"
                class="d-flex w-md-100 w-50 mx-auto align-items-center btn p-0 mb-4"
                v-if="listing.publisher?.email"
              >
                <span class="p-6 rounded" style="background-color: #a5acb9">
                  <Icon
                    name="material-symbols:stacked-email-rounded"
                    class="text-white fs-1"
                  />
                </span>
                <div class="d-flex flex-column rounded">
                  <span class="text-muted text-end"
                    >تواصل عبر البريد الالكتروني</span
                  >
                  <span class="fw-semibold text-end fw-bold">{{
                    listing.publisher.email
                  }}</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h4 class="mb-3">إرشادات مهمة للمستخدمين</h4>
            <ul class="list-unstyled small-note p-0 m-0">
              <li class="row gap-0">
                <Icon
                  name="material-symbols:check-circle"
                  class="fs-2 text-primary col-md-2 col-1"
                />
                <p class="fs-6 p-0 col-10 text-muted">
                  قابل البائع أو المشتـــري في مكان عام وآمــن مثــل المولات
                  محطات الوقود، أو بالقرب من المترو.
                </p>
              </li>
              <li class="row gap-0">
                <Icon
                  name="material-symbols:check-circle"
                  class="fs-2 text-primary col-md-2 col-1"
                />
                <p class="fs-6 p-0 col-10 text-muted">
                  يُفضل أن تصطحب معك شخصًا آخـر عنـد إتمــام أي لقــاء.
                </p>
              </li>
              <li class="row gap-0">
                <Icon
                  name="material-symbols:check-circle"
                  class="fs-2 text-primary col-md-2 col-1"
                />
                <p class="fs-6 p-0 col-10 text-muted">
                  تحقّق من المنتج بعناية قبــل الشــراء، وتأكــد من أنه يطابــق
                  المواصفات المتفق عليها والسعر المعروض.
                </p>
              </li>
              <li class="row gap-0">
                <Icon
                  name="material-symbols:check-circle"
                  class="fs-2 text-primary col-md-2 col-1"
                />
                <p class="fs-6 p-0 col-10 text-muted">
                  لا ترسل أو تدفع أي مبلغ مالي قبل معاينة المنتــج والتأكــد منه
                  بشكل كامل.
                </p>
              </li>
              <li class="row gap-0">
                <Icon
                  name="material-symbols:check-circle"
                  class="fs-2 text-primary col-md-2 col-1"
                />
                <p class="fs-6 p-0 col-10 text-muted">
                  تأكد أيضًا مـن أن المنتج غيــر مســــروق أو مخالــف
                  للقوانيـــن المحلية.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
    <section class="container container-ads pt-4 mb-9 py-md-5">
      <!-- Header + Toolbar -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-4">
          <div>
            <p class="fs-3 text-muted">قد يعجبك أيضا</p>
            <h2 class="fs-1 section-title mb-0">إعلانات ذات صلة</h2>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 offers-toolbar">
          <!-- Prev -->
          <button
            class="btn-carousel"
            data-bs-target="#adsCarousel"
            data-bs-slide="prev"
            aria-label="السابق"
          >
            <Icon name="line-md:arrow-right" size="20" />
          </button>

          <!-- Next -->
          <button
            class="btn-carousel"
            data-bs-target="#adsCarousel"
            data-bs-slide="next"
            aria-label="التالي"
          >
            <Icon name="line-md:arrow-left" size="20" />
          </button>
          <NuxtLink to="/ads" class="btn-view-all">
            <h5 class="mb-0 text-white">عرض الكل</h5>
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="text-white"
              size="20"
            />
          </NuxtLink>
        </div>
      </div>
      <!-- Bootstrap Carousel -->
      <div id="adsCarousel" class="carousel slide" data-bs-interval="false">
        <div class="carousel-inner">
          <div
            v-for="(group, idx) in chunkedAds"
            :key="'slide-' + idx"
            class="carousel-item"
            :class="{ active: idx === 0 }"
          >
            <div class="row g-4">
              <div
                v-for="ad in group"
                :key="ad.id"
                class="col-12 col-md-6 col-xl-3"
              >
                <AdsCard :ad="ad" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.btn-soft {
  background-color: #f8f9fb;
  border-color: #eef0f3;
}

.gallery-thumbs img {
  height: 154px;
  object-fit: cover;
}
.gallery-main img {
  height: 322px;
  object-fit: cover;
}
.contact-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-data div {
  border: black 1px dashed !important;
  border-right: none !important;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  padding: 7px 10px 7px;
  width: 100%;
}
.small-note {
  line-height: 1.7;
}
.ads-data h4 {
  position: relative;
}
.ads-data h4::before {
  content: "";
  width: 80px;
  height: 2px;
  background-color: #071437;
  position: absolute;
  bottom: 0;
  right: 0;
}
.list-dotted li {
  padding-inline-start: 0.5rem;
  position: relative;
}
.list-dotted li::before {
  content: "•";
  position: absolute;
  inset-inline-start: -12px;
  color: #adb5bd;
}
.offers-toolbar .btn-carousel {
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  background: #e7f1f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eef0f4;
  transition: 0.2s ease;
  color: var(--bs-primary);
}
.offers-toolbar .btn-carousel:hover {
  box-shadow: var(--shadow);
  background: var(--bs-primary);
  color: white;
}

/* تحسينات للموبايل */
@media (max-width: 575.98px) {
  .gallery-main img {
    height: 220px;
  }
}
</style>
