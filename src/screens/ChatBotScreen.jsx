import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendChatbotMessage } from '../api/ApiClient';

export default function ChatBotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! 👋 I am your Sip N Bite AI Assistant. Ask me about our menu, recommendations, or table bookings!', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), text: inputText.trim(), sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await sendChatbotMessage(userMsg.text);
      if (res.data?.success) {
        const botMsg = { id: (Date.now() + 1).toString(), text: res.data.reply, sender: 'bot' };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg = { id: (Date.now() + 1).toString(), text: 'Oops! I am having trouble right now.', sender: 'bot' };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      const botMsg = { id: (Date.now() + 1).toString(), text: 'Network error. Please try again.', sender: 'bot' };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="cafe" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>Sip N Bite AI</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble, 
            item.sender === 'user' ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={[
              styles.messageText, 
              item.sender === 'user' ? styles.userText : styles.botText
            ]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Sip N Bite AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#A89E91"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF7' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#E23744',
    elevation: 4,
  },
  backButton: { width: 32, height: 32, justifyContent: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  
  messageList: { padding: 16, paddingBottom: 20 },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E23744',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#FFE4D6',
  },
  messageText: { fontSize: 15, fontWeight: '600' },
  userText: { color: '#FFFFFF' },
  botText: { color: '#1F1610' },

  typingIndicator: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  typingText: {
    color: '#8C7D73',
    fontStyle: 'italic',
    fontSize: 12,
    fontWeight: '700'
  },

  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#FFE4D6',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F0EB',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F1610',
    fontWeight: '600',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#E23744',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
