import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ArrowLeftIcon, AlertCircleIcon } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';

// API
import { API_BASE_URL } from '../../src/config';

export default function VerifyCodeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(30); 
    const [error, setError] = useState('');

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleVerify = async () => {
        setError('');
        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            if (response.ok) {
                // Código válido: Pasamos al reset, llevando el código y email
                router.push({
                    pathname: '/forgot-password/reset',
                    params: { email, code } // IMPORTANTÍSIMO: Pasar el código validado
                });
            } else {
                const data = await response.json();
                setError(data.detail || 'Código inválido o expirado.');
            }
        } catch (e) {
            setError('Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setTimer(30);
        setError('');
        // Llamada simple para reenviar
        try {
             await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch (e) {
            setError('No se pudo reenviar el código.');
        }
    };

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
                paddingHorizontal: 24 
            }}
        >
            <Pressable onPress={() => router.back()} className="mb-6 self-start">
                <Icon as={ArrowLeftIcon} size="xl" className="text-typography-900" />
            </Pressable>

            <VStack className="flex-1 gap-8">
                <Box>
                    <Heading size="3xl" className="mb-2">Verificar Código</Heading>
                    <Text className="text-typography-500 text-lg">
                        Hemos enviado un código de 6 dígitos a:
                    </Text>
                    <Text className="text-typography-900 font-bold text-lg mt-1">
                        {email || 'tu@correo.com'}
                    </Text>
                </Box>

                {error ? (
                    <Box className="bg-red-50 p-3 rounded border border-red-200 flex-row items-center gap-2">
                        <Icon as={AlertCircleIcon} size="sm" className="text-red-500" />
                        <Text className="text-red-600 text-sm">{error}</Text>
                    </Box>
                ) : null}

                <VStack className="gap-6">
                    <Box>
                        <Input size="xl" className="text-center h-[60px] border-primary-200 bg-background-50">
                            <InputField 
                                placeholder="000000"
                                value={code}
                                onChangeText={(t) => {
                                    if (/^\d*$/.test(t) && t.length <= 6) {
                                        setCode(t);
                                        if(error) setError('');
                                    }
                                }}
                                keyboardType="number-pad"
                                className="text-center text-3xl tracking-[10px] font-bold text-primary-600 placeholder:tracking-widest"
                                maxLength={6}
                            />
                        </Input>
                        <Text size="xs" className="text-center mt-2 text-typography-400">
                            Ingresa el código de seguridad
                        </Text>
                    </Box>

                    <Button 
                        size="lg" 
                        onPress={handleVerify}
                        isDisabled={isSubmitting || code.length !== 6}
                        className="bg-primary-500 active:bg-primary-600"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <ButtonText>Verificar</ButtonText>
                        )}
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
}