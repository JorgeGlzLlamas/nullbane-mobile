import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonSpinner } from '@/components/ui/button';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Divider } from '@/components/ui/divider'; 
import { Icon } from '@/components/ui/icon';
import { CheckIcon, XIcon, UserPlusIcon, SearchIcon } from 'lucide-react-native';

// --- NUEVO: Imports de Toast ---
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

// --- IMPORTS API ---
import { useAuth } from '../../src/context/AuthContext';
import { FriendRequest, UserSearch } from '../../src/types/api';
import { API_BASE_URL } from '../../src/config';

// --- Hook personalizado debounce ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- 1. TARJETA DE SOLICITUD ---
const RequestCard = ({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequest;
  onAccept: (id: number) => Promise<void>; // Ahora devuelven Promise
  onReject: (id: number) => Promise<void>;
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const user = request.requester;
  const avatarUrl = user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : null;

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept(request.id);
    setIsAccepting(false); 
  };

  const handleReject = async () => {
    setIsRejecting(true);
    await onReject(request.id);
    setIsRejecting(false);
  };

  return (
    <HStack className="items-center p-3 bg-background-50 rounded-lg border border-outline-100">
      <Avatar size="md" className="mr-3">
        {avatarUrl ? (
          <AvatarImage source={{ uri: avatarUrl }} alt={user.full_name} />
        ) : (
          <AvatarFallbackText>
            {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'US'}
          </AvatarFallbackText>
        )}
      </Avatar>
      <VStack className="flex-1">
        <Text bold numberOfLines={1}>{user.full_name}</Text>
      </VStack>
      <HStack className="gap-2">
        <Button
          size="sm"
          action="negative"
          variant="outline"
          className="rounded-full w-10 h-10 border-red-500"
          onPress={handleReject}
          isDisabled={isAccepting || isRejecting}
        >
          {isRejecting ? <ButtonSpinner color="$red500"/> : <Icon as={XIcon} className="text-red-500" />}
        </Button>
        <Button
          size="sm"
          action="positive"
          variant="solid"
          className="rounded-full w-10 h-10 bg-green-500"
          onPress={handleAccept}
          isDisabled={isAccepting || isRejecting}
        >
          {isAccepting ? <ButtonSpinner color="white"/> : <Icon as={CheckIcon} color="white" />}
        </Button>
      </HStack>
    </HStack>
  );
};

// --- 2. TARJETA DE BÚSQUEDA ---
const UserCard = ({
  user,
  onSend,
}: {
  user: UserSearch;
  onSend: (user: UserSearch) => Promise<void>; // Pasamos el objeto usuario completo para el toast
}) => {
  const [isSending, setIsSending] = useState(false);
  const avatarUrl = user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : null;

  const handleSend = async () => {
    setIsSending(true);
    await onSend(user);
    // No ponemos setIsSending(false) porque el usuario desaparecerá de la lista
  };

  return (
    <HStack className="items-center p-3 border-b border-outline-100">
      <Avatar size="md" className="mr-3">
        {avatarUrl ? (
          <AvatarImage source={{ uri: avatarUrl }} alt={user.full_name} />
        ) : (
          <AvatarFallbackText>
            {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'US'}
          </AvatarFallbackText>
        )}
      </Avatar>
      <VStack className="flex-1">
        <Text bold numberOfLines={1}>{user.full_name}</Text>
        <Text size="sm" className="text-typography-500" numberOfLines={1}>
          @{user.username}
        </Text>
      </VStack>
      <Button
        size="sm"
        action="primary"
        variant="solid"
        className="rounded-full w-10 h-10 bg-primary-500 active:bg-primary-600"
        onPress={handleSend}
        isDisabled={isSending}
      >
        {isSending ? <ButtonSpinner color="white"/> : <Icon as={UserPlusIcon} color="white" />}
      </Button>
    </HStack>
  );
};

