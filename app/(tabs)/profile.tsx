import { Button, ButtonText } from '@/components/ui/button';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

export default function UserScreen() {

    const router = useRouter();
    return (
        <View style={styles.container}>
            <Button variant="outline" size="md" action="primary">
                <ButtonText>Registrarse</ButtonText>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});