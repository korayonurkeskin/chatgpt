import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'

const API_KEY = "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";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT"
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // all the old messages, + the new message

    // update our messages state
    setMessages(newMessages);

    // set a typing indicator (chatgpt is typing..)
    setTyping(true);
    // process message to ChatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages) {
    // chatMessages { sender : "user" or "ChatGPT", message: "The message content here"}
    // translate our messages for API to understand (format data for the API request)
    // apiMessages { role : "user" or "assistant", content: "The message content here"}
    
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender == "ChatGPT") {
        role = "assistant"
      } else {
        role = "user"
      }
      return { role : role, content: messageObject.message }
    });

    // role : "user" -> a message from the user, "assistant" -> a response from chatgpt
    // "system" -> generally one initial message defining HOW we want chatgpt to talk

    const systemMessage = {
      role: "system",
      //prompt defines how the language will come out of chatgpt
      content: "Explain concepts concisely like you are teaching a 12 year old."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages":[
        systemMessage,
        ...apiMessages //[msg1, msg2, ... etc]
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization" : "Bearer " + API_KEY,
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => { //grab data that's going to get returned from the actual openai API
      return data.json(); //json so that js can process it
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]
      );
      setTyping(false);
    });
  }

  return (
      <div className='App'>
        <div style={{ position: "relative", height:"800px", width:"700px"}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing"/> : null}
              >
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />
                })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend}/>
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
  )
}

export default App