// --- PANTALLA PRINCIPAL ---
export default function AddFriendsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('chats');
  const { apiFetch } = useAuth();
  
  // --- NUEVO: Hook de Toast ---
  const toast = useToast();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); 

  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearch[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('fabLabel') || 'Agregar Amigos',
    });
  }, [navigation, t]);

  // --- FUNCIÓN HELPER PARA MOSTRAR TOASTS ---
  const showToast = (title: string, description?: string, action: 'success' | 'error' | 'info' = 'success') => {
    toast.show({
      placement: "top",
      render: ({ id }) => {
        const toastId = "toast-" + id;
        return (
          <Toast nativeID={toastId} action={action} variant="solid">
            <VStack space="xs">
              <ToastTitle>{title}</ToastTitle>
              {description && <ToastDescription>{description}</ToastDescription>}
            </VStack>
          </Toast>
        );
      },
    });
  };

  // --- 1. CARGA INICIAL ---
  useEffect(() => {
    const loadInitialData = async () => {
        try {
            const [requestsResp, suggestionsResp] = await Promise.all([
                apiFetch('/api/v1/friends/requests/received'),
                apiFetch('/api/v1/friends/search')
            ]);

            if (requestsResp.ok) {
                const requestsData: FriendRequest[] = await requestsResp.json();
                setPendingRequests(requestsData);
            }

            if (suggestionsResp.ok) {
                const suggestionsData: UserSearch[] = await suggestionsResp.json();
                setSearchResults(suggestionsData);
            }
        } catch (e) {
            console.error("Error cargando datos iniciales", e);
            showToast("Error de conexión", "No se pudieron cargar los datos.", "error");
        } finally {
            setIsInitialLoading(false);
        }
    };
    loadInitialData();
  }, [apiFetch]);


  // --- 2. LÓGICA DE BÚSQUEDA DINÁMICA ---
  useEffect(() => {
    if (isInitialLoading) return;

    const searchUsers = async () => {
        setIsSearching(true);
        try {
            const endpoint = debouncedSearchTerm.trim() === '' 
                ? '/api/v1/friends/search'
                : `/api/v1/friends/search?name=${encodeURIComponent(debouncedSearchTerm)}`;

            const response = await apiFetch(endpoint);
            if (response.ok) {
                const data: UserSearch[] = await response.json();
                setSearchResults(data);
            }
        } catch (e) {
            console.error("Error buscando usuarios", e);
        } finally {
            setIsSearching(false);
        }
    };

    searchUsers();
  }, [debouncedSearchTerm, apiFetch]);

  // --- ACCIONES ---

  const handleAcceptRequest = async (requestId: number) => {
    try {
        const response = await apiFetch(`/api/v1/friends/requests/${requestId}/accept`, {
            method: 'POST'
        });
        if (response.ok) {
            setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
            // Toast de éxito
            showToast("Solicitud aceptada", "Ahora son amigos.", "success");
        } else {
             showToast("Error", "No se pudo aceptar la solicitud.", "error");
        }
    } catch (e) {
        console.error("Error aceptando solicitud", e);
        showToast("Error", "Ocurrió un problema de conexión.", "error");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
        const response = await apiFetch(`/api/v1/friends/requests/${requestId}/reject`, {
            method: 'DELETE'
        });
        if (response.ok) {
            setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
            // Toast informativo
            showToast("Solicitud rechazada", undefined, "info");
        } else {
             showToast("Error", "No se pudo rechazar la solicitud.", "error");
        }
    } catch (e) {
        console.error("Error rechazando solicitud", e);
        showToast("Error", "Ocurrió un problema de conexión.", "error");
    }
  };

  const handleSendRequest = async (user: UserSearch) => {
    try {
        const response = await apiFetch('/api/v1/friends/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_user_id: user.id })
        });

        if (response.ok) {
             setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
             // Toast de éxito con nombre del usuario
             showToast("Solicitud enviada", `Se envió solicitud a @${user.username}`, "success");
        } else {
             showToast("Error", "No se pudo enviar la solicitud.", "error");
        }
    } catch (e) {
        console.error("Error enviando solicitud", e);
        showToast("Error", "Ocurrió un problema de conexión.", "error");
    }
  };

  // --- RENDERIZADO ---

  if (isInitialLoading) {
      return (
        <Box className="flex-1 justify-center items-center bg-background-0">
            <ActivityIndicator size="large" />
        </Box>
      );
  }

  return (
    <Box 
        className="flex-1 bg-background-0"
        style={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }}
    >
        <Heading size="2xl" className="mx-6 mb-4">
            {t('fabLabel') || 'Agregar Amigos'}
        </Heading>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 24, 
        }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack className="px-6 gap-8">
          
          {/* 1. BARRA DE BÚSQUEDA */}
          <Input size="xl">
            <InputSlot className="pl-3">
              <Icon as={SearchIcon} size="lg" className="text-typography-400" />
            </InputSlot>
            <InputField
              placeholder={t('friendsPlaceholder') || 'Buscar por nombre...'}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
            />
          </Input>

          {/* 2. SECCIÓN SOLICITUDES */}
          {pendingRequests.length > 0 && (
            <VStack className="gap-3">
              <HStack className="justify-between items-center">
                <Heading size="sm" className="text-typography-500 uppercase tracking-wider">
                    {t('requests') || 'Solicitudes'} ({pendingRequests.length})
                </Heading>
              </HStack>
              
              <VStack className="gap-3">
                {pendingRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
              </VStack>
            </VStack>
          )}

          {pendingRequests.length > 0 && <Divider className="my-2" />}

          {/* 3. SECCIÓN BUSCADOR / SUGERENCIAS */}
          <VStack className="gap-3 min-h-[200px]">
             <Heading size="sm" className="text-typography-500 uppercase tracking-wider">
                {debouncedSearchTerm ? (t('results') || 'Resultados') : (t('suggestions') || 'Sugerencias')}
             </Heading>

            {isSearching ? (
              <Box className="py-10 items-center">
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-typography-400">{t('searching') || 'Buscando...'}</Text>
              </Box>
            ) : searchResults.length > 0 ? (
              <VStack className="gap-1">
                {searchResults.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onSend={handleSendRequest}
                  />
                ))}
              </VStack>
            ) : (
              <Box className="py-10 items-center opacity-50">
                <Icon as={SearchIcon} size="xl" className="text-typography-300 mb-4"/>
                <Text className="text-center text-typography-400">
                  {t('noResults') || 'No se encontraron usuarios.'}
                </Text>
              </Box>
            )}
          </VStack>

        </VStack>
      </ScrollView>
    </Box>
  );
}