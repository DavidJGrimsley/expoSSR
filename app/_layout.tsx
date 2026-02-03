import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="blog" />
      <Stack.Screen name="blog-loader" />
      <Stack.Screen name="examples/api-routes" />
      <Stack.Screen name="examples/blockchain-loader" />
      <Stack.Screen name="examples/blockchain" />
      <Stack.Screen name="examples/data-loaders" />
      <Stack.Screen name="examples/error" />
      <Stack.Screen name="examples/garden-loader" />
      <Stack.Screen name="examples/ssr" />
      <Stack.Screen name="examples/static" />
      <Stack.Screen name="examples/suspense" />
      <Stack.Screen name="examples/tasks" />
      <Stack.Screen name="other-screen/(drawer)" />
    </Stack>
  );
}
