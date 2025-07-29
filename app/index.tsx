import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
const router = useRouter();
const index = () => {
  return (


<TouchableOpacity onPress={() => router.push("/teamadd")}>
  <Text>Add Team</Text>
</TouchableOpacity>
  )
}

export default index

const styles = StyleSheet.create({})