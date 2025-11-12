import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
} from '@/components/ui/form-control';

import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EyeIcon, EyeOffIcon, AlertCircleIcon } from 'lucide-react-native';


export default function Login() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [showPassword, setShowPassword] = useState(false);
    const handleState = () => {
        setShowPassword((prev) => !prev);
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
                        isInvalid={true}
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
                            />
                        </Input>
                        <FormControlHelper>
                            <FormControlHelperText>
                                Nunca compartiremos tu correo.
                            </FormControlHelperText>
                        </FormControlHelper>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>
                                Correo no válido. Este correo ya está registrado.
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl 
                        isRequired={true}
                        isInvalid={true}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Contraseña</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                            />
                            <InputSlot onPress={handleState} className="pr-4">
                                <InputIcon
                                    as={showPassword ? EyeOffIcon : EyeIcon}
                                    size="xl"
                                />
                            </InputSlot>
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>
                                Contraseña incorrecta.
                            </FormControlErrorText>
                        </FormControlError>
                        
                        <Button
                            variant="link"
                            action="secondary"
                            size="lg"
                            className="self-end p-0"
                            onPress={() => router.push('/forgot_password')}
                        >
                            <ButtonText>¿Olvidaste tu contraseña?</ButtonText>
                        </Button>
                    </FormControl>
                </Box>
                <Box className="w-full items-center gap-y-3">
                    <Button
                        onPress={() => {
                            router.replace('/(tabs)');
                        }}
                        className="w-full h-[45px] bg-primary-500 active:!bg-secondary-500"
                    >
                        <ButtonText className="text-2xl text-background-0">Entrar</ButtonText>
                    </Button>
                    
                    <Button
                        variant="link"
                        action="primary"
                        className="self-center" 
                        onPress={() => router.push('/register')}
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