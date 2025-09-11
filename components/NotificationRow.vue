<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from '#app';

const props = defineProps({
  notification: {
    type: Object,
    required: true,
    // شكل متوقع:
    // {
    //   id: String,
    //   title: String,                 // "تم قبول إعلانك"
    //   time: String,                  // "منذ 5 د"
    //   message: String,               // fallback إن لم توفّر prefix/suffix/link
    //   read_at: String|null,          // null = غير مقروء
    //   link_text?: String,            // "كاميرا احترافية بحالة ممتازة للبيع"
    //   link_url?: String,             // "/ads/123" أو رابط كامل
    //   message_prefix?: String,       // "مبروك! تم مراجعة إعلانك "
    //   message_suffix?: String        // " والموافقة عليه. أصبح الآن ظاهرًا للزوار."
    // }
  },
});

const emit = defineEmits(['open', 'mark-read', 'delete']);

// حالة القراءة محلية لسرعة الاستجابة البصرية
const isRead = ref(!!props.notification.read_at);
watch(
  () => props.notification.read_at,
  (v) => (isRead.value = !!v)
);

const hasLink = computed(
  () => !!props.notification.link_text && !!props.notification.link_url
);

const router = useRouter();

// فتح الإشعار (ثم تعليم كمقروء بصرياً)
function openRow() {
  if (!isRead.value) {
    isRead.value = true;        // تأثير فوري في الواجهة
    emit('mark-read', props.notification.id); // دع الـ parent ينادي API
  }
  emit('open', props.notification.id);
}

// تعليم كمقروء من زر الظرف
function markRead() {
  if (!isRead.value) {
    isRead.value = true;
    emit('mark-read', props.notification.id);
  }
}
</script>

<template>
  <li class="row" :class="{ unread: !isRead }">
    <!-- أعلى السطر: العنوان يمين والوقت يسار -->
    <div class="row-top">
      <div class="title-wrap" @click="openRow">
        <span class="title">{{ notification.title }}</span>
      </div>

      <small class="time">{{ notification.time }}</small>
    </div>

    <!-- النص: رمادي مع رابط أزرق تحته خط (اختياري) -->
    <p class="msg">
      <template v-if="hasLink">
        <span v-if="notification.message_prefix">{{ notification.message_prefix }}</span>
        <NuxtLink
          :to="notification.link_url"
          class="msg-link"
          @click.stop="openRow"
        >
          {{ notification.link_text }}
        </NuxtLink>
        <span v-if="notification.message_suffix">{{ notification.message_suffix }}</span>
      </template>
      <template v-else>
        {{ notification.message }}
      </template>
    </p>

    <!-- الإجراءات -->
    <div class="actions">
      <button class="btn btn-sm btn-outline-primary rounded-pill" @click="openRow">
        فتح
      </button>

      <button
        class="btn btn-sm rounded-pill d-inline-flex align-items-center gap-2"
        :class="isRead ? 'btn-outline-secondary' : 'btn-outline-success'"
        @click="markRead"
        :disabled="isRead"
        title="تحديد كمقروء"
      >
        <Icon name="fa6-regular:envelope-open" class="fs-3" />
        <span>مقروء</span>
      </button>

      <button
        class="btn btn-sm btn-outline-danger rounded-pill"
        @click="$emit('delete', notification.id)"
        title="حذف الإشعار"
      >
        حذف
      </button>
    </div>
  </li>
</template>

<style scoped>
/* تخطيط عام */
.row {
  direction: rtl;
  padding: 12px 0 14px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  transition: background .2s ease;
}
.row:hover { background: #fafafa; }

/* شريط علوي */
.row-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.title-wrap {
  cursor: pointer;
}
.title {
  font-weight: 800;
  color: #0f172a; /* slate-900 */
  letter-spacing: .1px;
}
.time {
  color: #9aa0a6;        /* رمادي خافت */
  font-weight: 600;
  white-space: nowrap;
}

/* النص */
.msg {
  color: #4b5563;        /* slate-600 */
  margin: 0 0 8px;
  line-height: 1.8;
}
.msg-link {
  color: #1d4ed8;        /* أزرق */
  text-decoration: underline;
  text-underline-offset: 2px;
}
.msg-link:hover {
  color: #1e40af;
}

/* حالة غير المقروء: بدون مبالغة، توهج خفيف */
.row.unread {
  background:
    linear-gradient(180deg, rgba(255,244,220,.35), transparent 70%);
}

/* الأزرار */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* تكبير خفيف لأيقونة الظرف */
:deep(.fs-3) {
  font-size: 1.15rem !important;
}
</style>
