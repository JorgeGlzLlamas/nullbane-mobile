import React, { useState } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- GLUESTACK UI ---
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { MailIcon, ArrowLeftIcon, AlertCircleIcon } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
} from '@/components/ui/form-control';

// API
import { API_BASE_URL } from '../../src/config';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async () => {
        if (!email.includes('@')) {
            setError('Ingresa un correo electrónico válido.');
            return;
        }
        
        setError('');
        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // Endpoint devuelve 200 OK incluso si el usuario no existe (por seguridad)
            if (response.ok) {
                router.push({
                    pathname: '/forgot-password/verify',
                    params: { email }
                });
            } else {
                setError('Hubo un problema al enviar el código. Intenta de nuevo.');
            }
        } catch (e) {
            setError('Error de conexión. Verifica tu internet.');
        } finally {
            setIsSubmitting(false);
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
                    <Heading size="3xl" className="mb-2">Recuperar Contraseña</Heading>
                    <Text className="text-typography-500 text-lg">
                        Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un código de verificación.
                    </Text>
                </Box>

                <VStack className="gap-4">
                    <FormControl isInvalid={!!error} isDisabled={isSubmitting}>
                        <Input size="xl">
                            <InputSlot className="pl-3">
                                <InputIcon as={MailIcon} className="text-typography-400"/>
                            </InputSlot>
                            <InputField 
                                placeholder="ejemplo@correo.com" 
                                value={email}
                                onChangeText={(t) => {
                                    setEmail(t);
                                    if(error) setError('');
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{error}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <Button 
                        size="lg" 
                        onPress={handleSendCode}
                        isDisabled={isSubmitting || !email}
                        className="bg-primary-500 active:bg-primary-600"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <ButtonText>Enviar Código</ButtonText>
                        )}
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
}