import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { ScrollView } from '@/components/ui/scroll-view';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Divider } from '@/components/ui/divider';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

// --- IMPORTS DE API ---
import { useAuth } from '../../src/context/AuthContext';
import { PostDetail, Comment, User } from '../../src/types/api';
import { API_BASE_URL } from '../../src/config';

// --- COMPONENTE INDIVIDUAL DE COMENTARIO ---
const CommentItem = ({ comment }: { comment: Comment }) => {
    const [loadFailed, setLoadFailed] = useState(false);
    const { full_name, avatar_url } = comment.author;
    
    // Construir URL absoluta del avatar
    const absoluteAvatarUrl = avatar_url ? `${API_BASE_URL}${avatar_url}` : null;
    const hasValidAvatar = !!absoluteAvatarUrl;

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
    };

    return (
        <Box className="bg-background-50 p-4 rounded-lg border border-outline-100">
            <HStack className="items-center mb-2 gap-2">
                <Avatar size="xs">
                    { (hasValidAvatar && !loadFailed) ? (
                        <AvatarImage 
                            source={{ uri: absoluteAvatarUrl! }} 
                            alt={full_name}
                            onError={() => setLoadFailed(true)}
                        />
                    ) : (
                        <AvatarFallbackText>
                            {full_name ? full_name.substring(0, 2).toUpperCase() : 'AN'}
                        </AvatarFallbackText>
                    )}
                </Avatar>
                
                <Box className="flex-1">
                    <Heading size="xs" numberOfLines={1}>{full_name}</Heading>
                </Box>
                
                <Text size="2xs" className="text-typography-400">
                    {formatDate(comment.created_at)}
                </Text>
            </HStack>

            <Text size="sm" className="text-typography-800">
                {comment.content}
            </Text>
        </Box>
    );
};

