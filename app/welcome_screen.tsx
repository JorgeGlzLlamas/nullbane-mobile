import { useRouter } from 'expo-router';
import React from 'react';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import Entypo from '@expo/vector-icons/Entypo';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      <Box className="flex-1 justify-center items-center gap-y-[50px]">
        <Box className="items-center gap-y-4">
          <Heading size="5xl">
            Nullbane
          </Heading>
          <Entypo name="game-controller" size={250} color="white" />
        </Box>

        <Box>
          <Text className="text-center text-secondary-500" bold size="2xl">
            El nexo oficial de la comunidad.
          </Text>
          <Text className="text-center mt-1 text-primary-950" bold size="2xl">
            Chatea, comparte y domina
          </Text>
        </Box>
        <Button
          onPress={() => {
            router.replace('/(tabs)/explore');
          }}
          className="w-3/4 rounded-full h-[50px] bg-typography-700 active:!bg-secondary-500"
        >
          <ButtonText className="text-3xl text-background-0">Comenzar</ButtonText>
        </Button>
      </Box>
      <Text className="text-center text-secondary-500" bold size="lg">
        Tu comunidad, siempre conectada.
      </Text>
    </Box>
  );
}