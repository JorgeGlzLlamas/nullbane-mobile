import React, { useState } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
} from '@/components/ui/form-control';
import { UploadCloudIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';


interface SelectedImage {
    uri: string;
    type: string;
    name: string;
}

export default function CreatePostScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('post');

    // --- Hook de API ---
    const { apiFetch } = useAuth();

    // --- ESTADOS ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    // Cambio: imageUri ahora guarda el objeto completo para la subida
    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

    // --- ESTADOS UI ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    // isImageUploading ya no es necesario porque la selección es local e instantánea
    
    // Errores
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [formError, setFormError] = useState<string | null>(null); // Error general de API

    // --- HANDLERS ---
    const handlePickImage = async () => {
        // 1. Pedir Permisos
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Se necesitan permisos para acceder a la galería.");
            return;
        }

        // 2. Abrir Galería
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3], // Formato estándar para posts
            quality: 0.8,   // Compresión ligera
        });

        if (!result.canceled && result.assets[0].uri) {
            const { uri } = result.assets[0];
            // Inferir tipo y nombre
            const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
            
            setSelectedImage({
                uri: uri,
                type: mimeType,
                name: `post-${Date.now()}.${fileExtension}`
            });
            setFormError(null); // Limpiar errores previos de imagen faltante
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
    };

    const handleSubmit = async () => {
        // 1. Limpiar errores previos
        setTitleError('');
        setDescriptionError('');
        setFormError(null);

        let hasError = false;
        if (!title.trim()) {
            setTitleError(t('titleRequired') || 'El título es obligatorio.');
            hasError = true;
        }
        if (!description.trim()) {
            setDescriptionError(t('descriptionRequired') || 'La descripción no puede estar vacía.');
            hasError = true;
        }
        if (!selectedImage) {
            setFormError(t('imageRequired') || 'Debes subir una imagen.');
            hasError = true;
        }

        if (hasError) return;

        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            // 2. Construir FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            
            // Adjuntar archivo (formato específico para React Native)
            formData.append('file', {
                uri: selectedImage!.uri,
                type: selectedImage!.type,
                name: selectedImage!.name,
            } as any);

            // 3. Enviar a la API
            const response = await apiFetch('/api/v1/posts/', {
                method: 'POST',
                // NO poner Content-Type manualmente con FormData
                body: formData,
            });

            if (response.status === 201) {
                console.log("Post creado exitosamente");
                router.back(); // Volver al feed
                return;
            }

            // 4. Manejo de Errores Específicos
            if (response.status === 403) {
                throw new Error(t('forbiddenError') || 'No tienes permisos para publicar (Solo Superusuarios).');
            }
            
            const errorData = await response.json();
            // Intentar leer el mensaje de error del backend (detail)
            const message = typeof errorData.detail === 'string' 
                ? errorData.detail 
                : (t('unknownError') || 'Error al crear la publicación.');
            
            throw new Error(message);

        } catch (e) {
            if (e instanceof Error) {
                setFormError(e.message);
            } else {
                setFormError(t('networkError') || 'Error de conexión.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box 
            className="flex-1 bg-background-0 justify-center"
            style={{
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
                paddingHorizontal: 24,
            }}
        >
            <Box className="w-full gap-y-[30px]">
                
                {/* HEADER */}
                <Heading size="3xl" className="text-center">
                    {t('createPost')}
                </Heading>

                {/* MENSAJE DE ERROR GLOBAL (API) */}
                {formError && (
                    <Box className="bg-red-100 border border-red-500 p-3 rounded-lg flex-row items-center gap-2">
                        <Icon as={AlertCircleIcon} className="text-red-600" />
                        <Text className="text-red-700 flex-1 text-sm">{formError}</Text>
                    </Box>
                )}

                <Box className="w-full gap-y-6">

                    {/* --- SELECTOR DE IMAGEN --- */}
                    <Box>
                        <Text size="lg" className="mb-2 font-medium text-typography-900">
                            {t('imageLabel')}
                        </Text>
                        
                        <Pressable
                            onPress={handlePickImage}
                            disabled={isSubmitting}
                            className={`
                                w-full h-[200px] rounded-xl border border-dashed 
                                items-center justify-center overflow-hidden
                                ${selectedImage ? 'border-outline-100' : 'border-outline-300 bg-background-50'}
                                active:bg-background-100
                            `}
                        >
                            {selectedImage ? (
                                <>
                                    <Image 
                                        source={{ uri: selectedImage.uri }} 
                                        alt="Portada del post"
                                        className="w-full h-full object-cover" 
                                    />
                                    {!isSubmitting && (
                                        <Pressable 
                                            onPress={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-background-0/80 p-1 rounded-full"
                                        >
                                            <Icon as={XCircleIcon} size="lg" className="text-red-500" />
                                        </Pressable>
                                    )}
                                </>
                            ) : (
                                <Box className="items-center gap-2 opacity-60">
                                    <Icon as={UploadCloudIcon} size="xl" className="text-typography-400" />
                                    <Text size="md" className="text-typography-500 font-medium">
                                        {t('imagePlaceholder')}
                                    </Text>
                                </Box>
                            )}
                        </Pressable>
                    </Box>

                    {/* --- TÍTULO --- */}
                    <FormControl 
                        isRequired={true} 
                        isInvalid={!!titleError} 
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">{t('titleLabel')}</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="lg">
                            <InputField
                                placeholder={t('titlePlaceholder')}
                                value={title}
                                onChangeText={(t) => {
                                    setTitle(t);
                                    if (titleError) setTitleError('');
                                }}
                            />
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{titleError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    {/* --- DESCRIPCIÓN --- */}
                    <FormControl 
                        isRequired={true} 
                        isInvalid={!!descriptionError} 
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">{t('descriptionLabel')}</FormControlLabelText>
                        </FormControlLabel>
                        
                        <Input 
                            size="lg" 
                            className="h-auto min-h-[120px] py-2 items-start"
                        >
                            <InputField
                                placeholder={t('descriptionPlaceholder')}
                                value={description}
                                onChangeText={(t) => {
                                    setDescription(t);
                                    if (descriptionError) setDescriptionError('');
                                }}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top" 
                                className="align-top"
                            />
                        </Input>
                        
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{descriptionError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                </Box>

                {/* --- BOTÓN PUBLICAR --- */}
                <Box className="w-full mt-4">
                    <Button
                        onPress={handleSubmit}
                        className="w-full h-[50px] bg-primary-500 active:!bg-secondary-500 rounded-full"
                        isDisabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ButtonText className="text-2xl font-bold text-background-0">
                                {t('publishButton')}
                            </ButtonText>
                        )}
                    </Button>
                </Box>

            </Box>
        </Box>
    );
}
