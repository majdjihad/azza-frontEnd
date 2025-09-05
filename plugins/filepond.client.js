// plugins/filepond.client.js
import { defineNuxtPlugin } from "#app";

// CSS الأساسي + معاينة الصور
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// FilePond core + الإضافات
import * as FilePond from "filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

export default defineNuxtPlugin(() => {
  // تسجيل الإضافات (مرة واحدة)
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize
  );

  // 🔒 سيرفر محلي وهمي لإلغاء أي رفع/معالجة تلقائية عالميًا
  const localServer = {
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      // نعلّم FilePond أن الملف "تمت معالجته" فورًا بدون أي طلب شبكة
      progress(true, 1, 1);
      load(`${Date.now()}-${Math.random()}`); // id وهمي
      return { abort };
    },
    revert: (uniqueFileId, load) => load(),
    fetch: null,
    load: null,
    restore: null,
  };

  // إعدادات افتراضية + تعريب
  FilePond.setOptions({
    server: localServer,
    instantUpload: false,
    allowProcess: false,
    allowRevert: false,
    storeAsFile: true, // مهم: نخزن كـ File في المتصفح

    // نصوص عربية
    labelIdle:
      "إسحب وأسقط الصور هنا أو <span class='filepond--label-action text-primary fw-bold'>اضغط للاختيار</span>",
    labelInvalidField: "الحقل يحتوي على ملفات غير صالحة",
    fileValidateTypeLabelExpectedTypes:
      "صيغة غير مدعومة. الصيغ المسموح بها: {allButLastType} أو {lastType}",
    labelFileWaitingForSize: "جاري حساب الحجم…",
    labelFileSizeNotAvailable: "الحجم غير متاح",
    labelFileLoading: "جاري التحميل…",
    labelFileLoadError: "فشل تحميل الملف",
    labelFileProcessing: "جاري الرفع…",
    labelFileProcessingComplete: "تم الرفع",
    labelFileProcessingAborted: "تم إلغاء الرفع",
    labelFileProcessingError: "فشل الرفع",
    labelFileRemoveError: "تعذر الحذف",
    labelTapToCancel: "اضغط للإلغاء",
    labelTapToRetry: "اضغط لإعادة المحاولة",
    labelTapToUndo: "اضغط للتراجع",
    labelButtonRemoveItem: "حذف",
    labelButtonAbortItemLoad: "إلغاء",
    labelButtonRetryItemLoad: "إعادة",
    labelButtonAbortItemProcessing: "إلغاء",
    labelButtonUndoItemProcessing: "تراجع",
    labelButtonRetryItemProcessing: "إعادة",
    labelButtonProcessItem: "رفع",
  });

  // ⚠️ لا تضع أي server حقيقي هنا (أبقِ التعليقات كما هي)
  // FilePond.setOptions({ server: { ... } })
});
