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

// --- NUEVOS IMPORTS ---
import { API_BASE_URL } from '@/src/config';
import { ActivityIndicator } from 'react-native';
import { Icon } from '@/components/ui/icon';

// Tipo para el detalle del error de validación de Pydantic
interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export default function RegisterScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // --- Estados del Formulario ---
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState(''); // Opcional
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Estado para mostrar/ocultar (compartido, como en tu original)
    const [showPassword, setShowPassword] = useState(false);
    const handleState = () => {
        setShowPassword((prev) => !prev);
    };

    // --- Estados de API y Errores ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const handleRegister = async () => {
        // 1. Limpiar errores
        setFormError(null);
        setEmailError('');
        setFirstNameError('');
        setPasswordError('');
        setConfirmError('');
        setIsSubmitting(true);

        try {
            const body = {
                email,
                first_name: firstName,
                last_name: lastName || null, // Enviar null si está vacío
                password,
                confirm_password: confirmPassword,
            };

            const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.status === 201) {
                router.push('/login');
                return;
            }

            // 3. Manejo de Errores
            const errorData = await response.json();

            if (errorData.detail) {
                // Caso A: Error de validación (422 de Pydantic)
                if (Array.isArray(errorData.detail)) {
                    errorData.detail.forEach((err: ValidationError) => {
                        if (err.loc.includes('email')) {
                            setEmailError(err.msg);
                        } else if (err.loc.includes('first_name')) {
                            setFirstNameError(err.msg);
                        } else if (err.loc.includes('password')) {
                            setPasswordError(err.msg);
                        } else if (err.loc.includes('confirm_password')) {
                            setConfirmError(err.msg);
                        } else {
                            setFormError(err.msg); // Error de validación general
                        }
                    });
                } 
                // Caso B: Error simple (400, 409 "Email ya registrado")
                else if (typeof errorData.detail === 'string') {
                    if (errorData.detail.toLowerCase().includes('email')) {
                        setEmailError(errorData.detail);
                    } else {
                        setFormError(errorData.detail);
                    }
                }
            } else {
                setFormError('Ocurrió un error desconocido.');
            }

        } catch (e) {
            setFormError('No se pudo conectar al servidor. Intenta de nuevo.');
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
                paddingLeft: 24,
                paddingRight: 24
            }}
        >
            <Box className="flex-1 justify-center items-center gap-y-[30px]">
                <Heading size="4xl" className="text-center leading-normal">
                    Registro
                </Heading>
                <Box className="items-center gap-y-4 w-full">

                    {/* --- NUEVO: Error global de API --- */}
                    {formError && (
                        <Box className="w-full bg-red-100 border border-red-500 p-3 rounded-lg flex-row items-center gap-x-2">
                            <Icon as={AlertCircleIcon} size="sm" className="text-red-600" />
                            <Text size="sm" className="text-red-700">{formError}</Text>
                        </Box>
                    )}

                    {/* --- Email --- */}
                    <FormControl 
                        isRequired={true}
                        isInvalid={!!emailError}
                        className="w-full"
                        isDisabled={isSubmitting}
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
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) setEmailError('');
                                }}
                            />
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{emailError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    {/* --- Nombre --- */}
                    <FormControl
                        isRequired={true}
                        isInvalid={!!firstNameError}
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Nombre(s)</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type="text"
                                autoCapitalize="words"
                                value={firstName}
                                onChangeText={(text) => {
                                    setFirstName(text);
                                    if (firstNameError) setFirstNameError('');
                                }}
                            />
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{firstNameError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    
                    {/* --- Apellido (Opcional) --- */}
                    <FormControl 
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Apellido</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type="text"
                                autoCapitalize="words"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </Input>
                        {/* No hay FormControlError porque es opcional */}
                    </FormControl>

                    {/* --- Contraseña --- */}
                    <FormControl 
                        isRequired={true}
                        isInvalid={!!passwordError}
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Contraseña</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (passwordError) setPasswordError('');
                                }}
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
                            <FormControlErrorText>{passwordError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    {/* --- Confirmar Contraseña --- */}
                    <FormControl 
                        isRequired={true}
                        isInvalid={!!confirmError}
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">Confirmar Contraseña</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (confirmError) setConfirmError('');
                                }}
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
                            <FormControlErrorText>{confirmError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                </Box>
                <Box className="w-full items-center gap-y-3">
                    <Button
                        onPress={handleRegister}
                        className="w-full h-[45px] bg-primary-500 active:!bg-secondary-500"
                        isDisabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ButtonText className="text-2xl text-background-0">Registrar</ButtonText>
                        )}
                    </Button>
                    
                    <Button
                        variant="link"
                        action="primary"
                        className="self-center" 
                        onPress={() => router.push('/login')}
                        isDisabled={isSubmitting}
                    >
                        <ButtonText className="text-lg"> 
                            <Text className="text-typography-500 text-lg">
                                ¿Tienes cuenta?{' '}
                            </Text>
                            Inicia sesión
                        </ButtonText>
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
