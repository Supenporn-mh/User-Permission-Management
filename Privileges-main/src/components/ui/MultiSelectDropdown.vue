<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'เลือก...'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

const toggleOption = (option) => {
  const newValue = [...props.modelValue];
  if (option === 'All') {
    if (newValue.length === props.options.length) {
      emit('update:modelValue', []);
    } else {
      emit('update:modelValue', props.options.map(o => typeof o === 'string' ? o : o.value));
    }
    return;
  }
  
  const val = typeof option === 'string' ? option : option.value;
  const index = newValue.indexOf(val);
  
  if (index === -1) {
    newValue.push(val);
  } else {
    newValue.splice(index, 1);
  }
  emit('update:modelValue', newValue);
};

const isSelected = (option) => {
  if (option === 'All') return props.modelValue.length === props.options.length;
  const val = typeof option === 'string' ? option : option.value;
  return props.modelValue.includes(val);
};

const getLabel = (option) => typeof option === 'string' ? option : option.label;

const displayLabel = computed(() => {
  if (props.modelValue.length === 0) return props.placeholder;
  if (props.modelValue.length === props.options.length) return 'ทั้งหมด';
  return props.modelValue.length + ' รายการ';
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button 
      @click="toggleOpen"
      class="w-full flex items-center justify-between pl-6 pr-5 py-4 bg-white border border-gray-100 rounded-[20px] text-sm font-medium text-gray-600 outline-none shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
    >
      <span>{{ displayLabel }}</span>
      <ChevronDown :size="16" stroke-width="3" class="text-gray-300 transition-transform" :class="isOpen ? 'rotate-180' : ''" />
    </button>

    <div v-if="isOpen" class="absolute z-50 top-full mt-2 w-full bg-white rounded-[20px] shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
      <button 
        @click="toggleOption('All')" 
        class="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div class="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
             :class="isSelected('All') ? 'bg-blue-600 border-blue-600 text-white' : 'border-2 border-gray-200 bg-white'">
          <Check v-if="isSelected('All')" :size="12" stroke-width="4" />
        </div>
        <span class="text-sm font-medium text-gray-800">ทั้งหมด</span>
      </button>

      <button 
        v-for="opt in options" 
        :key="typeof opt === 'string' ? opt : opt.value"
        @click="toggleOption(opt)" 
        class="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div class="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
             :class="isSelected(opt) ? 'bg-blue-600 border-blue-600 text-white' : 'border-2 border-gray-200 bg-white'">
          <Check v-if="isSelected(opt)" :size="12" stroke-width="4" />
        </div>
        <span class="text-sm font-medium text-gray-800">{{ getLabel(opt) }}</span>
      </button>
    </div>
  </div>
</template>
