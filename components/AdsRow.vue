<script setup>
defineProps({
  ad: { type: Object, required: true },
  selected: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle"]);
</script>

<template>
  <tr class="border-top">
    <!-- Checkbox -->
    <td style="width: 44px">
      <input
        class="form-check-input chk-sm"
        type="checkbox"
        :checked="selected"
        @change="emit('toggle', ad.id)"
        :aria-label="`تحديد الإعلان: ${ad.name}`"
      />
    </td>

    <td>
      <div class="cell-image">
        <img :src="ad.image" width="60" class="row-thumb" :alt="ad.name" />
      </div>
    </td>

    <!-- اسم الإعلان -->
    <td class="fw-semibold">
      <div class="text-truncate" style="max-width: 320px">
        {{ ad.name }}
      </div>
    </td>
    <!-- القسم -->
    <td class="text-dark">{{ ad.category }}</td>
    <!-- المدة -->
    <td class="text-dark">{{ ad.duration }}</td>
    <!-- تاريخ النشر -->
    <td class="text-dark">{{ ad.published }}</td>
    <!-- العنوان -->
    <td class="text-dark">{{ ad.city }}</td>
    <!-- السعر -->
    <td class="text-dark fw-semibold">{{ ad.price }}</td>
    <!-- الحالة -->
    <td>
      <span
        class="status-chip"
        :class="{
          'status-active': ad.status === 'active',
          'status-pending': ad.status === 'pending',
          'status-scheduled': ad.status === 'scheduled',
          'status-rejected': ad.status === 'rejected',
        }"
      >
        <Icon
          v-if="ad.status === 'active'"
          name="material-symbols:check-circle"
          class="fs-5 text-primary"
        />
        <Icon
          v-else-if="ad.status === 'pending'"
          name="ri:hourglass-2-fill"
          class="fs-5 text-info"
        />
        <Icon
          v-else-if="ad.status === 'scheduled'"
          name="material-symbols:event-busy-rounded"
          class="fs-5 text-muted"
        />
        <Icon v-else name="ri:prohibited-2-line" class="fs-5 text-danger" />
        <span>
          {{
            ad.status === "active"
              ? "نشط"
              : ad.status === "pending"
              ? "قيد المراجعة"
              : ad.status === "scheduled"
              ? "منتهية"
              : "مرفوضة"
          }}
        </span>
      </span>
    </td>

    <td style="width: 44px">
      <div class="dropdown">
        <button
          class="dropdown-toggle btn px-3 py-2"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <Icon name="carbon:barrier" class="fs-1 text-muted" />
        </button>
        <ul class="dropdown-menu shadow-sm">
          <li class="btn btn-sm dropdown-item">تعديل الاعلان</li>
          <li class="btn btn-sm dropdown-item">حذف الاعلان</li>
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
</style>
