<script setup>
import moment from "moment";

const props = defineProps({
  ad: { type: Object, required: true },
  selected: { type: Boolean, default: false },

  // تمرّرها الصفحة لتحديد الصفوف التي تُحذف حالياً (اختياري)
  deletingIds: { type: Array, default: () => [] },
});
const emit = defineEmits(["toggle", "delete", "edit"]);

function onDeleteClick() {
  // نُبلغ الصفحة لتفتح مودال التأكيد وتنفّذ الحذف
  emit("delete", props.ad.id);
}
function onEditClick() {
  emit("edit", props.ad.id); // لو أحببت تمسكها في الأب للتوجيه لصفحة التعديل
}
</script>

<template>
  <tr :to="`/ads/${ad?.id}`" class="border-top">
    <!-- Checkbox -->
    <td style="width: 44px">
      <input
        class="form-check-input chk-sm"
        type="checkbox"
        :checked="selected"
        @change="emit('toggle', ad.id)"
        :aria-label="`تحديد الإعلان: ${ad?.title}`"
      />
    </td>

    <!-- صورة -->
    <td>
      <div class="cell-image">
        <img
          :src="ad?.main_image"
          width="60"
          class="row-thumb"
          :alt="ad?.title"
        />
      </div>
    </td>

    <!-- اسم الإعلان -->
    <td class="fw-semibold">
      <div class="text-truncate" style="max-width: 320px">
        {{ ad?.title }}
      </div>
    </td>

    <!-- القسم -->
    <td class="text-dark">{{ ad?.subcategory?.category?.name }}</td>

    <!-- تاريخ النشر -->
    <td class="text-dark">{{ moment(ad?.created_at).format("YYYY-MM-DD") }}</td>

    <!-- العنوان -->
    <td class="text-dark">{{ ad?.city?.name }}</td>

    <!-- السعر -->
    <td class="text-dark fw-semibold">{{ ad?.price }} {{ ad?.currency }}</td>

    <!-- الحالة -->
    <td>
      <span
        class="status-chip"
        :class="{
          'status-active': ad.status === 'approved',
          'status-pending': ad.status === 'pending',
          'status-scheduled': ad.status === 'expired',
          'status-rejected': ad.status === 'rejected',
        }"
      >
        <Icon
          v-if="ad.status === 'approved'"
          name="material-symbols:check-circle"
          class="fs-5 text-primary"
        />
        <Icon
          v-else-if="ad.status === 'pending'"
          name="ri:hourglass-2-fill"
          class="fs-5 text-info"
        />
        <Icon
          v-else-if="ad.status === 'expired'"
          name="material-symbols:event-busy-rounded"
          class="fs-5 text-muted"
        />
        <Icon v-else name="ri:prohibited-2-line" class="fs-5 text-danger" />
        <span>
          {{
            ad.status === "approved"
              ? "نشط"
              : ad.status === "pending"
              ? "قيد المراجعة"
              : ad.status === "expired"
              ? "منتهية"
              : "مرفوضة"
          }}
        </span>
      </span>
    </td>

    <!-- قائمة الإجراءات -->
    <td style="width: 44px">
      <div class="dropdown">
        <button
          class="dropdown-toggle btn px-3 py-2"
          type="button"
          data-bs-toggle="dropdown"
          data-bs-display="static"
          :aria-expanded="false"
          :aria-label="`إجراءات الإعلان: ${ad?.title}`"
        >
          <Icon name="carbon:barrier" class="fs-1 text-muted" />
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <NuxtLink :to="`/ads/${ad.id}`" class="dropdown-item text-end">
              عرض الإعلان
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="`/ads/edit/${ad.id}`" class="dropdown-item text-end">
              تعديل الإعلان
            </NuxtLink>
          </li>
          <li>
            <button
              class="dropdown-item text-danger text-end"
              @click="onDeleteClick"
            >
              حذف الإعلان
            </button>
          </li>
        </ul>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
}
.status-active {
  background: #eef5ff;
  color: #0d6efd;
}
.status-pending {
  background: #fff6e5;
  color: #f0ad00;
}
.status-scheduled {
  background: #eef0f4;
  color: #6b7384;
}
.status-rejected {
  background: #ffecec;
  color: #dc3545;
}
.dropdown-toggle::after {
  content: "";
  display: none;
}
.row-thumb {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  object-fit: cover;
}
.cell-image {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}
</style>
