<script setup>
const config = useRuntimeConfig();

useHead({
  title: "سياسة الخصوصية - منصة AZZA",
});
useSeo({
  title: "سياسة الخصوصية | منصّة  AZZA",
  description:
    "اطلع على سياسة الخصوصية الخاصة بمنصّتنا لمعرفة كيفية جمع واستخدام وحماية بياناتك الشخصية عند إضافة الإعلانات أو تصفحها.",
  image: "/media/avatars/logo.png",
  canonicalPath: "/privacy-policy",
  type: "article",
  publishedAt: "2025-09-01",
  modifiedAt: "2025-09-01",
});
</script>
<template>
  <div class="container">
    <div class="p-md-5 mt-7">
      <div>
        <div class="d-flex align-items-center">
          <NuxtLink to="/" class="fs-5 m-0 fw-medium text-primary d-inline"
            >الرئيسية</NuxtLink
          >
          <Icon
            name="mdi:chevron-left-circle-outline"
            class="fs-3 mx-3 text-secondary"
          />
          <span class="fs-5 m-0 text-secondary fw-medium">سياسة الخصوصية</span>
        </div>
      </div>
    </div>
    <section class="privacy-policy py-5">
      <div class="container">
        <div class="p-9">
          <div class="p-4 p-md-5">
            <h3 class="fw-bold text-primary text-center mb-4 fs-2">
              سياسة الخصوصية – منصة AZZA
            </h3>

            <p class="mb-4 fs-5">
              <span class="fw-bold">الخصوصية وبيان سريّة المعلومات </span>
              <span class="intro-line fw-medium fs-6">
                : في منصة AZZA نُولي أهمية لحماية خصوصيتكم وسرية بياناتكم. نهدف
                من خلال هذه السياسة إلـى توضيــح كيفيــة جمــع واستخدام
                وحمايـــة المعلومات التي تقدمونها عند استخدام منصتنا.
              </span>
            </p>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">أولاً: جمع المعلومات</h5>
              <p class="mb-3 fs-6 text-muted">
                عند استخدامكم منصة AZZA، قد نقوم بجمع بيانات تقومون بتقديمها عند
                إنشاء حساباتكم، أو طلب تنفيذ خدمة، أو إرسال رسالة عبر نموذج
                تواصل. لا يتم جمع معلوماتكم إلا بمواضعها فقط عندما تختارون
                تزويدنا بها بشكل مباشر وواضح. ولا يتم تسجيل أو حفظ البيانات
                الحساسة دون إذنكم، مع حرصنا التام على أمنها وسريتها وسهولة
                الوصول إليها وتحديثها.
              </p>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">
                ثانياً: بيانات التصفح وعنوان IP
              </h5>
              <p class="mb-2 text-muted">
                كما هو معتاد في معظم المواقع، يقوم خادم المنصة تلقائيًا بتسجيل
                بعض البيانات لتحليل الأداء وتحسين تجربتكم على المنصة مثل:
              </p>
              <ul class="mb-3 fs-6 text-muted">
                <li class="my-1">عنوان بروتوكول الإنترنت (IP).</li>
                <li class="my-1">تاريخ ووقت الزيارة.</li>
                <li class="my-1">نوع المتصفح ونظام التشغيل.</li>
                <li class="my-1">الصفحات التي تم الوصول إليها.</li>
                <li class="my-1">الموقع الجغرافي التقريبي (إن وُجد).</li>
              </ul>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">ثالثاً: الروابط الخارجية</h5>
              <p class="mb-3 fs-6 text-muted">
                قد تحتوي منصتنا على روابط لمواقع خارجية. لسنا مسؤولين عن سياسات
                الخصوصية أو محتوى تلك المواقع؛ لذا ندعـوكم لمراجعة سياسات
                الخصوصية الخاصة بها قبل تقديم أي معلومات.
              </p>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">رابعاً: سرية المعلومات</h5>
              <p class="mb-2 text-muted">
                نلتزم بالحفاظ على سرية وحماية البيانات الشخصية التي نجمعها، ولن
                يتم الكشف عن أي من معلوماتكم إلا في حال:
              </p>
              <ul class="mb-3 fs-6 text-muted">
                <li>بناءً على طلبكم المباشر أو بموافقتكم الصريحة.</li>
                <li>امتثالًا للأنظمة والقوانين المعمول بها.</li>
                <li>عند طلب الجهات الرسمية المختصة.</li>
              </ul>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">خامساً: استخدام البيانات</h5>
              <p class="mb-2 text-muted">قد نستخدم بياناتكم للأغراض التالية:</p>
              <ul class="mb-3 fs-6 text-muted">
                <li>تقديم وتحسين مستوى الخدمات في المنصة.</li>
                <li>إدارة حساباتكم وتسهيل إجراءات الدعم الفني.</li>
                <li>التواصل معكم بخصوص حساباتكم أو التحديثات المهمة.</li>
                <li>تحسين تجربة المستخدم والواجهة والأداء.</li>
                <li>الامتثال للالتزامات القانونية والتنظيمية.</li>
              </ul>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">سادساً: الأمان</h5>
              <p class="mb-3 fs-6 text-muted">
                نتخذ إجراءات أمنية مناسبة لحماية معلوماتكم من الوصول أو
                الاستخدام غير المصرّح بهما، ومع ذلك فإنه لا يمكن ضمان أمان
                المعلومات المُرسلة عبر الإنترنت بنسبة 100%.
              </p>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">
                سابعاً: التعديلات على سياسة الخصوصية
              </h5>
              <p class="mb-3 fs-6 text-muted">
                قد يتم تحديث هذه السياسة من وقت لآخر بما يتناسب مع المتطلبات
                القانونية أو لتحسين الخدمات. سيتم نشر أي تغييرات على هذه الصفحة
                ويعتبر استمراركم في استخدام المنصة بعد نشر التعديلات بمثابة
                موافقة على السياسة المحدّثة.
              </p>
            </div>
            <div class="my-5">
              <h5 class="fw-bold mt-4 mb-2 fs-4">ثامناً: التواصل معنا</h5>
              <p class="mb-3 fs-6 text-muted">
                في حال وجود أي استفسارات بخصوص سياسة الخصوصية، يمكنكم التواصل
                معنا عبر البريد الإلكتروني:
                <a
                  :href="`mailto:${config.public.companyEmail}`"
                  class="text-primary text-decoration-underline"
                  >{{ config.public.companyEmail }}</a
                >
              </p>
            </div>
            <div class="my-5">
              <h6 class="fw-bold mt-4 mb-2 fs-4">ختاماً</h6>
              <p class="mb-0 text-muted">
                نسعى في AZZA دائمًا لحماية خصوصيتكم وضمان سرية معلوماتكم. نأمل
                أن تقدم لكم هذه السياسة وضوحًا وثقة في استخدامكم لمنصتنا.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.text-muted {
  color: #000000a6 !important;
  font-weight: 500;
}
</style>