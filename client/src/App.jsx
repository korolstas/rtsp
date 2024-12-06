import './App.css';
import { useState } from 'react';
import ReactPlayer from 'react-player';
const URL_DEFAULT = 'https://963a-37-214-34-213.ngrok-free.app'; // http://localhost:8080

function App() {

  const [isPlaying, setIsPlaying] = useState(false);
  const startStream = async () => {
    try {
      const response = await fetch(`${URL_DEFAULT}/start-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      setIsPlaying(!!data);
    } catch (error) {
      alert(error);
      setIsPlaying(false);
      console.error('Error starting stream:', error);
    }
  };
  // const cleanerON = async () => {
  //   try {
  //     const response = await fetch('http://localhost:8080/cleaner', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //     const data = await response.json();
  //     setIsPlaying(!!data);
  //   } catch (error) {
  //     alert(error);
  //     setIsPlaying(false);
  //     console.error('Error starting stream:', error);
  //   }
  // };


  const play = () => {
    setIsPlaying(!isPlaying)
    //  cleanerON();
  };

  const checkServerLive = async () => {
    try {
      const response = await fetch(`${URL_DEFAULT}/on-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Server shut down:', error);
      console.error('Server shut down:', error);
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <h1>IP Camera Streaming</h1>
      URL: {URL_DEFAULT}/index.m3u8
      {isPlaying ?
      <ReactPlayer
        url={`${URL_DEFAULT}/videos/index.m3u8`}
        playing={isPlaying}
        style={{ border: '2px solid black' }}
      />
      : <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '600px',
          height: '350px',
          border: '2px solid black',
        }}>
          <button onClick={play}>{isPlaying ? 'Stop' : 'Play'}</button>
      </div>}
      <button onClick={startStream}>Start Stream</button>
      <button onClick={checkServerLive}>Check Server on live</button>
    </div>
  );
}

export default App;

