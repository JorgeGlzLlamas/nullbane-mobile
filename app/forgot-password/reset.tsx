import React, { useState } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react-native';
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText
} from '@/components/ui/form-control';

// API
import { API_BASE_URL } from '../../src/config';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // Obtenemos email y código del paso anterior
    const { email, code } = useLocalSearchParams<{ email: string, code: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        setError('');
        
        if (password.length < 8) { // Ajustado a min_length=8 de tu API
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code,
                    new_password: password,
                    confirm_password: confirmPassword
                }),
            });

            if (response.ok) {
                setSuccess(true);
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    router.replace('/login');
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.detail || 'Error al restablecer la contraseña.');
            }
        } catch (e) {
            setError('Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <Box className="flex-1 bg-background-0 justify-center items-center p-6">
                <Icon as={CheckCircleIcon} size="xl" className="text-green-500 mb-4" />
                <Heading size="2xl" className="text-center mb-2">¡Contraseña Actualizada!</Heading>
                <Text className="text-center text-typography-500">
                    Tu contraseña ha sido restablecida correctamente. Redirigiendo al inicio de sesión...
                </Text>
            </Box>
        );
    }

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
                paddingHorizontal: 24 
            }}
        >
            <VStack className="flex-1 gap-8">
                <Box className="mt-10">
                    <Heading size="3xl" className="mb-2">Nueva Contraseña</Heading>
                    <Text className="text-typography-500 text-lg">
                        Tu nueva contraseña debe ser diferente a las utilizadas anteriormente.
                    </Text>
                </Box>

                <VStack className="gap-4">
                    {error ? (
                        <Box className="bg-red-50 border border-red-200 p-3 rounded-md flex-row items-center gap-2">
                            <Icon as={AlertCircleIcon} size="sm" className="text-red-500" />
                            <Text size="sm" className="text-red-600 flex-1">{error}</Text>
                        </Box>
                    ) : null}

                    <FormControl isDisabled={isSubmitting}>
                        <FormControlLabel>
                            <FormControlLabelText>Contraseña</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputSlot className="pl-3">
                                <InputIcon as={LockIcon} className="text-typography-400"/>
                            </InputSlot>
                            <InputField 
                                placeholder="Nueva contraseña" 
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <InputSlot className="pr-3" onPress={() => setShowPassword(!showPassword)}>
                                <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
                            </InputSlot>
                        </Input>
                    </FormControl>

                    <FormControl isDisabled={isSubmitting}>
                        <FormControlLabel>
                            <FormControlLabelText>Confirmar Contraseña</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputSlot className="pl-3">
                                <InputIcon as={LockIcon} className="text-typography-400"/>
                            </InputSlot>
                            <InputField 
                                placeholder="Repite la contraseña" 
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                            <InputSlot className="pr-3" onPress={() => setShowPassword(!showPassword)}>
                                <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
                            </InputSlot>
                        </Input>
                    </FormControl>

                    <Button 
                        size="lg" 
                        onPress={handleReset}
                        isDisabled={isSubmitting || !password || !confirmPassword}
                        className="bg-primary-500 active:bg-primary-600 mt-4"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <ButtonText>Restablecer Contraseña</ButtonText>
                        )}
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
}