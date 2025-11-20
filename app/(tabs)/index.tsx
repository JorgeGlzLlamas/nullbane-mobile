import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, ListRenderItem } from 'react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { PlusIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Imports de API
import { useAuth } from '../../src/context/AuthContext';
import { Post, User } from '../../src/types/api';
import { API_BASE_URL } from '../../src/config';

// --- Componente de Tarjeta de Post (Memoizado para rendimiento) ---
const PostCard = React.memo(({ post, onPress }: { post: Post; onPress: () => void }) => {
    // Construir URL de imagen (si existe)
    const imageUrl = post.image_url ? `${API_BASE_URL}${post.image_url}` : null;
    // Imagen por defecto si no hay
    const defaultImage = 'https://gluestack.github.io/public-blog-video-assets/yoga.png';

    return (
        <Pressable onPress={onPress} className="active:opacity-80 mb-4">
            <Card size="md" variant="filled" className="w-full h-[290px] bg-secondary-500 rounded-xl">
                <Image
                    source={{ uri: imageUrl || defaultImage }}
                    className="mb-4 h-[180px] w-full rounded-md"
                    alt={post.title}
                    resizeMode="cover"
                />
                <Heading size="lg" className="mb-1 text-white" numberOfLines={1}>
                    {post.title}
                </Heading>
                <Text size="sm" numberOfLines={2} className="text-typography-500">
                    {post.description}
                </Text>
            </Card>
        </Pressable>
    );
});

export default function Index() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('home');
    const { apiFetch } = useAuth();

    // --- Estados de Datos ---
    const [posts, setPosts] = useState<Post[]>([]);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Carga inicial
    const [isRefreshing, setIsRefreshing] = useState(false); // Pull-to-refresh
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Infinite scroll
    
    // --- Estados de Paginación ---
    const LIMIT = 20;
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const response = await apiFetch('/api/v1/users/me');
                if (response.ok) {
                    const userData: User = await response.json();
                    // Guardamos si es superusuario
                    setIsSuperUser(!!userData.is_superuser); 
                }
            } catch (e) {
                console.log('Error verificando permisos', e);
            }
        };
        checkPermissions();
    }, [apiFetch]);

    // --- Función para Cargar Posts ---
    const loadPosts = useCallback(async (currentOffset: number, isRefresh = false) => {
        try {
            // Si es refresh, no marcamos 'isLoadingMore'
            if (!isRefresh) setIsLoadingMore(true);

            const endpoint = `/api/v1/posts/?limit=${LIMIT}&offset=${currentOffset}`;
            const response = await apiFetch(endpoint);

            if (!response.ok) throw new Error('Error al cargar posts');

            const newPosts: Post[] = await response.json();

            if (isRefresh) {
                setPosts(newPosts);
            } else {
                // Concatenar posts nuevos a los existentes (filtrando duplicados por si acaso)
                setPosts(prev => [...prev, ...newPosts]);
            }

            // Si recibimos menos posts que el límite, ya no hay más
            setHasMore(newPosts.length === LIMIT);

        } catch (e) {
            console.error('Error cargando feed:', e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    }, [apiFetch]);

    // --- Carga Inicial ---
    useEffect(() => {
        loadPosts(0, true); // Cargar offset 0 como refresh
    }, [loadPosts]);

    // --- Manejadores de Eventos ---
    const handleRefresh = () => {
        setIsRefreshing(true);
        setOffset(0); // Reiniciar offset
        setHasMore(true);
        loadPosts(0, true);
    };

    const handleLoadMore = () => {
        if (!hasMore || isLoadingMore || isLoading) return;
        
        const newOffset = offset + LIMIT;
        setOffset(newOffset);
        loadPosts(newOffset, false);
    };

    const handlePostPress = (id: number) => {
        router.push({ pathname: "/post/[id]", params: { id } });
    };
    
    const handleCreatePost = () => {
        router.push('/post/create'); 
    };

    // --- Renderizado de Items ---
    const renderItem: ListRenderItem<Post> = ({ item }) => (
        <PostCard post={item} onPress={() => handlePostPress(item.id)} />
    );

    const renderFooter = () => {
        if (!isLoadingMore) return <Box className="h-20" />; // Espacio extra al final
        return (
            <Box className="h-20 justify-center items-center">
                <ActivityIndicator size="small" />
            </Box>
        );
    };

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 16,
                paddingLeft: 24,
                paddingRight: 24
            }}
        >
            <Heading size="2xl" className="mb-4">
                {t('title')}
            </Heading>

            {isLoading ? (
                <Box className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" />
                </Box>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    
                    // Infinite Scroll
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5} // Cargar cuando falte media pantalla
                    ListFooterComponent={renderFooter}

                    // Pull to Refresh
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                    }
                    
                    // Estilo para el contenido (padding inferior para que el FAB no tape el último item)
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}

            {isSuperUser && (
                <Fab
                    size="lg"
                    placement="bottom right"
                    onPress={handleCreatePost}
                    className="bg-primary-500 active:!bg-primary-600 mb-4 mr-4"
                >
                    <FabIcon as={PlusIcon} size="xl" />
                    <FabLabel bold>{t('fabLabel')}</FabLabel>
                </Fab>
            )}
        </Box>
    );
}