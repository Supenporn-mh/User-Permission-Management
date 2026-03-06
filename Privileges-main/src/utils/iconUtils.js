import * as Icons from 'lucide-vue-next';
import { h } from 'vue';

export const renderIcon = (iconName, size = 18, className = '') => {
    const IconComponent = Icons[iconName] || Icons.HelpCircle;
    return h(IconComponent, { size, class: className });
};