// --- PANTALLA PRINCIPAL ---
export default function PostDetailScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslation('post');
    const { apiFetch } = useAuth();

    // --- ESTADOS DE DATOS ---
    const [post, setPost] = useState<PostDetail | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // --- ESTADOS DE UI ---
    const [newCommentText, setNewCommentText] = useState(""); 
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false); // Avatar del Post Author
    const [currentUserAvatarFailed, setCurrentUserAvatarFailed] = useState(false); // Avatar del Usuario Actual

    // --- 1. Cargar Datos Iniciales (Post + Usuario Actual) ---
    useEffect(() => {
        const loadInitialData = async () => {
            if (!id) return;
            
            try {
                // Ejecutamos ambas peticiones en paralelo para mayor velocidad
                const [postResponse, userResponse] = await Promise.all([
                    apiFetch(`/api/v1/posts/${id}`),
                    apiFetch('/api/v1/users/me')
                ]);

                if (!postResponse.ok) throw new Error("Error al cargar el post");
                
                const postData: PostDetail = await postResponse.json();
                setPost(postData);

                if (userResponse.ok) {
                    const userData: User = await userResponse.json();
                    setCurrentUser(userData);
                }

            } catch (e) {
                console.error("Error cargando detalles:", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [id, apiFetch]);

    // Configurar título de navegación
    useLayoutEffect(() => {
        navigation.setOptions({
            title: post ? post.title : t('loading'), // Usa traducción o texto por defecto
        });
    }, [navigation, post, t]);

    // --- 2. MANEJADOR PARA PUBLICAR COMENTARIO ---
    const handlePostComment = async () => {
        if (newCommentText.trim() === "" || !post) return;
        
        setIsSendingComment(true);
        try {
            const response = await apiFetch(`/api/v1/posts/${post.id}/comments/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newCommentText }),
            });

            if (response.status === 201) {
                const newComment: Comment = await response.json();
                
                // Actualizamos el estado local añadiendo el comentario real devuelto por la API
                setPost(prev => prev ? {
                    ...prev,
                    comments: [...prev.comments, newComment]
                } : null);
                
                setNewCommentText(""); // Limpiar input
            } else {
                console.error("Error al publicar comentario");
            }
        } catch (e) {
            console.error("Error de red al comentar", e);
        } finally {
            setIsSendingComment(false);
        }
    };

    const formatDateTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-MX', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
        });
    };

    // --- Renderizado de Carga ---
    if (isLoading) {
        return (
            <Box className="flex-1 bg-background-0 justify-center items-center">
                <ActivityIndicator size="large" />
            </Box>
        );
    }

    if (!post) {
        return (
            <Box className="flex-1 bg-background-0 justify-center items-center">
                <Text>Publicación no encontrada.</Text>
            </Box>
        );
    }

    // Datos del Post
    const { full_name, avatar_url } = post.author;
    const postAvatarUrl = avatar_url ? `${API_BASE_URL}${avatar_url}` : null;
    const hasValidAvatar = !!postAvatarUrl;
    const postImageUrl = post.image_url ? `${API_BASE_URL}${post.image_url}` : null;
    
    // Datos del Usuario Actual (para el input)
    // Construimos el nombre completo localmente si no viene computado
    const currentUserName = currentUser ? 
        [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') : '';
    
    const currentUserAvatarUrl = currentUser?.avatar_url ? `${API_BASE_URL}${currentUser.avatar_url}` : null;
    const currentUserHasAvatar = !!currentUserAvatarUrl;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView 
                className="flex-1 bg-background-0"
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Imagen del Post */}
                {postImageUrl && (
                    <Image
                        source={{ uri: postImageUrl }}
                        className="mb-4 h-[220px] w-full"
                        alt={post.title}
                        resizeMode="cover"
                    />
                )}

                {/* AUTOR DEL POST */}
                <HStack className="items-center px-6 pb-4 gap-3">
                    <Avatar size="md">
                        { (hasValidAvatar && !loadFailed) ? (
                            <AvatarImage 
                                source={{ uri: postAvatarUrl! }} 
                                alt={full_name}
                                onError={() => setLoadFailed(true)}
                            />
                        ) : (
                            <AvatarFallbackText>
                                {full_name ? full_name.substring(0, 2).toUpperCase() : 'AN'}
                            </AvatarFallbackText>
                        )}
                    </Avatar>

                    <VStack className="flex-1">
                        <Heading size="sm" numberOfLines={1}>
                            {full_name}
                        </Heading>
                    </VStack>
                    
                    <Text size="md" bold className="text-typography-500">
                        {formatDateTime(post.created_at)}
                    </Text>
                </HStack>

                {/* CONTENIDO PRINCIPAL + COMENTARIOS */}
                <VStack className="px-6 gap-6">
                    <Box>
                        <Text size="lg" className="text-typography-950 leading-relaxed">
                            {post.description}
                        </Text>
                    </Box>

                    <Divider />

                    {/* SECCIÓN DE COMENTARIOS */}
                    <VStack className="gap-4">
                        <HStack className="items-center justify-between">
                            <Heading size="xl">{t('comments')}</Heading>
                            <Box className="bg-background-100 px-2 py-1 rounded-md">
                                <Text size="md" bold>{post.comments.length}</Text>
                            </Box>
                        </HStack>
                        
                        {/* --- FORMULARIO NUEVO --- */}
                        <HStack className="gap-3 items-start">
                            <Avatar size="sm" className="mt-1">
                                { (currentUserHasAvatar && !currentUserAvatarFailed) ? (
                                    <AvatarImage 
                                        source={{ uri: currentUserAvatarUrl! }} 
                                        alt={currentUserName}
                                        onError={() => setCurrentUserAvatarFailed(true)}
                                    />
                                ) : (
                                    <AvatarFallbackText>
                                        {currentUserName ? currentUserName.substring(0, 2).toUpperCase() : 'YO'}
                                    </AvatarFallbackText>
                                )}
                            </Avatar>

                            <VStack className="flex-1 gap-2">
                                <Input 
                                    variant="outline" 
                                    size="md" 
                                    className="h-auto min-h-[46px] rounded-lg bg-background-50 border-outline-200 focus:border-primary-500"
                                >
                                    <InputField 
                                        placeholder={t('commentPlaceholder')} 
                                        value={newCommentText}
                                        onChangeText={setNewCommentText}
                                        multiline={true}
                                        className="py-2 align-top text-typography-900 placeholder:text-typography-400"
                                        textAlignVertical="top"
                                    />
                                </Input>

                                <Box className="items-end">
                                    <Button 
                                        size="md" 
                                        action="primary" 
                                        className="rounded-full px-4"
                                        isDisabled={newCommentText.trim() === "" || isSendingComment}
                                        onPress={handlePostComment}
                                    >
                                        {isSendingComment ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <ButtonText>{t('publish')}</ButtonText>
                                        )}
                                    </Button>
                                </Box>
                            </VStack>
                        </HStack>

                        {/* LISTA DE COMENTARIOS */}
                        <VStack className="gap-3 mt-2">
                            {post.comments.length > 0 ? (
                                post.comments.map((comment) => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))
                            ) : (
                                <Box className="p-6 items-center justify-center opacity-50">
                                    <Text className="italic text-center">
                                        Aún no hay comentarios. ¡Sé el primero!
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </VStack>
                </VStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}