import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Switch } from '@/components/ui/switch';

type SettingsSwitchItemProps = {
    title: string;
    currentValue: string;
    isEnabled: boolean;
    onToggle: () => void;
};

export function SettingsSwitchItem({ 
    title, 
    currentValue, 
    isEnabled, 
    onToggle 
}: SettingsSwitchItemProps) {
    return (
        <Box className="flex-row justify-between items-center p-1 pt-4 border-b border-primary-500">
            <Box className="flex-1">
                <Heading size="lg" className="text-primary-500">{title}</Heading>
                <Text size="md" bold className="text-typography-500">{currentValue}</Text>
            </Box>
            
            <Switch
                key={currentValue}
                isChecked={isEnabled} 
                onToggle={onToggle} 
                size="lg"
            />
        </Box>
    );
}