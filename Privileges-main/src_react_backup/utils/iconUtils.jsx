import React from 'react';
import { Coffee, Gift, DollarSign, Calendar, Settings, Bus } from 'lucide-react';

export const renderIcon = (iconName, size = 18) => {
    const icons = { Coffee, Bus, Gift, DollarSign, Calendar };
    const IconComponent = icons[iconName] || Settings;
    return <IconComponent size={size} />;
};
