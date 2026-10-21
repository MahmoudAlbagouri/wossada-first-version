import type { FormRules } from './useForm';

interface CrudOptions<T extends { id: string }, F extends object> {
  /** `useAsyncData` key. */
  key: string;
  list: () => Promise<T[]>;
  /** Form values for a new item (`null`) or an existing one. */
  toForm: (item: T | null) => F;
  rules?: FormRules<F>;
  save: (values: F, item: T | null) => Promise<unknown>;
  remove?: (item: T) => Promise<unknown>;
  /** Shown in the delete confirmation. */
  describe?: (item: T) => string;
  messages?: { created?: string; updated?: string; deleted?: string };
}

/**
 * The list + modal form + delete flow every simple admin screen repeats
 * (coupons, colors, sizes, brands, categories, users, ...).
 */
export function useAdminCrud<T extends { id: string }, F extends object>(options: CrudOptions<T, F>) {
  const toast = useToast();
  const { confirm } = useConfirm();

  const { data, status, refresh } = useAsyncData(options.key, options.list, {
    server: false,
    default: () => [] as T[],
  });

  const modalOpen = ref(false);
  const editing = shallowRef<T | null>(null);
  const form = useForm(() => options.toForm(null), options.rules);

  function openCreate() {
    editing.value = null;
    form.reset(options.toForm(null));
    modalOpen.value = true;
  }

  function openEdit(item: T) {
    editing.value = item;
    form.reset(options.toForm(item));
    modalOpen.value = true;
  }

  const submit = form.handleSubmit(async (values) => {
    await options.save(values as F, editing.value);
    toast.success(editing.value ? (options.messages?.updated ?? 'تم حفظ التعديلات') : (options.messages?.created ?? 'تمت الإضافة بنجاح'));
    modalOpen.value = false;
    await refresh();
  });

  async function remove(item: T) {
    if (!options.remove) return;
    const ok = await confirm({
      title: 'تأكيد الحذف',
      message: options.describe ? `سيتم حذف «${options.describe(item)}» نهائياً.` : 'لا يمكن التراجع عن الحذف.',
      tone: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });
    if (!ok) return;
    try {
      await options.remove(item);
      toast.success(options.messages?.deleted ?? 'تم الحذف');
      await refresh();
    } catch (error) {
      toast.fromError(error);
    }
  }

  return {
    items: data,
    loading: computed(() => isFetching(status.value)),
    refresh,
    modalOpen,
    editing,
    form,
    openCreate,
    openEdit,
    submit,
    remove,
  };
}
