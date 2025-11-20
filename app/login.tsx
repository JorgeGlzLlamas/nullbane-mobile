import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from 'lucide-react-native';

import { ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../src/config';

export default function Login() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleState = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setApiError(null); 

        const LOGIN_ENDPOINT = `${API_BASE_URL}/api/v1/auth/login/token`; 

        const details = {
            'grant_type': 'password',
            'username': email,
            'password': password,
        };

        const formBody = new URLSearchParams(details).toString();

        try {
            const response = await fetch(LOGIN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'accept': 'application/json',
                },
                body: formBody,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Email o contraseña incorrectos');
            }

            const { access_token, refresh_token } = data;

            if (!access_token || !refresh_token) {
                throw new Error('Respuesta del servidor incompleta (no hay tokens)');
            }

            await SecureStore.setItemAsync('accessToken', access_token);
            await SecureStore.setItemAsync('refreshToken', refresh_token);

            router.replace('/(tabs)');

        } catch (error) {
            let errorMessage = 'Ocurrió un error de red.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
                paddingLeft: 24,
                paddingRight: 24
            }}
        >
            <Box className="flex-1 justify-center items-center gap-y-[40px]">
                <Heading size="4xl" className="text-center mb-10">
                    Inicio Sesión
                </Heading>
                <Box className="items-center gap-y-4 w-full">
                    <FormControl 
                        isRequired={true}
                        isInvalid={!!apiError} 
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Correo Electrónico</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type="text"
                                placeholder="tu@correo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </Input>
                    </FormControl>

                    <FormControl 
                        isRequired={true}
                        isInvalid={!!apiError}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Contraseña</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                            />
                            <InputSlot onPress={handleState} className="pr-4">
                                <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} size="xl" />
                            </InputSlot>
                        </Input>
                        
                        {apiError && (
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                                <FormControlErrorText>
                                    {apiError}
                                </FormControlErrorText>
                            </FormControlError>
                        )}
                        
                        <Button
                            variant="link"
                            action="secondary"
                            size="lg"
                            className="self-end p-0"
                            onPress={() => router.push('/forgot-password')}
                            isDisabled={isLoading}
                        >
                            <ButtonText>¿Olvidaste tu contraseña?</ButtonText>
                        </Button>
                    </FormControl>
                </Box>
                <Box className="w-full items-center gap-y-3">
                    <Button
                        onPress={handleLogin}
                        isDisabled={isLoading}
                        className="w-full h-[45px] bg-primary-500 active:!bg-secondary-500"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ButtonText className="text-2xl text-background-0">Entrar</ButtonText>
                        )}
                    </Button>
                    
                    <Button
                        variant="link"
                        action="primary"
                        className="self-center" 
                        onPress={() => router.push('/register')}
                        isDisabled={isLoading}
                    >
                        <ButtonText className="text-lg"> 
                            <Text className="text-typography-500 text-lg">
                                ¿No tienes cuenta?{' '}
                            </Text>
                            Regístrate
                        </ButtonText>
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}