// Dependincies
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import moment from 'moment';

// Socket-io backend
const socket = io('http://localhost:3000');


function App() {
  const [allMessages, setAllMessages] = useState([]);   // All messages
  const [connected, setConnected] = useState(false);    // User is connected any room?
  const [username, setUsername] = useState("");         // Username
  const [message, setMessage] = useState("");           // Message for send new message
  const [room, setRoom] = useState("");                 // Room code
  const messagesRef = useRef(null);                     // All messages parent div for auto scroll to end

  // Auto scroll to end on new message
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [allMessages]); 

  // Get new messages
  useEffect(() => {
    const handleMessage = (message) => {
      setAllMessages(prev => [...prev, message]);
    };
    socket.on('message', handleMessage);
    return () => {
      socket.off('message', handleMessage);
    };
  }, []);

  // Send message
  const handleSend = () => {
    if (message) {
      socket.emit('sendMessage', { message, username, room });
      setMessage("");
    }
  };

  // Join Room
  const handleJoin = () => {
    setMessage("");
    if (username && room) {
      socket.emit('join', { username, room });
      setConnected(true);
    }
  };

  return (
    !connected ?

      // Join Room
      <div className='joinRoom'>
        <h3>Join Room</h3>
        <div className="inputArea">
          <input id='room' name='room' type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder='' onKeyDown={(e) => e.key === "Enter" && handleJoin()}/>
          <label htmlFor="room">Room</label>
        </div>
        <div className="inputArea">
          <input id='username' name='username' type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='' onKeyDown={(e) => e.key === "Enter" && handleJoin()}/>
          <label htmlFor="username">Your Name</label>
        </div>
        <button onClick={() => handleJoin()}>Join</button>
      </div>

      :

      // Chat Room
      <>
        <h3 style={{textAlign: "center",  marginBottom: "1rem"}}>{room}</h3>
        <div className='roomArea'>
          <div className="messagesArea" ref={messagesRef}>
            {allMessages.map((msg, index) => (
                <div key={index} className={msg.id === -1 ? "system" : (msg.id === socket.id ? "message sender" : "message")}>
                  {msg.id !== -1 && <b>{msg.id === socket.id ? "You" : msg.username}</b>}
                  <p className="message-content">{msg.message}</p>
                  {msg.id !== -1 && <span className="time">{moment(msg.time).format('DD.MM.YYYY H:mm')}</span>}
                </div>
              ))}
          </div>
          <div className="sendMessage">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Your message' onKeyDown={(e) => e.key === "Enter" && handleSend()}/>
            <button onClick={() => handleSend()}>Send</button>
          </div>
        </div>
      </>

  )
}

export default App
