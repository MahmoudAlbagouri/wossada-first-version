<script setup lang="ts">
import type { User, UserRole } from '~/types/models';
import type { TableColumn } from '~/types/ui';

const admin = useAdminService();
const auth = useAuthStore();
const { date } = useLocalized();
const v = useValidators();

useHead({ title: 'المستخدمون' });

const ROLE_LABELS: Record<UserRole, string> = { user: 'عميل', admin: 'مدير', vendor: 'تاجر', employee: 'موظف' };
const ROLE_TONES: Record<UserRole, 'neutral' | 'primary' | 'info' | 'success'> = {
  user: 'neutral',
  admin: 'primary',
  vendor: 'info',
  employee: 'success',
};

interface UserForm {
  isNew: boolean;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
}

const { items, loading, modalOpen, editing, form, openCreate, openEdit, submit, remove } = useAdminCrud<User, UserForm>({
  key: 'admin-users',
  list: () => admin.users.list(),
  toForm: (user) => ({
    isNew: !user,
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone?.replace(/^\+20/, '0') ?? '',
    password: '',
    role: user?.role ?? 'user',
    isActive: user?.isActive ?? true,
    isVerified: user?.isVerified ?? true,
  }),
  rules: {
    name: [v.required(), v.minLength(3)],
    email: [v.required(), v.email()],
    phone: [v.required(), v.phone()],
    password: [(value, values) => !values.isNew || !!value || 'كلمة المرور مطلوبة للمستخدم الجديد', v.password()],
  },
  save: ({ password, isNew: _isNew, ...values }, user) => {
    const payload = { ...values, email: values.email.trim().toLowerCase(), ...(password ? { password } : {}) };
    return user ? admin.users.update(user.id, payload) : admin.users.create(payload);
  },
  remove: (user) => admin.users.remove(user.id),
  describe: (user) => user.name,
  messages: { created: 'تم إنشاء المستخدم', updated: 'تم حفظ بيانات المستخدم', deleted: 'تم حذف المستخدم' },
});

const search = ref('');
const role = ref<UserRole | 'all'>('all');
const page = ref(1);
const PAGE_SIZE = 15;
watch([search, role], () => (page.value = 1));

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return items.value.filter(
    (user) =>
      (role.value === 'all' || user.role === role.value) &&
      (!term || [user.name, user.email, user.phone ?? ''].some((field) => field.toLowerCase().includes(term))),
  );
});
const rows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));

const roleTabs = computed(() => [
  { key: 'all' as const, label: 'الكل', count: items.value.length },
  ...(Object.keys(ROLE_LABELS) as UserRole[]).map((key) => ({
    key,
    label: ROLE_LABELS[key],
    count: items.value.filter((u) => u.role === key).length,
  })),
]);
const roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({ value, label: ROLE_LABELS[value] }));

const columns: TableColumn[] = [
  { key: 'name', label: 'المستخدم' },
  { key: 'phone', label: 'الموبايل', hideMobile: true },
  { key: 'role', label: 'الدور' },
  { key: 'status', label: 'الحالة' },
  { key: 'joined', label: 'تاريخ التسجيل', hideMobile: true },
  { key: 'actions', label: '', align: 'end', width: '110px' },
];
</script>

<template>
  <AdminPage title="المستخدمون" description="العملاء وفريق العمل وصلاحياتهم.">
    <template #actions>
      <BaseButton icon="ph:user-plus" @click="openCreate">مستخدم جديد</BaseButton>
    </template>

    <BaseTabs v-model="role" :tabs="roleTabs" />
    <BaseInput v-model="search" icon="ph:magnifying-glass" placeholder="ابحث بالاسم أو البريد أو الموبايل…" class="search" />

    <DataTable :columns="columns" :rows="rows" :loading="loading" empty-title="لا يوجد مستخدمون مطابقون" empty-icon="ph:users-three">
      <template #cell-name="{ row }">
        <div class="user">
          <span class="user__avatar">{{ initials(row.name) || '?' }}</span>
          <div class="user__text">
            <strong>{{ row.name }}<template v-if="row.id === auth.user?.id"> (أنت)</template></strong>
            <span dir="ltr">{{ row.email }}</span>
          </div>
        </div>
      </template>
      <template #cell-phone="{ row }"><span dir="ltr">{{ row.phone ?? '—' }}</span></template>
      <template #cell-role="{ row }"><BaseBadge :tone="ROLE_TONES[row.role]" size="sm">{{ ROLE_LABELS[row.role] }}</BaseBadge></template>
      <template #cell-status="{ row }">
        <BaseBadge :tone="row.isActive === false ? 'danger' : 'success'" dot size="sm">{{ row.isActive === false ? 'موقوف' : 'نشط' }}</BaseBadge>
      </template>
      <template #cell-joined="{ row }"><span class="text-subtle">{{ date(row.createdAt) }}</span></template>
      <template #cell-actions="{ row }">
        <div class="row-actions">
          <BaseButton variant="ghost" size="sm" icon="ph:pencil-simple" icon-only label="تعديل" @click="openEdit(row)" />
          <BaseButton
            v-if="row.id !== auth.user?.id"
            variant="ghost"
            size="sm"
            icon="ph:trash"
            icon-only
            label="حذف"
            class="danger"
            @click="remove(row)"
          />
        </div>
      </template>
    </DataTable>

    <BasePagination v-model:page="page" :total-pages="totalPages" />

    <BaseModal v-model="modalOpen" :title="editing ? 'تعديل المستخدم' : 'مستخدم جديد'" size="lg">
      <form id="user-form" class="form-grid" novalidate autocomplete="off" @submit="submit">
        <BaseInput v-model="form.values.name" label="الاسم" :error="form.errors.name" required />
        <BaseInput v-model="form.values.email" type="email" label="البريد الإلكتروني" dir="ltr" :error="form.errors.email" required />
        <BaseInput v-model="form.values.phone" type="tel" label="الموبايل" dir="ltr" :error="form.errors.phone" required />
        <BaseInput
          v-model="form.values.password"
          type="password"
          :label="editing ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'"
          autocomplete="new-password"
          :hint="editing ? 'اتركها فارغة للإبقاء على الحالية' : '8 أحرف على الأقل'"
          :error="form.errors.password"
          :required="!editing"
        />
        <BaseSelect v-model="form.values.role" :options="roleOptions" label="الدور" :disabled="editing?.id === auth.user?.id" />
        <div class="switches">
          <BaseCheckbox v-model="form.values.isActive" switch label="الحساب نشط" :disabled="editing?.id === auth.user?.id" />
          <BaseCheckbox v-model="form.values.isVerified" switch label="البريد مؤكد" />
        </div>
        <BaseAlert v-if="form.formError.value" tone="danger" class="form-grid__full">{{ form.formError.value }}</BaseAlert>
      </form>
      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">إلغاء</BaseButton>
        <BaseButton type="submit" form="user-form" :loading="form.submitting.value" icon="ph:check">حفظ</BaseButton>
      </template>
    </BaseModal>
  </AdminPage>
</template>

<style scoped>
.search {
  max-inline-size: 420px;
}
.user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.user__avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--gold-800);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
.user__text {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}
.user__text span {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.row-actions {
  display: inline-flex;
  gap: var(--space-1);
}
.danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
.switches {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>
