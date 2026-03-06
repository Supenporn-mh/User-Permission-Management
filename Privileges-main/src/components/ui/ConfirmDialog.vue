<script setup>
import Modal from './Modal.vue';

defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'ยืนยันการดำเนินการ' },
  message: { type: String, default: '' },
  highlightText: { type: String, default: '' },
  icon: { type: Object, default: null },
  iconColor: { type: String, default: 'text-red-500 bg-red-50 ring-red-50/50' },
  confirmLabel: { type: String, default: 'ยืนยัน' },
  cancelLabel: { type: String, default: 'ยกเลิก' },
  confirmClass: { type: String, default: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' }
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Modal :is-open="isOpen" @close="$emit('cancel')" :title="title">
    <div class="py-10 text-center space-y-6">
      <div v-if="icon" class="w-24 h-24 rounded-full flex items-center justify-center mx-auto ring-8" :class="iconColor">
        <component :is="icon" :size="48" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-medium text-gray-900">
          <slot name="heading">{{ title }}</slot>
        </h3>
        <p class="text-sm text-gray-400 font-medium px-8 leading-relaxed">
          <slot>
            {{ message }} 
            <span v-if="highlightText" class="text-gray-900 font-medium">"{{ highlightText }}"</span>
          </slot>
        </p>
      </div>
    </div>
    <template #footer>
      <div class="grid grid-cols-2 gap-4 w-full">
        <button @click="$emit('cancel')" class="py-4 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">
          {{ cancelLabel }}
        </button>
        <button @click="$emit('confirm')" class="py-4 rounded-xl text-sm font-medium active:scale-95 transition-all" :class="confirmClass">
          {{ confirmLabel }}
        </button>
      </div>
    </template>
  </Modal>
</template>
