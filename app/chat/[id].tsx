import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';

// UI
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Input, InputField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { SendIcon, ArrowLeftIcon } from 'lucide-react-native';

// API
import { useAuth } from '../../src/context/AuthContext';
import { Message, User } from '../../src/types/api';
import { API_BASE_URL } from '../../src/config';

export default function ChatScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { apiFetch } = useAuth();

  // --- PARÁMETROS ---
  // Recibimos datos del otro usuario desde la navegación para mostrar en el header
  const { id: friendshipId, name: otherUserName, avatarUrl: otherUserAvatar } = useLocalSearchParams<{ 
      id: string, 
      name: string, 
      avatarUrl: string 
  }>();

  // --- ESTADOS ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // --- 1. OBTENER ID DEL USUARIO ACTUAL ---
  useEffect(() => {
      const fetchMe = async () => {
          try {
              const response = await apiFetch('/api/v1/users/me');
              if (response.ok) {
                  const user: User = await response.json();
                  setCurrentUserId(user.id);
              }
          } catch (e) {
              console.error("Error fetching user", e);
          }
      };
      fetchMe();
  }, [apiFetch]);


  // --- 2. CARGAR MENSAJES (POLLING) ---
  const fetchMessages = async () => {
      if (!friendshipId) return;
      try {
          const response = await apiFetch(`/api/v1/chats/${friendshipId}/messages`);
          if (response.ok) {
              const data: Message[] = await response.json();
              // La API devuelve orden cronológico (viejo -> nuevo). 
              // FlatList normal lo renderiza de arriba a abajo.
              setMessages(data);
          }
      } catch (e) {
          console.error("Error fetching messages", e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      fetchMessages(); // Carga inicial

      // Polling cada 3 segundos
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
  }, [friendshipId, apiFetch]);


  // --- 3. ENVIAR MENSAJE ---
  const handleSend = async () => {
      if (newMessage.trim() === '' || !friendshipId) return;

      const contentToSend = newMessage.trim();
      setNewMessage(''); // Limpiar input (Optimista)
      setIsSending(true);

      try {
          const response = await apiFetch(`/api/v1/chats/${friendshipId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: contentToSend }),
          });

          if (response.ok) {
              // Recargar mensajes inmediatamente para ver el nuevo con su ID real
              await fetchMessages();
              // Scroll al final
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          } else {
              console.error("Error sending message");
              setNewMessage(contentToSend); // Restaurar si falló
          }
      } catch (e) {
          console.error("Error sending message", e);
          setNewMessage(contentToSend);
      } finally {
          setIsSending(false);
      }
  };

  // --- CONFIGURAR HEADER ---
  useLayoutEffect(() => {
    const avatarSource = otherUserAvatar ? { uri: otherUserAvatar.startsWith('http') ? otherUserAvatar : `${API_BASE_URL}${otherUserAvatar}` } : null;

    navigation.setOptions({
      title: '', 
      headerShadowVisible: false,
      headerTitle: () => (
        <HStack className="items-center gap-3">
          <Avatar size="sm">
            {avatarSource ? (
                <AvatarImage source={avatarSource} alt={otherUserName} />
            ) : (
                <AvatarFallbackText>{otherUserName?.substring(0, 2).toUpperCase() || 'CH'}</AvatarFallbackText>
            )}
          </Avatar>
          <Heading size="md">{otherUserName || 'Chat'}</Heading>
        </HStack>
      ),
      headerLeft: () => (
        <Pressable onPress={() => router.back()} className="ml-2 mr-4">
          <Icon as={ArrowLeftIcon} size="xl" className="text-typography-700" />
        </Pressable>
      ),
    });
  }, [navigation, router, otherUserName, otherUserAvatar]);

  // --- RENDER ITEM ---
  const renderItem = ({ item }: { item: Message }) => {
      // Determinar si el mensaje es mío
      const isSent = item.sender_id === currentUserId;
      
      const formatTime = (isoString: string) => {
        try { return format(parseISO(isoString), 'HH:mm'); } catch { return ''; }
      };

      return (
        <Box className={`w-full flex-row px-4 py-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <Box className={`max-w-[75%] rounded-2xl px-3 py-2 ${isSent ? 'bg-primary-500 rounded-br-none' : 'bg-background-100 rounded-tl-none'}`}>
            <Text size="md" className={isSent ? 'text-typography-0' : 'text-typography-900'}>
              {item.content}
            </Text>
            <Text size="xs" className={`mt-1 text-right ${isSent ? 'text-primary-200 opacity-80' : 'text-typography-400 opacity-80'}`}>
              {formatTime(item.created_at)}
            </Text>
          </Box>
        </Box>
      );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0} 
    >
      <Box className="flex-1 bg-background-0">
        {isLoading ? (
          <Box className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </Box>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            className="flex-1 px-2 pt-4"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* --- Input --- */}
        <HStack
          className="p-3 items-center gap-2 border-t border-outline-200"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <Input className="flex-1 rounded-full bg-background-100">
            <InputField
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChangeText={setNewMessage}
              className="text-base py-2"
            />
          </Input>
          <Button
            className="rounded-full h-12 w-12"
            onPress={handleSend}
            isDisabled={newMessage.trim() === '' || isSending}
          >
            {isSending ? <ActivityIndicator color="white" size="small"/> : <Icon as={SendIcon} color="white" />}
          </Button>
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
}